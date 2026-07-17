#!/usr/bin/env bash
# Clone Kokoro German Martin ONNX sources and download model weights for compose.tts.yaml.
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
  echo "[setup-kokoro] Downloading model files from Hugging Face…"
  if [[ -x scripts/download-model-files.sh ]]; then
    sh scripts/download-model-files.sh
  else
    curl -L "${HF_BASE}/kokoro-martin.onnx" -o kokoro-martin.onnx
    curl -L "${HF_BASE}/voices-martin.npz" -o voices-martin.npz
  fi
else
  echo "[setup-kokoro] Model files already present"
fi

echo "[setup-kokoro] Ready. Start TTS with:"
echo "  docker compose -f compose.tts.yaml up -d --build --wait"
