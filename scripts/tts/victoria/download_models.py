#!/usr/bin/env python3
"""
Download the TTS voices of the languages in KOKORO_LANGS (default: en) from voice-manifest.json.

  KOKORO_LANGS=en,de python3 scripts/tts/victoria/download_models.py
  python3 scripts/tts/victoria/download_models.py --voices pl_gosia,pl_bass

Files already present at their minimum size are skipped. Other voices can also be downloaded
later from the running app (Settings → Generated files → Voice models).
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from voice_catalog import VoiceCatalog

ROOT = Path(__file__).resolve().parent


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--langs", default=os.getenv("KOKORO_LANGS", "en"), help="comma-separated languages")
    parser.add_argument("--voices", default="", help="comma-separated voice ids (overrides --langs)")
    parser.add_argument("--target", default=str(ROOT / "models"), help="model directory")
    args = parser.parse_args()

    catalog = VoiceCatalog(Path(args.target))
    if args.voices.strip():
        voice_ids = [voice.strip() for voice in args.voices.split(",") if voice.strip()]
    else:
        langs = {lang.strip().lower() for lang in args.langs.split(",") if lang.strip()}
        voice_ids = catalog.voices_for_langs(langs)

    for voice_id in voice_ids:
        voice = catalog.voice(voice_id)
        if catalog.installed(voice_id):
            print(f"[setup-voices] Already present: {voice_id} ({voice.lang})", flush=True)
            continue
        megabytes = catalog.download_bytes(voice_id) / 1_000_000
        print(f"[setup-voices] Downloading {voice_id} ({voice.lang}, {megabytes:.1f} MB)…", flush=True)
        catalog.install(voice_id)

    print(f"[setup-voices] Ready at {args.target}: {', '.join(catalog.installed_voices()) or 'no voices'}", flush=True)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as err:
        print(f"[setup-voices] ERROR: {err}", file=sys.stderr)
        sys.exit(1)
