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
    parser.add_argument("--languages", help="Comma-separated setup languages; overrides STT_SETUP_LANGS")
    args = parser.parse_args()
    env_file = ROOT / ".env"
    if env_file.is_file():
        for line in env_file.read_text().splitlines():
            key, separator, value = line.partition("=")
            if separator and key.strip() in {"STT_MODEL_DIR", "STT_SETUP_LANGS"}:
                os.environ.setdefault(key.strip(), value.split(" #", 1)[0].strip().strip("\"'"))
    root = Path(os.environ.get("STT_MODEL_DIR", ROOT / "scripts/stt/models"))
    catalog = Catalog(root)
    languages = [lang.strip() for lang in (args.languages or os.environ.get("STT_SETUP_LANGS", "en")).split(",") if lang.strip()]
    if not languages or any(lang not in catalog.manifest["recommended"] for lang in languages):
        parser.error("Choose supported setup languages: " + ",".join(catalog.manifest["recommended"]))
    selected = {catalog.manifest["recommended"][lang] for lang in languages}
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
    if not args.verify:
        for language in languages:
            catalog.prefer(language, catalog.manifest["recommended"][language])
    print("[stt] Recommended speech models verified for: " + ", ".join(languages))


if __name__ == "__main__":
    main()
