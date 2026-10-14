import path from 'node:path'
import { registerAs } from '@nestjs/config'

export interface AppConfig {
  NODE_ENV: string
  BACKEND_PORT: number
  DATABASE_URL: string
  REDIS_URL: string
  JOBS_WORKER_ENABLED: boolean
  BULL_BOARD_USER: string
  BULL_BOARD_PASSWORD: string
  FRONTEND_URL: string
  JWT_SECRET: string
  /** Base64 32-byte key that encrypts users' saved LLM API keys. */
  SECRETS_ENCRYPTION_KEY: string
  AUTH_COOKIE_SECURE: boolean
  EMAIL_PROVIDER: 'none' | 'smtp'
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_FROM: string
  TTS_BASE_URL: string
  TTS_VOICES: string
  TTS_VOICE: string
  TTS_SPEED: number
  TTS_LANG: string
  /** Comma-separated TTS languages this instance serves; falls back to `TTS_LANG`. */
  TTS_LANGUAGES: string
  TTS_TURN_PAUSE_MS: number
  TTS_CONCURRENCY: number
  STT_BASE_URL: string
  STT_LANGUAGES: string
  STT_MODEL: string
  GENERATED_LISTENING_AUDIO_DIR: string
  /** Root of every pack's bundled seed WAVs (`<root>/<pack prefix>/<exercise>/…`). */
  SEED_LISTENING_AUDIO_DIR: string
  /** How Settings → Generated files names the audio root on the host; display only. */
  AUDIO_HOST_DISPLAY_ROOT: string
}

const MIN_JWT_SECRET_LENGTH = 32
const PLACEHOLDER_JWT_SECRET = 'change-me-in-production'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not set. Provide it via the environment or .env file.`)
  }
  return value
}

export function requireJwtSecret(value: string | undefined): string {
  const secret = value?.trim() ?? ''
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Generate one with: openssl rand -base64 48')
  }
  if (secret === PLACEHOLDER_JWT_SECRET) {
    throw new Error(
      'JWT_SECRET must not use the example placeholder. Generate one with: openssl rand -base64 48'
    )
  }
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters. Generate one with: openssl rand -base64 48`
    )
  }
  return secret
}

const SECRETS_KEY_BYTES = 32
const SECRETS_KEY_HINT = 'Generate one with: openssl rand -base64 32'

export function requireSecretsKey(value: string | undefined): string {
  const key = value?.trim() ?? ''
  if (!key) {
    throw new Error(`SECRETS_ENCRYPTION_KEY is not set. ${SECRETS_KEY_HINT}`)
  }
  const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(key)
  if (!isBase64 || Buffer.from(key, 'base64').length !== SECRETS_KEY_BYTES) {
    throw new Error(
      `SECRETS_ENCRYPTION_KEY must be base64 for exactly ${SECRETS_KEY_BYTES} bytes. ${SECRETS_KEY_HINT}`
    )
  }
  return key
}

function emailProvider(): 'none' | 'smtp' {
  const raw = (process.env['EMAIL_PROVIDER'] ?? 'none').trim().toLowerCase()
  return raw === 'smtp' ? 'smtp' : 'none'
}

function defaultGeneratedListeningAudioDir(): string {
  return path.resolve(process.cwd(), '../frontend/public/audio/listening/generated')
}

function defaultSeedListeningAudioDir(): string {
  return path.resolve(process.cwd(), '../frontend/public/audio/listening')
}

export const appConfig = registerAs('app', (): AppConfig => ({
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  BACKEND_PORT: Number(process.env['BACKEND_PORT'] ?? 3001),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  REDIS_URL: requireEnv('REDIS_URL'),
  JOBS_WORKER_ENABLED: process.env['JOBS_WORKER_ENABLED'] !== 'false',
  BULL_BOARD_USER: process.env['BULL_BOARD_USER'] ?? '',
  BULL_BOARD_PASSWORD: process.env['BULL_BOARD_PASSWORD'] ?? '',
  FRONTEND_URL: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
  JWT_SECRET: requireJwtSecret(process.env['JWT_SECRET']),
  SECRETS_ENCRYPTION_KEY: requireSecretsKey(process.env['SECRETS_ENCRYPTION_KEY']),
  AUTH_COOKIE_SECURE: process.env['AUTH_COOKIE_SECURE'] === 'true',
  EMAIL_PROVIDER: emailProvider(),
  SMTP_HOST: process.env['SMTP_HOST'] ?? '',
  SMTP_PORT: Number(process.env['SMTP_PORT'] ?? 587),
  SMTP_USER: process.env['SMTP_USER'] ?? '',
  SMTP_PASS: process.env['SMTP_PASS'] ?? '',
  SMTP_FROM: process.env['SMTP_FROM'] ?? 'exam.one <noreply@localhost>',
  TTS_BASE_URL: (process.env['TTS_BASE_URL'] ?? 'http://127.0.0.1:8881').replace(/\/$/, ''),
  TTS_VOICES: process.env['TTS_VOICES'] ?? 'martin,bernd,victoria,eva',
  TTS_VOICE: process.env['TTS_VOICE'] ?? 'martin',
  TTS_SPEED: Number(process.env['TTS_SPEED'] ?? '1.0') || 1.0,
  TTS_LANG: process.env['TTS_LANG'] ?? 'de',
  TTS_LANGUAGES: process.env['TTS_LANGUAGES'] ?? process.env['TTS_LANG'] ?? 'de',
  TTS_TURN_PAUSE_MS: Number(process.env['TTS_TURN_PAUSE_MS'] ?? '350') || 350,
  TTS_CONCURRENCY: Number(process.env['TTS_CONCURRENCY'] ?? '3') || 3,
  STT_BASE_URL: (process.env['STT_BASE_URL'] ?? 'http://127.0.0.1:8882').replace(/\/+$/, ''),
  STT_LANGUAGES: process.env['STT_LANGUAGES'] ?? 'de',
  STT_MODEL: process.env['STT_MODEL'] ?? 'handy-computer/parakeet-tdt-0.6b-v3-gguf:Q8_0',
  GENERATED_LISTENING_AUDIO_DIR:
    process.env['GENERATED_LISTENING_AUDIO_DIR']?.trim() || defaultGeneratedListeningAudioDir(),
  SEED_LISTENING_AUDIO_DIR: process.env['SEED_LISTENING_AUDIO_DIR']?.trim() || defaultSeedListeningAudioDir(),
  AUDIO_HOST_DISPLAY_ROOT:
    process.env['AUDIO_HOST_DISPLAY_ROOT']?.trim() || 'apps/frontend/public/audio/listening',
}))
