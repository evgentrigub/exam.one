"""Instance-wide STT assets. No inference imports or downloads on construction."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import threading
import urllib.request
from pathlib import Path
from typing import Any

MANIFEST_PATH = Path(__file__).with_name("model-manifest.json")


def digest(path: Path) -> str:
    sha = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            sha.update(block)
    return sha.hexdigest()


class Catalog:
    def __init__(self, root: Path, *, manifest: dict | None = None, legacy: Path | None = None):
        self.root = root
        root.mkdir(parents=True, exist_ok=True)
        self.manifest = manifest or json.loads(MANIFEST_PATH.read_text())
        self.models = {m["id"]: m for m in self.manifest["models"]}
        self.lock = threading.RLock()
        self.progress: dict[str, dict] = {}
        self.jobs: dict[str, threading.Event] = {}
        self.verified: dict[str, tuple[int, int, bool]] = {}
        self.state_path = root / "preferences.json"
        if self.state_path.exists():
            # Fail closed on a damaged preference file, instead of silently changing providers.
            self.preferences = json.loads(self.state_path.read_text())
            if not isinstance(self.preferences, dict):
                raise ValueError("Invalid STT preferences.json")
        else:
            self.preferences = dict(self.manifest["recommended"])
            if legacy is not None and "parakeet-v3-q8" in self.models:
                model = self.models["parakeet-v3-q8"]
                if legacy.is_file() and digest(legacy) == model["sha256"]:
                    destination = self.path(model["id"])
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    if not destination.exists():
                        try:
                            os.link(legacy, destination)
                        except OSError:
                            temporary = destination.with_suffix(".partial")
                            shutil.copyfile(legacy, temporary)
                            os.replace(temporary, destination)
                    self.preferences.update({lang: model["id"] for lang in model["languages"]})
                    self.write_notices(model["id"])
            self.save()
        # A killed download is retried explicitly; partial files never count as installed.
        for partial in root.glob("*/*.partial"):
            if partial.is_file():
                partial.unlink()

    def save(self) -> None:
        temporary = self.state_path.with_suffix(".tmp")
        temporary.write_text(json.dumps(self.preferences, indent=2) + "\n")
        os.replace(temporary, self.state_path)

    def write_notices(self, model_id: str) -> None:
        model = self.model(model_id)
        for notice in model.get("notices", []):
            destination = self.path(model_id).parent / notice["path"]
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(MANIFEST_PATH.parent / notice["source"], destination)

    def model(self, model_id: str) -> dict:
        for model in self.models.values():
            if model_id == model["id"] or model_id in model.get("aliases", []):
                return model
        raise ValueError("Unknown speech recognition model")

    def path(self, model_id: str) -> Path:
        model = self.model(model_id)
        return self.root / model["id"] / model["file"]

    def installed(self, model_id: str) -> bool:
        path = self.path(model_id)
        try:
            info = path.stat()
        except FileNotFoundError:
            return False
        key = (info.st_mtime_ns, info.st_size)
        with self.lock:
            cached = self.verified.get(model_id)
            if cached and cached[:2] == key:
                return cached[2]
            valid = info.st_size == self.model(model_id)["downloadBytes"] and digest(path) == self.model(model_id)["sha256"]
            self.verified[model_id] = (*key, valid)
            return valid

    def resolve(self, language: str, explicit: str = "") -> dict:
        with self.lock:
            model_id = explicit or self.preferences.get(language)
            if not model_id:
                raise ValueError(f"Speech recognition for {language} is unavailable")
            model = self.model(model_id)
            if language not in model["languages"]:
                raise ValueError(f"{model['name']} does not support {language}")
            return model

    def prefer(self, language: str, model_id: str) -> None:
        with self.lock:
            model = self.model(model_id)
            if language not in model["languages"]:
                raise ValueError("Model does not support this language")
            if model.get("downloadable") is False:
                raise ValueError("This legacy model is no longer selectable; use the recommended model")
            if not self.installed(model["id"]):
                raise ValueError("Install the model before selecting it")
            self.preferences[language] = model["id"]
            self.save()

    def snapshot(self) -> dict:
        with self.lock:
            rows = []
            for model_id, model in self.models.items():
                directory = self.path(model_id).parent
                size = sum(p.stat().st_size for p in directory.rglob("*") if p.is_file() and not p.name.endswith(".partial")) if directory.exists() else 0
                selected = [lang for lang, selected in self.preferences.items() if selected == model_id]
                downloadable = model.get("downloadable", True)
                # Retired assets remain visible only for existing installations/preferences.
                if not downloadable and not size and not selected:
                    continue
                rows.append({"downloadable": downloadable,
                             "recommendedLanguages": [lang for lang, recommended in self.manifest["recommended"].items() if recommended == model_id],
                             **{k: model[k] for k in ("id", "name", "engine", "languages", "license", "downloadBytes")},
                             "installed": self.installed(model_id), "installedBytes": size,
                             "selectedLanguages": selected,
                             "progress": self.progress.get(model_id)})
            return {"online": True, "manageable": True, "installedBytes": sum(row["installedBytes"] for row in rows), "models": rows}

    def download(self, model_id: str) -> None:
        model = self.model(model_id)
        with self.lock:
            if model_id in self.jobs or self.installed(model_id):
                return
            if model.get("downloadable") is False:
                raise ValueError("This legacy model is no longer downloadable; install the recommended model in Settings")
            cancel = threading.Event()
            self.jobs[model_id] = cancel
            self.progress[model_id] = {"state": "downloading", "receivedBytes": 0, "totalBytes": model["downloadBytes"], "percent": 0}
        threading.Thread(target=self._download, args=(model_id, cancel), daemon=True).start()

    def _download(self, model_id: str, cancel: threading.Event) -> None:
        model = self.model(model_id)
        destination = self.path(model_id)
        destination.parent.mkdir(parents=True, exist_ok=True)
        partial = destination.with_suffix(".partial")
        try:
            received = 0
            sha = hashlib.sha256()
            with urllib.request.urlopen(model["url"], timeout=30) as response, partial.open("wb") as target:
                while True:
                    if cancel.is_set():
                        return
                    block = response.read(256 * 1024)
                    if not block:
                        break
                    received += len(block)
                    if received > model["downloadBytes"]:
                        raise ValueError("Download exceeds pinned size")
                    sha.update(block)
                    target.write(block)
                    with self.lock:
                        self.progress[model_id].update(receivedBytes=received, percent=round(received * 100 / model["downloadBytes"], 1))
            if received != model["downloadBytes"] or sha.hexdigest() != model["sha256"]:
                raise ValueError("Speech model checksum verification failed")
            with self.lock:
                if not cancel.is_set():
                    self.write_notices(model_id)
                    os.replace(partial, destination)
                    self.verified.pop(model_id, None)
        except Exception as error:
            with self.lock:
                self.progress[model_id] = {"state": "failed", "receivedBytes": 0, "totalBytes": model["downloadBytes"], "percent": 0, "error": str(error)}
        finally:
            partial.unlink(missing_ok=True)
            with self.lock:
                self.jobs.pop(model_id, None)
                if self.progress.get(model_id, {}).get("state") != "failed" or cancel.is_set():
                    self.progress.pop(model_id, None)

    def cancel(self, model_id: str) -> None:
        self.model(model_id)
        with self.lock:
            if event := self.jobs.get(model_id):
                event.set()

    def remove(self, model_id: str) -> int:
        with self.lock:
            self.model(model_id)
            if model_id in self.jobs:
                raise ValueError("Cancel the download before removing the model")
            directory = self.path(model_id).parent
            size = sum(p.stat().st_size for p in directory.rglob("*") if p.is_file()) if directory.exists() else 0
            if directory.exists():
                shutil.rmtree(directory)
            self.verified.pop(model_id, None)
            # Preferences deliberately survive removal. No automatic fallback/download.
            return size
