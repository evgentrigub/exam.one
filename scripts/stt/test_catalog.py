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
        self.manifest = {"retiredModelIds": ["parakeet-v3-q8", "nvidia/parakeet-tdt-0.6b-v3", "handy-computer/parakeet-tdt-0.6b-v3-gguf:Q8_0"], "recommended": {"en": "phonon-2", "de": "parakeet-v3-q4", "pl": "parakeet-v3-q4", "es": "parakeet-v3-q4"}, "models": [
            {"id": key, "file": key, "name": key, "engine": "test", "languages": langs, "license": "test", "downloadBytes": len(self.data), "sha256": hashlib.sha256(self.data).hexdigest(), "url": "https://example.invalid/model"}
            for key, langs in [("phonon-2", ["en"]), ("parakeet-v3-q4", ["en", "de", "pl", "es"])]]}
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

    def test_fresh_language_routing_rejects_retired_model(self):
        self.assertEqual(self.catalog.resolve("en")["id"], "phonon-2")
        with self.assertRaises(ValueError):
            self.catalog.resolve("en", "parakeet-v3-q8")
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

    def test_retired_preferences_migrate_with_or_without_files(self):
        for installed in [False, True]:
            for retired in self.manifest["retiredModelIds"]:
                with self.subTest(installed=installed, retired=retired):
                    root = self.root / (str(installed) + str(self.manifest["retiredModelIds"].index(retired)))
                    root.mkdir()
                    state = root / "preferences.json"
                    state.write_text(json.dumps({lang: retired for lang in ["en", "de", "pl", "es"]}))
                    old = root / "parakeet-v3-q8" / "old.gguf"
                    if installed:
                        old.parent.mkdir()
                        old.write_bytes(self.data)
                    with patch("urllib.request.urlopen") as download:
                        restarted = Catalog(root, manifest=self.manifest)
                    download.assert_not_called()
                    self.assertEqual(restarted.preferences, self.manifest["recommended"])
                    self.assertEqual(json.loads(state.read_text()), self.manifest["recommended"])
                    self.assertEqual([row["id"] for row in restarted.snapshot()["models"]], ["phonon-2", "parakeet-v3-q4"])
                    self.assertEqual(restarted.snapshot()["installedBytes"], len(self.data) if installed else 0)
                    self.assertEqual(old.exists(), installed)
                    self.assertFalse(restarted.installed("parakeet-v3-q4"))

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
        self.assertFalse(self.catalog.path("parakeet-v3-q4").exists())

    def test_english_setup_overrides_language_env_and_saved_multilingual_choice(self):
        import setup
        self.install("parakeet-v3-q4")
        self.catalog.prefer("en", "parakeet-v3-q4")
        with patch.object(setup, "ROOT", self.root), patch.object(setup, "Catalog", return_value=self.catalog), patch.dict("os.environ", {"STT_SETUP_LANGS": "de,pl,es"}, clear=True), patch("sys.argv", ["setup.py", "--languages", "en"]), patch("urllib.request.urlopen", return_value=io.BytesIO(self.data)) as download, patch("sys.stdout", new_callable=io.StringIO):
            setup.main()
        download.assert_called_once()
        self.assertTrue(self.catalog.installed("phonon-2"))
        self.assertEqual(self.catalog.resolve("en")["id"], "phonon-2")
        self.assertTrue(self.catalog.installed("parakeet-v3-q4"))

    def test_setup_verify_never_downloads_or_changes_current_preferences(self):
        import setup
        self.install("parakeet-v3-q4")
        self.catalog.prefer("en", "parakeet-v3-q4")
        with patch.object(setup, "ROOT", self.root), patch.object(setup, "Catalog", return_value=self.catalog), patch.dict("os.environ", {}, clear=True), patch("sys.argv", ["setup.py", "--verify"]), patch("urllib.request.urlopen") as download:
            with self.assertRaises(SystemExit):
                setup.main()
        download.assert_not_called()
        self.assertEqual(self.catalog.resolve("en")["id"], "parakeet-v3-q4")

    def test_unknown_preferences_are_not_silently_replaced(self):
        self.catalog.preferences["en"] = "custom-unavailable-model"
        self.catalog.save()
        restarted = Catalog(self.catalog.root, manifest=self.manifest)
        self.assertEqual(restarted.preferences["en"], "custom-unavailable-model")
        with self.assertRaises(ValueError):
            restarted.resolve("en")

    def test_multilingual_setup_downloads_q4_once_without_q8(self):
        import setup
        with patch.object(setup, "ROOT", self.root), patch.object(setup, "Catalog", return_value=self.catalog), patch.dict("os.environ", {"STT_SETUP_LANGS": "de,pl,es"}, clear=True), patch("sys.argv", ["setup.py"]), patch("urllib.request.urlopen", return_value=io.BytesIO(self.data)) as download, patch("sys.stdout", new_callable=io.StringIO):
            setup.main()
        download.assert_called_once()
        self.assertTrue(self.catalog.installed("parakeet-v3-q4"))
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

    def test_removed_environment_override_does_not_change_setup_selection(self):
        import setup
        with patch.object(setup, "ROOT", self.root), patch.object(setup, "Catalog", return_value=self.catalog), patch.dict("os.environ", {"STT_MODEL": "parakeet-v3-q8"}, clear=True), patch("sys.argv", ["setup.py"]), patch("urllib.request.urlopen", return_value=io.BytesIO(self.data)), patch("sys.stdout", new_callable=io.StringIO):
            setup.main()
        self.assertTrue(self.catalog.installed("phonon-2"))

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
