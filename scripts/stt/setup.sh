#!/usr/bin/env bash
# Run checksum-verified setup with the Python bundled in the STT image.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"
mkdir -p scripts/stt/models
exec docker compose run --rm --no-deps --build -T \
  --user "$(id -u):$(id -g)" speech-to-text python /app/setup.py "$@"
