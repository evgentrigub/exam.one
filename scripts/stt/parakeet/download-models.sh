#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
TARGET_DIR="${ROOT_DIR}/scripts/stt/parakeet/models"
MODEL_FILE="parakeet-tdt-0.6b-v3-Q8_0.gguf"
MODEL_PATH="${TARGET_DIR}/${MODEL_FILE}"
MODEL_URL="https://huggingface.co/handy-computer/parakeet-tdt-0.6b-v3-gguf/resolve/main/${MODEL_FILE}"
MODEL_SHA256="5859f77944efcd8eafa23a6350731960b2b55b2203df51f319665c807d802cc7"
PARTIAL_PATH="${MODEL_PATH}.partial"
HF_CACHE_ROOT="${HF_HOME:-${XDG_CACHE_HOME:-${HOME}/.cache}/huggingface}"
HANDY_CACHE_DIR="${HF_CACHE_ROOT}/hub/models--handy-computer--parakeet-tdt-0.6b-v3-gguf/snapshots"

checksum() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    echo "[stt] ERROR: sha256sum or shasum is required to verify the model." >&2
    exit 1
  fi
}

model_is_valid() {
  [[ -f "${MODEL_PATH}" ]] && [[ "$(checksum "${MODEL_PATH}")" == "${MODEL_SHA256}" ]]
}

copy_without_duplication_when_possible() {
  local source="$1"
  local destination="$2"

  if ln "${source}" "${destination}" 2>/dev/null; then
    return 0
  fi
  if cp --reflink=auto "${source}" "${destination}" 2>/dev/null; then
    return 0
  fi
  if cp -c "${source}" "${destination}" 2>/dev/null; then
    return 0
  fi
  cp "${source}" "${destination}"
}

if model_is_valid; then
  echo "[stt] Handy Parakeet Q8 model already present at ${MODEL_PATH}"
  exit 0
fi

mkdir -p "${TARGET_DIR}"
rm -f "${PARTIAL_PATH}"
trap 'rm -f "${PARTIAL_PATH}"' EXIT

if [[ -f "${MODEL_PATH}" ]]; then
  echo "[stt] Existing model failed checksum verification; downloading a clean copy."
  rm -f "${MODEL_PATH}"
fi

for cached_model in "${HANDY_CACHE_DIR}"/*/"${MODEL_FILE}"; do
  [[ -f "${cached_model}" ]] || continue
  if [[ "$(checksum "${cached_model}")" != "${MODEL_SHA256}" ]]; then
    continue
  fi

  if command -v realpath >/dev/null 2>&1; then
    resolved_model="$(realpath "${cached_model}")"
    echo "[stt] Reusing the verified Handy model from the Hugging Face cache."
    copy_without_duplication_when_possible "${resolved_model}" "${MODEL_PATH}"
  else
    echo "[stt] Copying the verified Handy model from the Hugging Face cache."
    copy_without_duplication_when_possible "${cached_model}" "${MODEL_PATH}"
  fi
  if model_is_valid; then
    trap - EXIT
    echo "[stt] Handy Parakeet Q8 model ready at ${MODEL_PATH}"
    exit 0
  fi
  rm -f "${MODEL_PATH}"
done

if ! command -v curl >/dev/null 2>&1; then
  echo "[stt] ERROR: curl is required to download local Parakeet." >&2
  exit 1
fi

echo "[stt] Downloading ${MODEL_FILE} (~740 MB) from handy-computer"
curl \
  --location \
  --fail \
  --retry 3 \
  --retry-delay 2 \
  --continue-at - \
  --output "${PARTIAL_PATH}" \
  "${MODEL_URL}"

actual_sha256="$(checksum "${PARTIAL_PATH}")"
if [[ "${actual_sha256}" != "${MODEL_SHA256}" ]]; then
  echo "[stt] ERROR: Model checksum mismatch." >&2
  echo "[stt] Expected: ${MODEL_SHA256}" >&2
  echo "[stt] Actual:   ${actual_sha256}" >&2
  rm -f "${PARTIAL_PATH}"
  exit 1
fi

mv "${PARTIAL_PATH}" "${MODEL_PATH}"
trap - EXIT
echo "[stt] Handy Parakeet Q8 model ready at ${MODEL_PATH}"
