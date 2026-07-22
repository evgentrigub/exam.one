#!/usr/bin/env bash
# Download Kikiri German Victoria model + voicepack for the female TTS sidecar.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
TARGET_DIR="${ROOT_DIR}/scripts/tts/victoria/models"
HF_BASE="https://huggingface.co/kikiri-tts/kikiri-german-victoria/resolve/main"

mkdir -p "${TARGET_DIR}/voices"

download_if_missing() {
  local url="$1"
  local dest="$2"
  if [[ -f "${dest}" ]]; then
    echo "[setup-victoria] Already present: ${dest}"
    return 0
  fi
  echo "[setup-victoria] Downloading $(basename "${dest}")…"
  curl -L --fail --retry 3 --retry-delay 2 "${url}" -o "${dest}"
}

download_if_missing \
  "${HF_BASE}/kikiri_german_victoria_ep10.pth" \
  "${TARGET_DIR}/kikiri_german_victoria_ep10.pth"

download_if_missing \
  "${HF_BASE}/voices/victoria.pt" \
  "${TARGET_DIR}/voices/victoria.pt"

# Kokoro config from the architecture repo (needed by KModel).
KOKORO_CFG_URL="https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/config.json"
download_if_missing "${KOKORO_CFG_URL}" "${TARGET_DIR}/config.json"

echo "[setup-victoria] Ready at ${TARGET_DIR}"
