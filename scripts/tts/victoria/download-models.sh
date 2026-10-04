#!/usr/bin/env bash
# Download the TTS voices for each language in KOKORO_LANGS (default: en) into ./models.
# The voice list, URLs and sizes live in voice-manifest.json; download_models.py does the work.
#   de: Kikiri Stage-2 martin + victoria and the multi-speaker base for bernd / eva
#   en: base Kokoro-82M v1.0 with bf_emma, bf_isabella, bm_george, bm_fable
#   es: the same base model with ef_dora, em_alex, em_santa
#   pl: Piper voices gosia, darkman (CC0) and bass (Apache-2.0)
# More voices can be downloaded later in Settings → Generated files → Voice models.
set -euo pipefail

export KOKORO_LANGS="${KOKORO_LANGS:-en}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v python3 >/dev/null 2>&1; then
  echo "[setup-voices] python3 is required to download the TTS voices" >&2
  exit 1
fi

exec python3 "${SCRIPT_DIR}/download_models.py" --target "${SCRIPT_DIR}/models"
