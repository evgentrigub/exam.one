"""Selective, checksum-verified setup. Requires only the Python standard library."""
import argparse
import os
import time
from pathlib import Path

from catalog import Catalog

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parents[1] if SCRIPT_DIR.name == "stt" else SCRIPT_DIR


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    env_file = ROOT / ".env"
    if env_file.is_file():
        for line in env_file.read_text().splitlines():
            key, separator, value = line.partition("=")
            if separator and key.strip() in {"STT_MODEL_DIR", "STT_SETUP_LANGS"}:
                os.environ.setdefault(key.strip(), value.split(" #", 1)[0].strip().strip("\"'"))
    root = Path(os.environ.get("STT_MODEL_DIR", ROOT / "scripts/stt/models"))
    catalog = Catalog(root, legacy=Path(os.environ.get("STT_LEGACY_MODEL", ROOT / "scripts/stt/parakeet/models/parakeet-tdt-0.6b-v3-Q8_0.gguf")))
    languages = [lang.strip() for lang in os.environ.get("STT_SETUP_LANGS", "en").split(",") if lang.strip()]
    selected = {catalog.resolve(lang)["id"] for lang in languages}
    for model_id in sorted(selected):
        if args.verify:
            if not catalog.installed(model_id):
                raise SystemExit(f"[stt] Missing or invalid {model_id}; run pnpm stt:setup")
        else:
            print(f"[stt] Preparing {model_id}", flush=True)
            catalog.download(model_id)
            while model_id in catalog.jobs:
                time.sleep(0.2)
            if not catalog.installed(model_id):
                raise SystemExit(catalog.progress.get(model_id, {}).get("error", "Download cancelled"))
    print("[stt] Selected speech models verified.")


if __name__ == "__main__":
    main()
