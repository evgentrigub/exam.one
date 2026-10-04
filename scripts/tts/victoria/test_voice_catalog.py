"""Tests for voice_catalog (standard library only): python3 -m unittest test_voice_catalog"""

from __future__ import annotations

import tempfile
import threading
import unittest
from pathlib import Path

from voice_catalog import CatalogError, VoiceCatalog, contained_path, load_manifest

MANIFEST = load_manifest()


def write_file(root: Path, key: str, size: int | None = None) -> None:
    entry = MANIFEST.files[key]
    path = root / entry.path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"\0" * (size if size is not None else entry.min_bytes))


def install_files(root: Path, voice_id: str) -> None:
    for key in MANIFEST.voices[voice_id].file_keys:
        write_file(root, key)


def fake_fetch(url: str, target: Path, on_chunk, cancel=None) -> None:
    entry = next(entry for entry in MANIFEST.files.values() if entry.url == url)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(b"\0" * entry.min_bytes)
    on_chunk(entry.min_bytes)


class ManifestTest(unittest.TestCase):
    def test_every_voice_names_known_files_inside_the_model_dir(self) -> None:
        self.assertEqual(len(MANIFEST.voices), 14)
        for voice in MANIFEST.voices.values():
            for key in voice.file_keys:
                self.assertIn(key, MANIFEST.files)
        langs = {voice.lang for voice in MANIFEST.voices.values()}
        self.assertEqual(langs, {"de", "en", "es", "pl"})

    def test_contained_path_refuses_escapes(self) -> None:
        root = Path(tempfile.mkdtemp())
        self.assertEqual(contained_path(root, "voices/a.pt"), (root / "voices/a.pt").resolve())
        for unsafe in ("../x.pt", "/etc/passwd", "voices/../../x", ""):
            with self.assertRaises(CatalogError):
                contained_path(root, unsafe)


class CatalogTest(unittest.TestCase):
    def setUp(self) -> None:
        self.root = Path(tempfile.mkdtemp())
        self.installed: list[str] = []
        self.removed: list[str] = []
        self.catalog = VoiceCatalog(
            self.root,
            MANIFEST,
            on_installed=self.installed.append,
            on_removing=self.removed.append,
            fetch=fake_fetch,
        )

    def test_installed_requires_every_file_at_minimum_size(self) -> None:
        install_files(self.root, "bf_emma")
        self.assertTrue(self.catalog.installed("bf_emma"))
        write_file(self.root, "voice-bf_emma", size=10)
        self.assertFalse(self.catalog.installed("bf_emma"))

    def test_unknown_voice_is_refused(self) -> None:
        with self.assertRaises(CatalogError):
            self.catalog.voice("nope")

    def test_shared_files_are_split_so_shares_add_up_to_disk_usage(self) -> None:
        install_files(self.root, "bf_emma")
        install_files(self.root, "bm_george")
        shares = self.catalog.installed_shares()
        on_disk = sum(path.stat().st_size for path in self.root.rglob("*") if path.is_file())
        self.assertEqual(set(shares), {"bf_emma", "bm_george"})
        self.assertEqual(sum(shares.values()), on_disk)
        self.assertEqual(self.catalog.describe()["installedBytes"], on_disk)

    def test_download_bytes_skip_files_already_present(self) -> None:
        install_files(self.root, "bf_emma")
        expected = MANIFEST.files["voice-ef_dora"].bytes
        self.assertEqual(self.catalog.download_bytes("ef_dora"), expected)

    def test_removing_keeps_files_another_installed_voice_needs(self) -> None:
        install_files(self.root, "bf_emma")
        install_files(self.root, "ef_dora")
        self.assertEqual(self.catalog.removable_files("bf_emma"), ["voice-bf_emma"])
        freed = self.catalog.remove("bf_emma")
        self.assertEqual(freed, MANIFEST.files["voice-bf_emma"].min_bytes)
        self.assertEqual(self.removed, ["bf_emma"])
        self.assertTrue(self.catalog.installed("ef_dora"))
        self.catalog.remove("ef_dora")
        self.assertEqual([p for p in self.root.rglob("*") if p.is_file()], [])

    def test_install_downloads_missing_files_and_reports_it(self) -> None:
        self.catalog.install("pl_gosia")
        self.assertTrue(self.catalog.installed("pl_gosia"))
        self.assertEqual(self.installed, ["pl_gosia"])

    def test_background_download_clears_progress_when_done(self) -> None:
        self.catalog.start_download("bm_fable")
        for thread in threading.enumerate():
            if thread.name == "voice-download-bm_fable":
                thread.join(timeout=5)
        self.assertTrue(self.catalog.installed("bm_fable"))
        self.assertNotIn("bm_fable", self.catalog.progress)

    def test_remove_is_refused_while_downloading(self) -> None:
        gate = threading.Event()

        def slow_fetch(url, target, on_chunk, cancel=None):
            gate.wait(timeout=5)
            fake_fetch(url, target, on_chunk, cancel)

        self.catalog.fetch = slow_fetch
        self.catalog.start_download("pl_bass")
        with self.assertRaises(CatalogError):
            self.catalog.remove("pl_bass")
        gate.set()


if __name__ == "__main__":
    unittest.main()
