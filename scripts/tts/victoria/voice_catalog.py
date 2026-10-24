"""
The downloadable TTS voices and their files, from voice-manifest.json. Standard library only,
so the host download script and the tests can use it without torch.

A voice is installed when every file it needs is on disk at its minimum size. Voices share
files (the Kokoro backbones, config.json); a shared file is downloaded once and deleted only
when no other installed voice still needs it.
"""

from __future__ import annotations

import json
import threading
import time
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

MANIFEST_PATH = Path(__file__).with_name("voice-manifest.json")
CHUNK_BYTES = 1 << 20
DOWNLOAD_RETRIES = 3


@dataclass(frozen=True)
class ModelFile:
    key: str
    url: str
    path: str
    bytes: int
    min_bytes: int


@dataclass(frozen=True)
class VoiceEntry:
    id: str
    lang: str
    name: str
    gender: str
    accent: str | None
    quality: str
    engine: str
    backbone: str
    remap: bool
    model: str
    voice: str
    shared: tuple[str, ...]

    @property
    def file_keys(self) -> tuple[str, ...]:
        return (self.model, self.voice, *self.shared)


@dataclass(frozen=True)
class Manifest:
    files: dict[str, ModelFile]
    voices: dict[str, VoiceEntry]  # registry order


class CatalogError(ValueError):
    """An unknown voice, or a file path that would leave the model directory."""


class DownloadCancelled(Exception):
    pass


def load_manifest(path: Path = MANIFEST_PATH) -> Manifest:
    raw = json.loads(path.read_text(encoding="utf-8"))
    files = {
        key: ModelFile(key, entry["url"], entry["path"], int(entry["bytes"]), int(entry["minBytes"]))
        for key, entry in raw["files"].items()
    }
    voices: dict[str, VoiceEntry] = {}
    for entry in raw["voices"]:
        voice = VoiceEntry(
            id=entry["id"],
            lang=entry["lang"],
            name=entry["name"],
            gender=entry["gender"],
            accent=entry.get("accent"),
            quality=entry["quality"],
            engine=entry["engine"],
            backbone=entry["backbone"],
            remap=bool(entry.get("remap", False)),
            model=entry["model"],
            voice=entry["voice"],
            shared=tuple(entry.get("shared", [])),
        )
        missing = [key for key in voice.file_keys if key not in files]
        if missing:
            raise CatalogError(f"Voice {voice.id} names unknown files: {missing}")
        voices[voice.id] = voice
    for model_file in files.values():
        contained_path(Path("/models"), model_file.path)
    return Manifest(files, voices)


def contained_path(root: Path, relative: str) -> Path:
    """`root / relative`, refusing absolute paths and anything that escapes `root`."""
    if not relative or Path(relative).is_absolute():
        raise CatalogError(f"Unsafe model path: {relative!r}")
    resolved_root = root.resolve()
    target = (resolved_root / relative).resolve()
    if target != resolved_root and resolved_root not in target.parents:
        raise CatalogError(f"Unsafe model path: {relative!r}")
    return target


@dataclass
class Progress:
    total_bytes: int
    received_bytes: int = 0
    state: str = "downloading"  # downloading | failed
    error: str | None = None
    cancel: threading.Event = field(default_factory=threading.Event)

    def as_dict(self) -> dict:
        percent = 100.0 if self.total_bytes <= 0 else min(100.0, self.received_bytes * 100.0 / self.total_bytes)
        return {
            "state": self.state,
            "receivedBytes": self.received_bytes,
            "totalBytes": self.total_bytes,
            "percent": round(percent, 1),
            **({"error": self.error} if self.error else {}),
        }


