#!/usr/bin/env bash
# Download four-voice PyTorch German TTS models (martin / bernd / victoria / eva).
# Legacy Martin ONNX clone is optional and unused by pnpm tts:up.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "[setup-kokoro] Downloading four-voice PyTorch models…"
bash "${ROOT_DIR}/scripts/tts/victoria/download-models.sh"

if [[ "${SETUP_LEGACY_ONNX:-0}" == "1" ]]; then
  TARGET_DIR="${ROOT_DIR}/scripts/tts/kokoro-german"
  REPO_URL="https://github.com/Godelaune/Kokoro-82M-ONNX-German-Martin.git"
  HF_BASE="https://huggingface.co/Godelaune/Kokoro-82M-ONNX-German-Martin/resolve/main"

  mkdir -p "$(dirname "$TARGET_DIR")"
  if [[ ! -d "$TARGET_DIR/.git" ]]; then
    echo "[setup-kokoro] Cloning legacy Martin ONNX ${REPO_URL}"
    rm -rf "$TARGET_DIR"
    git clone --depth 1 "$REPO_URL" "$TARGET_DIR"
  else
    echo "[setup-kokoro] Legacy ONNX repo already present at ${TARGET_DIR}"
  fi

  cd "$TARGET_DIR"
  if [[ ! -f kokoro-martin.onnx || ! -f voices-martin.npz ]]; then
    echo "[setup-kokoro] Downloading legacy Martin ONNX files…"
    if [[ -x scripts/download-model-files.sh ]]; then
      sh scripts/download-model-files.sh
    else
      curl -L "${HF_BASE}/kokoro-martin.onnx" -o kokoro-martin.onnx
      curl -L "${HF_BASE}/voices-martin.npz" -o voices-martin.npz
    fi
  fi
fi

echo "[setup-kokoro] Ready. Four-voice PyTorch TTS on :8881:"
echo "  martin, bernd (male) · victoria, eva (female)"
echo "Start with: pnpm tts:up"
echo "Stop with:  pnpm tts:down"
