#!/usr/bin/env bash
# Clone Kokoro German Martin ONNX + multi-voice PyTorch models (victoria/bernd/eva).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
TARGET_DIR="${ROOT_DIR}/scripts/tts/kokoro-german"
REPO_URL="https://github.com/Godelaune/Kokoro-82M-ONNX-German-Martin.git"
HF_BASE="https://huggingface.co/Godelaune/Kokoro-82M-ONNX-German-Martin/resolve/main"

mkdir -p "$(dirname "$TARGET_DIR")"

if [[ ! -d "$TARGET_DIR/.git" ]]; then
  echo "[setup-kokoro] Cloning ${REPO_URL}"
  rm -rf "$TARGET_DIR"
  git clone --depth 1 "$REPO_URL" "$TARGET_DIR"
else
  echo "[setup-kokoro] Repo already present at ${TARGET_DIR}"
fi

cd "$TARGET_DIR"

if [[ ! -f kokoro-martin.onnx || ! -f voices-martin.npz ]]; then
  echo "[setup-kokoro] Downloading Martin model files from Hugging Face…"
  if [[ -x scripts/download-model-files.sh ]]; then
    sh scripts/download-model-files.sh
  else
    curl -L "${HF_BASE}/kokoro-martin.onnx" -o kokoro-martin.onnx
    curl -L "${HF_BASE}/voices-martin.npz" -o voices-martin.npz
  fi
else
  echo "[setup-kokoro] Martin model files already present"
fi

echo "[setup-kokoro] Downloading multi-voice models (victoria / bernd / eva)…"
bash "${ROOT_DIR}/scripts/tts/victoria/download-models.sh"

echo "[setup-kokoro] Ready. Four-voice TTS:"
echo "  martin   → :8881 (ONNX)"
echo "  victoria → :8882 (Stage-2)"
echo "  bernd    → :8882 (base + voicepack)"
echo "  eva      → :8882 (base + voicepack)"
echo "Start with: pnpm tts:up"
echo "Stop with:  pnpm tts:down"
