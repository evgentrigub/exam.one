#!/usr/bin/env bash
# Keep preflight runnable before Node, pnpm, or workspace dependencies are installed.
set -euo pipefail
cd "$(cd "${BASH_SOURCE[0]%/*}/.." && pwd)"

check_only=false
core_only=false
for arg in "$@"; do
  case "$arg" in
    --check) check_only=true ;;
    --core) core_only=true ;;
    --help|-h)
      printf '%s\n' 'Usage: bash scripts/stack-install.sh [--check] [--core]' \
        '  --check  Check prerequisites without changing files or starting services.' \
        '  --core   Install/start the core application without speech services.'
      exit 0 ;;
    *) printf '[error] Unknown option: %s. Use --help for usage.\n' "$arg" >&2; exit 1 ;;
  esac
done

failures=0
fail() {
  printf '[missing] %s\n          %s\n' "$1" "$2" >&2
  failures=$((failures + 1))
}

printf '%s\n' 'Checking exam.one onboarding prerequisites...'
expected_pnpm=''
if command -v node >/dev/null 2>&1 && node_version=$(node --version 2>/dev/null); then
  if [[ "$node_version" =~ ^v([0-9]+)\. ]] && (( BASH_REMATCH[1] >= 24 )); then
    printf '[ok] Node.js %s\n' "$node_version"
  else
    fail "Node.js 24 or newer is required (found $node_version)." 'Install Node.js: https://nodejs.org/en/download'
  fi
  expected_pnpm=$(node -p 'JSON.parse(require("node:fs").readFileSync("package.json", "utf8")).packageManager.split("@")[1].split("+")[0]' 2>/dev/null) || true
else
  fail 'Node.js 24 or newer is missing or cannot run.' 'Install Node.js: https://nodejs.org/en/download'
fi

if command -v npm >/dev/null 2>&1 && npm_version=$(npm --version 2>/dev/null); then
  printf '[ok] npm %s\n' "$npm_version"
else
  printf '%s\n' '[note] npm is unavailable. It normally comes with Node.js and can install pnpm; it is optional if pnpm already works.'
fi

pnpm_hint="Install the version pinned in package.json: https://pnpm.io/installation"
if [[ -n "$expected_pnpm" ]]; then
  pnpm_hint="Install pnpm with: npm install -g pnpm@$expected_pnpm"
fi
if command -v pnpm >/dev/null 2>&1 && pnpm_version=$(pnpm --version 2>/dev/null); then
  if [[ -n "$expected_pnpm" && "$pnpm_version" != "$expected_pnpm" ]]; then
    fail "pnpm $expected_pnpm is required by package.json (found $pnpm_version)." "$pnpm_hint"
  else
    printf '[ok] pnpm %s\n' "$pnpm_version"
  fi
else
  fail 'pnpm is missing or cannot run.' "$pnpm_hint"
fi

if command -v docker >/dev/null 2>&1 && docker_version=$(docker --version 2>/dev/null); then
  printf '[ok] %s\n' "$docker_version"
  if compose_version=$(docker compose version 2>/dev/null) && \
      compose_help=$(docker compose up --help 2>/dev/null) && [[ "$compose_help" == *"--wait "* ]]; then
    printf '[ok] %s\n' "$compose_version"
  else
    fail 'Docker Compose with --wait support is missing or outdated.' 'Install/update Docker Desktop or the Compose plugin: https://docs.docker.com/compose/install/'
  fi
  if docker info >/dev/null 2>&1; then
    printf '%s\n' '[ok] Docker engine is running and accessible.'
  else
    fail 'The Docker engine is stopped or inaccessible.' 'Start Docker Desktop or Docker Engine; check your Docker context and socket permissions, then retry docker info.'
  fi
else
  fail 'Docker is missing or cannot run.' 'Install Docker Desktop or Docker Engine with Compose: https://docs.docker.com/get-docker/'
fi

if (( failures > 0 )); then
  printf '\nFix the %s prerequisite issue(s) above, then rerun: bash scripts/stack-install.sh\n' "$failures" >&2
  exit 1
fi
printf '\n%s\n' 'All prerequisite checks passed.'
if [[ "$check_only" == true ]]; then
  printf '%s\n' 'No files changed or services started. To install, run: pnpm stack:install'
  exit 0
fi

if [[ "$core_only" == true ]]; then
  exec node scripts/stack-install.mjs --core
fi
exec node scripts/stack-install.mjs
