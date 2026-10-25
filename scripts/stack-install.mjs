#!/usr/bin/env node
// Called after the dependency-free Bash preflight succeeds.
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: repoRoot, stdio: 'inherit', ...options })
  if (result.error || result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed. Fix the issue and rerun pnpm stack:install.`
    )
  }
  return result
}

function install() {
  const envPath = path.join(repoRoot, '.env')
  const existing = existsSync(envPath)
  const source = existing ? '.env' : '.env.example'
  let contents = readFileSync(path.join(repoRoot, source), 'utf8')
  const fileEnv = parseEnv(contents)
  // Compose resolves interpolation and exported overrides without printing secret values.
  const result = run('docker', ['compose', '--env-file', source, 'config', '--format', 'json'], {
    stdio: 'pipe',
    encoding: 'utf8',
    timeout: 30_000,
  })
  const config = JSON.parse(result.stdout)
  const backendEnv = config.services.backend.environment
  let changed = !existing
  for (const [key, bytes] of [
    ['JWT_SECRET', 48],
    ['SECRETS_ENCRYPTION_KEY', 32],
  ]) {
    let value = String(backendEnv[key] ?? '').trim()
    if (!value) {
      if (Object.hasOwn(process.env, key) || fileEnv[key]?.trim()) {
        throw new Error(
          `${key} resolves to an empty value. Fix its environment override or .env reference before installing.`
        )
      }
      value = randomBytes(bytes).toString('base64')
      const assignment = new RegExp(`^[ \\t]*(?:export[ \\t]+)?${key}[ \\t]*=.*$`, 'gm')
      if ([...contents.matchAll(assignment)].length > 1) {
        throw new Error(
          `${key} appears more than once in .env. Keep one assignment before installing.`
        )
      }
      contents = assignment.test(contents)
        ? contents.replace(assignment, () => `${key}=${value}`)
        : `${contents.trimEnd()}\n${key}=${value}\n`
      changed = true
    }
    if (key === 'JWT_SECRET' && (value.length < 32 || value === 'change-me-in-production')) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters and must not use the example placeholder. Existing secrets were left unchanged.'
      )
    }
    if (
      key === 'SECRETS_ENCRYPTION_KEY' &&
      (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || Buffer.from(value, 'base64').length !== 32)
    ) {
      throw new Error(
        'SECRETS_ENCRYPTION_KEY must be base64 for exactly 32 bytes. Existing secrets were left unchanged.'
      )
    }
  }
  if (changed) {
    writeFileSync(envPath, contents, { mode: 0o600, flag: existing ? 'w' : 'wx' })
    console.log('[install] Prepared .env; existing nonempty secrets and settings were preserved.')
  } else {
    console.log('[install] Keeping the existing .env and secrets.')
  }

  console.log('[install] Installing workspace dependencies...')
  run('pnpm', ['install', '--frozen-lockfile'])

  // The host audio tool needs these settings too; other Compose settings stay in .env.
  const env = { ...process.env }
  const hostSettings = parseEnv(contents)
  for (const key of ['TTS_CONCURRENCY', 'TTS_SPEED', 'TTS_TURN_PAUSE_MS']) {
    if (backendEnv[key] !== undefined) env[key] ??= String(backendEnv[key])
  }
  for (const key of ['TTS_BASE_URL', 'STACK_SEED_PACKS', 'STACK_SEED_AUDIO_TIMEOUT_MS']) {
    if (hostSettings[key] !== undefined) env[key] ??= hostSettings[key]
  }
  const coreOnly = process.argv.includes('--core')
  console.log(
    `[install] Starting ${coreOnly ? 'the core application' : 'the application and speech services'}...`
  )
  run('pnpm', [coreOnly ? 'stack:up:core' : 'stack:up'], { env })
  const port = config.services.frontend.ports.find(port => Number(port.target) === 3000).published
  console.log(
    `[install] Stack startup finished. Open http://localhost:${port} and register an account.`
  )
  console.log(
    `[install] Reuse pnpm ${coreOnly ? 'stack:up:core' : 'stack:up'} for subsequent starts. Inspect services with docker compose ps.`
  )
}

try {
  install()
} catch (error) {
  console.error(`[install] ${error.message}`)
  process.exitCode = 1
}
