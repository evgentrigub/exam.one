#!/usr/bin/env bash
# Download/verify selected TTS voices using Python inside the speech image.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${REPO_ROOT}"
mkdir -p scripts/tts/victoria/models
exec docker compose run --rm --no-deps --build -T \
  --user "$(id -u):$(id -g)" text-to-speech \
  python /app/download_models.py --target /app/models "$@"
