import hashlib
import io
import json
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from catalog import Catalog
from runtime import Runtime


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.data = b"verified model"
        self.manifest = {"recommended": {"en": "phonon-2", "de": "parakeet-v3-q4", "pl": "parakeet-v3-q4", "es": "parakeet-v3-q4"}, "models": [
            {"id": key, "file": key, "name": key, "engine": "test", "languages": langs, "license": "test", "downloadBytes": len(self.data), "sha256": hashlib.sha256(self.data).hexdigest(), "url": "https://example.invalid/model"}
            for key, langs in [("phonon-2", ["en"]), ("parakeet-v3-q4", ["en", "de", "pl", "es"]), ("parakeet-v3-q8", ["en", "de", "pl", "es"])]]}
        self.manifest["models"][-1]["downloadable"] = False
        self.catalog = Catalog(self.root / "models", manifest=self.manifest)

    def tearDown(self):
        self.temp.cleanup()

    def install(self, model_id):
        path = self.catalog.path(model_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(self.data)

    def wait(self):
        deadline = time.monotonic() + 3
        while self.catalog.jobs and time.monotonic() < deadline:
            time.sleep(.01)
        self.assertFalse(self.catalog.jobs)

    def test_fresh_language_routing_and_legacy_api_alias(self):
        self.assertEqual(self.catalog.resolve("en")["id"], "phonon-2")
        self.assertEqual(self.catalog.resolve("en", "parakeet-v3-q8")["id"], "parakeet-v3-q8")
        for lang in ["de", "pl", "es"]:
            self.assertEqual(self.catalog.resolve(lang)["id"], "parakeet-v3-q4")
        with self.assertRaises(ValueError):
            self.catalog.resolve("de", "phonon-2")

    def test_preference_survives_restart_and_removal_without_fallback(self):
        self.install("parakeet-v3-q4")
        self.catalog.prefer("en", "parakeet-v3-q4")
        self.catalog.remove("parakeet-v3-q4")
        restarted = Catalog(self.catalog.root, manifest=self.manifest)
        self.assertEqual(restarted.resolve("en")["id"], "parakeet-v3-q4")
        self.assertFalse(restarted.installed("parakeet-v3-q4"))

    def test_shared_bytes_are_counted_once(self):
        self.install("parakeet-v3-q4")
        for lang in ["en", "de", "pl", "es"]:
            self.catalog.prefer(lang, "parakeet-v3-q4")
        self.assertEqual(self.catalog.snapshot()["installedBytes"], len(self.data))

    def test_legacy_adoption_preserves_source_and_all_languages(self):
        legacy = self.root / "old.gguf"
        legacy.write_bytes(self.data)
        adopted = Catalog(self.root / "adopted", manifest=self.manifest, legacy=legacy)
        self.assertTrue(adopted.installed("parakeet-v3-q8"))
        self.assertTrue(legacy.exists())
        self.assertEqual(adopted.resolve("en")["id"], "parakeet-v3-q8")

    def test_verified_download_and_bad_checksum(self):
        with patch("urllib.request.urlopen", return_value=io.BytesIO(self.data)):
            self.catalog.download("phonon-2")
            self.wait()
        self.assertTrue(self.catalog.installed("phonon-2"))
        self.catalog.remove("phonon-2")
        with patch("urllib.request.urlopen", return_value=io.BytesIO(b"corrupt")):
            self.catalog.download("phonon-2")
            self.wait()
        self.assertFalse(self.catalog.installed("phonon-2"))
        self.assertEqual(self.catalog.progress["phonon-2"]["state"], "failed")

    def test_verified_installation_preserves_bundled_attribution(self):
        (self.root / "upstream-notice.txt").write_text("Upstream attribution")
        self.catalog.models["phonon-2"]["notices"] = [{"source": "upstream-notice.txt", "path": "NOTICE"}]
        with patch("catalog.MANIFEST_PATH", self.root / "model-manifest.json"), patch("urllib.request.urlopen", return_value=io.BytesIO(self.data)):
            self.catalog.download("phonon-2")
            self.wait()
        self.assertEqual((self.catalog.path("phonon-2").parent / "NOTICE").read_text(), "Upstream attribution")

    def test_cancel_is_atomic_and_releases_download(self):
        started, release = threading.Event(), threading.Event()
        data = self.data
        class Slow(io.BytesIO):
            def read(self, size=-1):
                started.set()
                release.wait(2)
                return super().read(size)
        with patch("urllib.request.urlopen", return_value=Slow(data)):
            self.catalog.download("phonon-2")
            self.assertTrue(started.wait(2))
            self.catalog.cancel("phonon-2")
            release.set()
            self.wait()
        self.assertFalse(self.catalog.installed("phonon-2"))
        self.assertFalse(list(self.catalog.root.glob("*/*.partial")))

    def test_restart_discards_partial_and_corrupt_preferences_fail_closed(self):
        partial = self.catalog.path("phonon-2").with_suffix(".partial")
        partial.parent.mkdir()
        partial.write_bytes(b"partial")
        Catalog(self.catalog.root, manifest=self.manifest)
        self.assertFalse(partial.exists())
        self.catalog.state_path.write_text("invalid json")
        with self.assertRaises(json.JSONDecodeError):
            Catalog(self.catalog.root, manifest=self.manifest)

    def test_active_runtime_prevents_removal(self):
        self.install("phonon-2")
        runtime = Runtime(self.catalog)
        with runtime.lock:
            with self.assertRaises(RuntimeError):
                runtime.remove("phonon-2")
        self.assertTrue(self.catalog.installed("phonon-2"))
        runtime.close()

    def test_fresh_setup_downloads_only_english_model(self):
        import setup
        with patch.object(setup, "ROOT", self.root), patch.object(setup, "Catalog", return_value=self.catalog), patch.dict("os.environ", {}, clear=True), patch("sys.argv", ["setup.py"]), patch("urllib.request.urlopen", return_value=io.BytesIO(self.data)), patch("sys.stdout", new_callable=io.StringIO):
            setup.main()
        self.assertTrue(self.catalog.installed("phonon-2"))
        for model_id in ["parakeet-v3-q4", "parakeet-v3-q8"]:
            self.assertFalse(self.catalog.path(model_id).exists())

    def test_existing_q8_preferences_survive_new_q4_recommendation(self):
        self.install("parakeet-v3-q8")
        for lang in ["de", "pl", "es"]:
            self.catalog.preferences[lang] = "parakeet-v3-q8"
        self.catalog.save()
        restarted = Catalog(self.catalog.root, manifest=self.manifest)
        for lang in ["de", "pl", "es"]:
            self.assertEqual(restarted.resolve(lang)["id"], "parakeet-v3-q8")
        self.assertFalse(restarted.path("parakeet-v3-q4").exists())

    def test_multilingual_setup_downloads_q4_once_without_q8(self):
        import setup
        with patch.object(setup, "ROOT", self.root), patch.object(setup, "Catalog", return_value=self.catalog), patch.dict("os.environ", {"STT_SETUP_LANGS": "de,pl,es"}, clear=True), patch("sys.argv", ["setup.py"]), patch("urllib.request.urlopen", return_value=io.BytesIO(self.data)) as download, patch("sys.stdout", new_callable=io.StringIO):
            setup.main()
        download.assert_called_once()
        self.assertTrue(self.catalog.installed("parakeet-v3-q4"))
        self.assertFalse(self.catalog.path("parakeet-v3-q8").exists())
        self.assertFalse(self.catalog.path("phonon-2").exists())

    def test_fresh_catalog_offers_only_two_curated_downloads(self):
        rows = self.catalog.snapshot()["models"]
        self.assertEqual([row["id"] for row in rows], ["phonon-2", "parakeet-v3-q4"])
        self.assertEqual(rows[0]["recommendedLanguages"], ["en"])
        self.assertEqual(rows[1]["recommendedLanguages"], ["de", "pl", "es"])
        with patch("urllib.request.urlopen") as download:
            with self.assertRaises(ValueError):
                self.catalog.download("parakeet-v3-q8")
        download.assert_not_called()

    def test_retired_installed_model_remains_usable_and_removable_only(self):
        self.install("parakeet-v3-q8")
        self.catalog.preferences["de"] = "parakeet-v3-q8"
        self.catalog.save()
        self.assertEqual(self.catalog.resolve("de")["id"], "parakeet-v3-q8")
        row = next(row for row in self.catalog.snapshot()["models"] if row["id"] == "parakeet-v3-q8")
        self.assertFalse(row["downloadable"])
        self.assertEqual(row["installedBytes"], len(self.data))
        self.catalog.download("parakeet-v3-q8")  # Already installed: setup remains usable.
        with self.assertRaises(ValueError):
            self.catalog.prefer("en", "parakeet-v3-q8")
        self.catalog.remove("parakeet-v3-q8")
        with self.assertRaises(ValueError):
            self.catalog.download("parakeet-v3-q8")
        # Preserve missing selections until the operator explicitly picks a current model.
        self.assertEqual(self.catalog.resolve("de")["id"], "parakeet-v3-q8")

    def test_removed_environment_override_does_not_change_setup_selection(self):
        import setup
        with patch.object(setup, "ROOT", self.root), patch.object(setup, "Catalog", return_value=self.catalog), patch.dict("os.environ", {"STT_MODEL": "parakeet-v3-q8"}, clear=True), patch("sys.argv", ["setup.py"]), patch("urllib.request.urlopen", return_value=io.BytesIO(self.data)), patch("sys.stdout", new_callable=io.StringIO):
            setup.main()
        self.assertTrue(self.catalog.installed("phonon-2"))
        self.assertFalse(self.catalog.path("parakeet-v3-q8").exists())

    def test_idle_worker_teardown_releases_process_but_not_an_active_request(self):
        runtime = Runtime.__new__(Runtime)
        runtime.lock = threading.Lock()
        runtime.closed = Mock()
        runtime.closed.wait.side_effect = [False, True]
        runtime.process = Mock()
        process = runtime.process
        runtime.model_id = "phonon-2"
        runtime.last_used = time.monotonic() - 301
        with runtime.lock:
            runtime._reap()
        process.terminate.assert_not_called()
        runtime.closed.wait.side_effect = [False, True]
        runtime._reap()
        process.terminate.assert_called_once()
        self.assertIsNone(runtime.process)


if __name__ == "__main__":
    unittest.main()
