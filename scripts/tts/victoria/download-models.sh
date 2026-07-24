#!/usr/bin/env bash
# Download Kikiri Stage-2 (martin + victoria), multi-speaker base, and bernd/eva packs.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
TARGET_DIR="${ROOT_DIR}/scripts/tts/victoria/models"
HF_MARTIN="https://huggingface.co/kikiri-tts/kikiri-german-martin/resolve/main"
HF_VICTORIA="https://huggingface.co/kikiri-tts/kikiri-german-victoria/resolve/main"
HF_BASE="https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic/resolve/main"
HF_KOKORO_CFG="https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/config.json"
R1DI_VOICES="https://raw.githubusercontent.com/r1di/kokoro-fastapi-german/master/api/src/voices/v1_0"

mkdir -p "${TARGET_DIR}/voices"

download_if_missing() {
  local url="$1"
  local dest="$2"
  local min_bytes="${3:-0}"
  if [[ -f "${dest}" ]]; then
    local size
    size="$(wc -c < "${dest}" | tr -d ' ')"
    if [[ "${min_bytes}" -gt 0 && "${size}" -lt "${min_bytes}" ]]; then
      echo "[setup-voices] Truncated file (${size} < ${min_bytes} bytes), re-downloading: ${dest}"
      rm -f "${dest}"
    else
      echo "[setup-voices] Already present: ${dest}"
      return 0
    fi
  fi
  echo "[setup-voices] Downloading $(basename "${dest}")…"
  curl -L --fail --retry 3 --retry-delay 2 "${url}" -o "${dest}"
  if [[ "${min_bytes}" -gt 0 ]]; then
    local size
    size="$(wc -c < "${dest}" | tr -d ' ')"
    if [[ "${size}" -lt "${min_bytes}" ]]; then
      echo "[setup-voices] ERROR: ${dest} is only ${size} bytes (expected >= ${min_bytes})" >&2
      rm -f "${dest}"
      exit 1
    fi
  fi
}

# Martin Stage-2 (primary male) — ~312 MiB
download_if_missing \
  "${HF_MARTIN}/kikiri_german_martin_ep10.pth" \
  "${TARGET_DIR}/kikiri_german_martin_ep10.pth" \
  300000000
download_if_missing \
  "${HF_MARTIN}/voices/martin.pt" \
  "${TARGET_DIR}/voices/martin.pt" \
  400000

# Victoria Stage-2 (primary female) — ~312 MiB
download_if_missing \
  "${HF_VICTORIA}/kikiri_german_victoria_ep10.pth" \
  "${TARGET_DIR}/kikiri_german_victoria_ep10.pth" \
  300000000
download_if_missing \
  "${HF_VICTORIA}/voices/victoria.pt" \
  "${TARGET_DIR}/voices/victoria.pt" \
  400000

# Hui / kikiri multi-speaker base for bernd + eva — ~312 MiB
download_if_missing \
  "${HF_BASE}/kikiri_german_base_51spk_ep4.pth" \
  "${TARGET_DIR}/kikiri_german_base_51spk_ep4.pth" \
  300000000

# Recovered German voicepacks (Apache-2.0)
download_if_missing \
  "${R1DI_VOICES}/dm_bernd.pt" \
  "${TARGET_DIR}/voices/bernd.pt" \
  400000
download_if_missing \
  "${R1DI_VOICES}/df_eva.pt" \
  "${TARGET_DIR}/voices/eva.pt" \
  400000

download_if_missing "${HF_KOKORO_CFG}" "${TARGET_DIR}/config.json" 1000

echo "[setup-voices] Ready at ${TARGET_DIR}"
echo "[setup-voices] Voices: martin, bernd (male) · victoria, eva (female)"
