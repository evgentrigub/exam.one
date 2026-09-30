#!/usr/bin/env bash
# Download the TTS models for each language in KOKORO_LANGS (default: de,en,pl).
#   de: Kikiri Stage-2 (martin + victoria), multi-speaker base, and bernd/eva packs.
#   en: base Kokoro-82M v1.0 and the British voices bf_emma, bf_isabella, bm_george, bm_fable.
#   pl: Piper voices gosia, darkman (CC0) and bass (Apache-2.0), ONNX + JSON config.
set -euo pipefail

KOKORO_LANGS="${KOKORO_LANGS:-de,en,pl}"
wants() { [[ ",${KOKORO_LANGS// /}," == *",$1,"* ]]; }

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
TARGET_DIR="${ROOT_DIR}/scripts/tts/victoria/models"
HF_MARTIN="https://huggingface.co/kikiri-tts/kikiri-german-martin/resolve/main"
HF_VICTORIA="https://huggingface.co/kikiri-tts/kikiri-german-victoria/resolve/main"
HF_BASE="https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic/resolve/main"
HF_KOKORO="https://huggingface.co/hexgrad/Kokoro-82M/resolve/main"
HF_KOKORO_CFG="${HF_KOKORO}/config.json"
R1DI_VOICES="https://raw.githubusercontent.com/r1di/kokoro-fastapi-german/master/api/src/voices/v1_0"
HF_PIPER_PL="https://huggingface.co/rhasspy/piper-voices/resolve/main/pl/pl_PL"

mkdir -p "${TARGET_DIR}/voices" "${TARGET_DIR}/piper"

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

if wants de; then
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
fi

if wants en; then
# Base Kokoro-82M v1.0 (Apache-2.0), one model for every British voice — ~312 MiB
download_if_missing \
  "${HF_KOKORO}/kokoro-v1_0.pth" \
  "${TARGET_DIR}/kokoro-v1_0.pth" \
  300000000
for voice in bf_emma bf_isabella bm_george bm_fable; do
  download_if_missing \
    "${HF_KOKORO}/voices/${voice}.pt" \
    "${TARGET_DIR}/voices/${voice}.pt" \
    400000
done
fi

if wants pl; then
# Piper Polish voices: gosia/darkman medium (~63 MB each), bass high (~114 MB)
for voice in gosia/medium/pl_PL-gosia-medium darkman/medium/pl_PL-darkman-medium bass/high/pl_PL-bass-high; do
  download_if_missing \
    "${HF_PIPER_PL}/${voice}.onnx" \
    "${TARGET_DIR}/piper/$(basename "${voice}").onnx" \
    50000000
  download_if_missing \
    "${HF_PIPER_PL}/${voice}.onnx.json" \
    "${TARGET_DIR}/piper/$(basename "${voice}").onnx.json" \
    1000
done
fi

download_if_missing "${HF_KOKORO_CFG}" "${TARGET_DIR}/config.json" 1000

echo "[setup-voices] Ready at ${TARGET_DIR} for ${KOKORO_LANGS}"
wants de && echo "[setup-voices] German: martin, bernd (male) · victoria, eva (female)"
wants en && echo "[setup-voices] English: bm_george, bm_fable (male) · bf_emma, bf_isabella (female)"
wants pl && echo "[setup-voices] Polish: pl_darkman, pl_bass (male) · pl_gosia (female)"
exit 0
