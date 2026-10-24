#!/usr/bin/env bash
# Compatibility entry point: Python executes inside Docker.
set -euo pipefail
exec bash "$(dirname "${BASH_SOURCE[0]}")/../setup.sh" "$@"
