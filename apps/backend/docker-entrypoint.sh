#!/bin/sh
set -eu

AUDIO_DIR="${GENERATED_LISTENING_AUDIO_DIR:-/app/data/listening/generated}"
mkdir -p "${AUDIO_DIR}"
if [ "$(id -u)" = "0" ]; then
  chown -R node:node "${AUDIO_DIR}"
fi

SCHEMA="${PRISMA_SCHEMA_PATH:-/app/node_modules/@exam-one/database/prisma/schema.prisma}"
if [ ! -f "${SCHEMA}" ]; then
  SCHEMA="$(find /app/node_modules -path '*/@exam-one/database/prisma/schema.prisma' 2>/dev/null | head -n1 || true)"
fi
if [ -z "${SCHEMA}" ] || [ ! -f "${SCHEMA}" ]; then
  echo "Prisma schema not found in the backend image." >&2
  exit 1
fi

PRISMA_BIN="${PRISMA_BIN:-/app/node_modules/.bin/prisma}"
if [ ! -x "${PRISMA_BIN}" ]; then
  PRISMA_BIN="$(find /app/node_modules -path '*/.bin/prisma' 2>/dev/null | head -n1 || true)"
fi
if [ -z "${PRISMA_BIN}" ] || [ ! -x "${PRISMA_BIN}" ]; then
  echo "Prisma CLI not found in the backend image." >&2
  exit 1
fi

SEED_CLI="${SEED_CLI:-/app/node_modules/@exam-one/database/dist/seed-cli.js}"
if [ ! -f "${SEED_CLI}" ]; then
  SEED_CLI="$(find /app/node_modules -path '*/@exam-one/database/dist/seed-cli.js' 2>/dev/null | head -n1 || true)"
fi
if [ -z "${SEED_CLI}" ] || [ ! -f "${SEED_CLI}" ]; then
  echo "Catalog seed CLI not found in the backend image." >&2
  exit 1
fi

run_as_app() {
  if [ "$(id -u)" = "0" ] && command -v su-exec >/dev/null 2>&1; then
    su-exec node "$@"
  else
    "$@"
  fi
}

echo "Applying Prisma migrations..."
# migrate deploy is a one-shot bootstrap; run as root so Prisma can read
# baked engines without needing write access to root-owned node_modules.
"${PRISMA_BIN}" migrate deploy --schema="${SCHEMA}"

echo "Upserting bundled exam catalog..."
run_as_app node "${SEED_CLI}"

if [ "$(id -u)" = "0" ] && command -v su-exec >/dev/null 2>&1; then
  exec su-exec node "$@"
fi
exec "$@"
