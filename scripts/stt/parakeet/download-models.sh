#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
TARGET_DIR="${ROOT_DIR}/scripts/stt/parakeet/models"
MODEL_ID="${STT_MODEL:-nvidia/parakeet-tdt-0.6b-v3}"
COMPLETE_FILE="${TARGET_DIR}/.complete"

snapshot_is_complete() {
  [[ -f "${TARGET_DIR}/config.json" ]] \
    && [[ -f "${TARGET_DIR}/generation_config.json" ]] \
    && [[ -f "${TARGET_DIR}/processor_config.json" ]] \
    && [[ -f "${TARGET_DIR}/tokenizer.json" ]] \
    && [[ -f "${TARGET_DIR}/tokenizer_config.json" ]] \
    && [[ -f "${TARGET_DIR}/model.safetensors" ]]
}

if [[ -f "${COMPLETE_FILE}" ]] \
  && [[ "$(<"${COMPLETE_FILE}")" == "${MODEL_ID}" ]] \
  && snapshot_is_complete; then
  echo "[stt] Parakeet snapshot already present at ${TARGET_DIR}"
  exit 0
fi

mkdir -p "${TARGET_DIR}"
rm -f "${COMPLETE_FILE}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[stt] ERROR: Docker is required to download and run local Parakeet." >&2
  exit 1
fi

echo "[stt] Downloading ${MODEL_ID} to ${TARGET_DIR}"
docker run --rm \
  -e HF_HUB_DISABLE_XET=1 \
  -v "${TARGET_DIR}:/models" \
  python:3.12-slim \
  sh -c 'pip install --quiet "huggingface-hub>=0.34,<2" && hf download "$1" --local-dir /models --include "*.json" --include "*.safetensors"' \
  -- "${MODEL_ID}"

if ! snapshot_is_complete; then
  echo "[stt] ERROR: Parakeet snapshot verification failed in ${TARGET_DIR}" >&2
  exit 1
fi

printf '%s\n' "${MODEL_ID}" > "${COMPLETE_FILE}"
echo "[stt] Parakeet snapshot ready at ${TARGET_DIR}"
