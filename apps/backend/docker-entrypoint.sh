#!/bin/sh
set -eu

AUDIO_DIR="${GENERATED_LISTENING_AUDIO_DIR:-/app/data/listening/generated}"
mkdir -p "${AUDIO_DIR}"
if [ "$(id -u)" = "0" ]; then
  chown -R node:node "${AUDIO_DIR}"
fi

DB_PACKAGE="${PRISMA_PACKAGE_PATH:-/app/node_modules/@exam-one/database}"
if [ ! -f "${DB_PACKAGE}/prisma.config.ts" ]; then
  SCHEMA="$(find /app/node_modules -path '*/@exam-one/database/prisma/schema.prisma' 2>/dev/null | head -n1 || true)"
  if [ -n "${SCHEMA}" ] && [ -f "${SCHEMA}" ]; then
    DB_PACKAGE="$(dirname "$(dirname "${SCHEMA}")")"
  fi
fi
if [ -z "${DB_PACKAGE}" ] || [ ! -f "${DB_PACKAGE}/prisma.config.ts" ]; then
  echo "Prisma config not found in the backend image." >&2
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
# Prisma 7 reads the datasource URL from prisma.config.ts in the database package.
(
  cd "${DB_PACKAGE}"
  "${PRISMA_BIN}" migrate deploy
)

echo "Upserting bundled exam catalog..."
run_as_app node "${SEED_CLI}"

if [ "$(id -u)" = "0" ] && command -v su-exec >/dev/null 2>&1; then
  exec su-exec node "$@"
fi
exec "$@"
