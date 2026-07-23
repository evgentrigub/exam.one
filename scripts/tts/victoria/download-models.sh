#!/usr/bin/env bash
# Download Kikiri Victoria Stage-2, Hui multi-speaker base, and bernd/eva voicepacks.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
TARGET_DIR="${ROOT_DIR}/scripts/tts/victoria/models"
HF_VICTORIA="https://huggingface.co/kikiri-tts/kikiri-german-victoria/resolve/main"
HF_BASE="https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic/resolve/main"
HF_KOKORO_CFG="https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/config.json"
R1DI_VOICES="https://raw.githubusercontent.com/r1di/kokoro-fastapi-german/master/api/src/voices/v1_0"

mkdir -p "${TARGET_DIR}/voices"

download_if_missing() {
  local url="$1"
  local dest="$2"
  if [[ -f "${dest}" ]]; then
    echo "[setup-voices] Already present: ${dest}"
    return 0
  fi
  echo "[setup-voices] Downloading $(basename "${dest}")…"
  curl -L --fail --retry 3 --retry-delay 2 "${url}" -o "${dest}"
}

# Victoria Stage-2 (primary female quality)
download_if_missing \
  "${HF_VICTORIA}/kikiri_german_victoria_ep10.pth" \
  "${TARGET_DIR}/kikiri_german_victoria_ep10.pth"
download_if_missing \
  "${HF_VICTORIA}/voices/victoria.pt" \
  "${TARGET_DIR}/voices/victoria.pt"

# Hui / kikiri multi-speaker base for bernd + eva
download_if_missing \
  "${HF_BASE}/kikiri_german_base_51spk_ep4.pth" \
  "${TARGET_DIR}/kikiri_german_base_51spk_ep4.pth"

# Recovered German voicepacks (Apache-2.0)
download_if_missing \
  "${R1DI_VOICES}/dm_bernd.pt" \
  "${TARGET_DIR}/voices/bernd.pt"
download_if_missing \
  "${R1DI_VOICES}/df_eva.pt" \
  "${TARGET_DIR}/voices/eva.pt"

download_if_missing "${HF_KOKORO_CFG}" "${TARGET_DIR}/config.json"

echo "[setup-voices] Ready at ${TARGET_DIR}"
echo "[setup-voices] Voices: victoria (Stage-2), bernd + eva (base + voicepacks)"