def fetch_to(url: str, target: Path, on_chunk: Callable[[int], None], cancel: threading.Event | None = None) -> None:
    """Stream `url` into `target` via `<target>.part`, then rename; retries transient failures."""
    target.parent.mkdir(parents=True, exist_ok=True)
    partial = target.with_name(target.name + ".part")
    last_error: Exception | None = None
    for attempt in range(1, DOWNLOAD_RETRIES + 1):
        received = 0
        try:
            with urllib.request.urlopen(url, timeout=60) as response, partial.open("wb") as out:
                while True:
                    if cancel is not None and cancel.is_set():
                        raise DownloadCancelled()
                    chunk = response.read(CHUNK_BYTES)
                    if not chunk:
                        break
                    out.write(chunk)
                    received += len(chunk)
                    on_chunk(len(chunk))
            partial.replace(target)
            return
        except DownloadCancelled:
            partial.unlink(missing_ok=True)
            on_chunk(-received)
            raise
        except Exception as err:  # network hiccup: give the bytes back and retry
            partial.unlink(missing_ok=True)
            on_chunk(-received)
            last_error = err
            if attempt < DOWNLOAD_RETRIES:
                time.sleep(2 * attempt)
    raise RuntimeError(f"Download failed for {url}: {last_error!r}")


class VoiceCatalog:
    """Installed state, sizes, downloads and deletion of the manifest's voices under `root`."""

    def __init__(
        self,
        root: Path,
        manifest: Manifest | None = None,
        on_installed: Callable[[str], None] | None = None,
        on_removing: Callable[[str], None] | None = None,
        fetch: Callable[..., None] = fetch_to,
    ) -> None:
        self.root = root
        self.manifest = manifest or load_manifest()
        self.on_installed = on_installed
        self.on_removing = on_removing
        self.fetch = fetch
        self.progress: dict[str, Progress] = {}
        self._state_lock = threading.Lock()
        self._file_locks: dict[str, threading.Lock] = {}

    # ---- queries -------------------------------------------------------------------------

    def voice(self, voice_id: str) -> VoiceEntry:
        voice = self.manifest.voices.get(voice_id)
        if voice is None:
            raise CatalogError(f"Unknown voice: {voice_id}")
        return voice

    def file_path(self, key: str) -> Path:
        return contained_path(self.root, self.manifest.files[key].path)

    def file_present(self, key: str) -> bool:
        path = self.file_path(key)
        try:
            return path.is_file() and path.stat().st_size >= self.manifest.files[key].min_bytes
        except OSError:
            return False

    def file_size(self, key: str) -> int:
        try:
            return self.file_path(key).stat().st_size
        except OSError:
            return self.manifest.files[key].bytes

    def installed(self, voice_id: str) -> bool:
        return all(self.file_present(key) for key in self.voice(voice_id).file_keys)

    def installed_voices(self) -> list[str]:
        return [voice_id for voice_id in self.manifest.voices if self.installed(voice_id)]

    def voices_for_langs(self, langs: set[str]) -> list[str]:
        return [voice.id for voice in self.manifest.voices.values() if voice.lang in langs]

    def download_bytes(self, voice_id: str) -> int:
        return sum(self.manifest.files[key].bytes for key in self.voice(voice_id).file_keys if not self.file_present(key))

    def installed_shares(self) -> dict[str, int]:
        """Bytes per installed voice, each shared file split evenly between its installed users,
        so the shares of a language add up to the bytes it occupies on disk."""
        installed = self.installed_voices()
        users: dict[str, list[str]] = {}
        for voice_id in installed:
            for key in self.voice(voice_id).file_keys:
                users.setdefault(key, []).append(voice_id)
        shares = {voice_id: 0 for voice_id in installed}
        for key, owners in users.items():
            size = self.file_size(key)
            for index, voice_id in enumerate(owners):
                shares[voice_id] += size // len(owners) + (1 if index < size % len(owners) else 0)
        return shares

    def describe(self) -> dict:
        shares = self.installed_shares()
        with self._state_lock:
            progress = {voice_id: entry.as_dict() for voice_id, entry in self.progress.items()}
        voices = []
        for voice in self.manifest.voices.values():
            installed = voice.id in shares
            voices.append(
                {
                    "id": voice.id,
                    "lang": voice.lang,
                    "name": voice.name,
                    "gender": voice.gender,
                    "accent": voice.accent,
                    "quality": voice.quality,
                    "installed": installed,
                    "sizeBytes": shares[voice.id] if installed else self.download_bytes(voice.id),
                    "progress": progress.get(voice.id),
                }
            )
        return {"voices": voices, "installedBytes": sum(shares.values())}

    # ---- downloads -----------------------------------------------------------------------

    def _file_lock(self, key: str) -> threading.Lock:
        with self._state_lock:
            return self._file_locks.setdefault(key, threading.Lock())

    def _add_received(self, voice_id: str, delta: int) -> None:
        with self._state_lock:
            entry = self.progress.get(voice_id)
            if entry is not None:
                entry.received_bytes = max(0, entry.received_bytes + delta)

    def install(self, voice_id: str, cancel: threading.Event | None = None) -> None:
        """Download every missing file of a voice (blocking), then report it installed."""
        voice = self.voice(voice_id)
        for key in voice.file_keys:
            with self._file_lock(key):
                if self.file_present(key):
                    continue
                self.fetch(
                    self.manifest.files[key].url,
                    self.file_path(key),
                    lambda delta: self._add_received(voice_id, delta),
                    cancel,
                )
                if not self.file_present(key):
                    self.file_path(key).unlink(missing_ok=True)
                    raise RuntimeError(f"{self.manifest.files[key].path} is smaller than expected")
        if self.on_installed is not None:
            self.on_installed(voice_id)

    def start_download(self, voice_id: str) -> dict:
        """Start a background download; a second request for the same voice is a no-op."""
        self.voice(voice_id)
        with self._state_lock:
            current = self.progress.get(voice_id)
            if current is not None and current.state == "downloading":
                return current.as_dict()
            entry = Progress(total_bytes=self.download_bytes(voice_id))
            self.progress[voice_id] = entry

        def run() -> None:
            try:
                self.install(voice_id, entry.cancel)
                with self._state_lock:
                    self.progress.pop(voice_id, None)
            except DownloadCancelled:
                with self._state_lock:
                    self.progress.pop(voice_id, None)
            except Exception as err:
                with self._state_lock:
                    entry.state = "failed"
                    entry.error = str(err)

        threading.Thread(target=run, name=f"voice-download-{voice_id}", daemon=True).start()
        return entry.as_dict()

    def cancel_download(self, voice_id: str) -> None:
        self.voice(voice_id)
        with self._state_lock:
            entry = self.progress.get(voice_id)
            if entry is None:
                return
            if entry.state == "downloading":
                entry.cancel.set()
            else:
                self.progress.pop(voice_id, None)

    # ---- deletion ------------------------------------------------------------------------

    def removable_files(self, voice_id: str) -> list[str]:
        """The voice's files that no other installed (or downloading) voice needs."""
        voice = self.voice(voice_id)
        with self._state_lock:
            downloading = [other for other, entry in self.progress.items() if entry.state == "downloading"]
        still_needed = {
            key
            for other in {*self.installed_voices(), *downloading}
            if other != voice_id
            for key in self.voice(other).file_keys
        }
        return [key for key in voice.file_keys if key not in still_needed]

    def remove(self, voice_id: str) -> int:
        """Unload and delete a voice; returns the bytes freed. Refused while it downloads."""
        with self._state_lock:
            entry = self.progress.get(voice_id)
            if entry is not None and entry.state == "downloading":
                raise CatalogError(f"Voice {voice_id} is downloading")
        if self.on_removing is not None:
            self.on_removing(voice_id)
        freed = 0
        for key in self.removable_files(voice_id):
            with self._file_lock(key):
                # A download of a voice sharing this file may have started since the first check.
                if key not in self.removable_files(voice_id):
                    continue
                path = self.file_path(key)
                if path.is_file():
                    freed += path.stat().st_size
                    path.unlink()
        return freed
