import path from 'node:path'
import { registerAs } from '@nestjs/config'

export type LlmProviderName = 'openai' | 'openrouter'
export type SttProviderName = 'local' | 'openai'

export interface AppConfig {
  NODE_ENV: string
  BACKEND_PORT: number
  DATABASE_URL: string
  FRONTEND_URL: string
  JWT_SECRET: string
  AUTH_COOKIE_SECURE: boolean
  EMAIL_PROVIDER: 'none' | 'smtp'
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_FROM: string
  LLM_PROVIDER: LlmProviderName
  OPENAI_API_KEY: string
  OPENAI_MODEL: string
  OPENROUTER_API_KEY: string
  OPENROUTER_MODEL: string
  LLM_REASONING_EFFORT: string
  TTS_BASE_URL: string
  TTS_VOICE: string
  TTS_SPEED: number
  TTS_LANG: string
  TTS_TURN_PAUSE_MS: number
  TTS_CONCURRENCY: number
  STT_PROVIDER: SttProviderName
  STT_BASE_URL: string
  STT_MODEL: string
  STT_OPENAI_MODEL: string
  GENERATED_LISTENING_AUDIO_DIR: string
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not set. Provide it via the environment or .env file.`)
  }
  return value
}

function emailProvider(): 'none' | 'smtp' {
  const raw = (process.env['EMAIL_PROVIDER'] ?? 'none').trim().toLowerCase()
  return raw === 'smtp' ? 'smtp' : 'none'
}

function llmProvider(): LlmProviderName {
  const raw = (process.env['LLM_PROVIDER'] ?? 'openrouter').trim().toLowerCase()
  return raw === 'openai' ? 'openai' : 'openrouter'
}

function sttProvider(): SttProviderName {
  const raw = (process.env['STT_PROVIDER'] ?? 'local').trim().toLowerCase()
  return raw === 'openai' ? 'openai' : 'local'
}

function defaultGeneratedListeningAudioDir(): string {
  return path.resolve(process.cwd(), '../frontend/public/audio/listening/generated')
}

export const appConfig = registerAs('app', (): AppConfig => ({
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  BACKEND_PORT: Number(process.env['BACKEND_PORT'] ?? 3001),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  FRONTEND_URL: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
  JWT_SECRET: requireEnv('JWT_SECRET'),
  AUTH_COOKIE_SECURE: process.env['AUTH_COOKIE_SECURE'] === 'true',
  EMAIL_PROVIDER: emailProvider(),
  SMTP_HOST: process.env['SMTP_HOST'] ?? '',
  SMTP_PORT: Number(process.env['SMTP_PORT'] ?? 587),
  SMTP_USER: process.env['SMTP_USER'] ?? '',
  SMTP_PASS: process.env['SMTP_PASS'] ?? '',
  SMTP_FROM: process.env['SMTP_FROM'] ?? 'exam.one <noreply@localhost>',
  LLM_PROVIDER: llmProvider(),
  OPENAI_API_KEY: (process.env['OPENAI_API_KEY'] ?? '').trim(),
  OPENAI_MODEL: (process.env['OPENAI_MODEL'] ?? 'gpt-5.5').trim(),
  OPENROUTER_API_KEY: (process.env['OPENROUTER_API_KEY'] ?? '').trim(),
  OPENROUTER_MODEL: (process.env['OPENROUTER_MODEL'] ?? 'google/gemma-4-26b-a4b-it:free').trim(),
  LLM_REASONING_EFFORT: (process.env['LLM_REASONING_EFFORT'] ?? 'medium').trim(),
  TTS_BASE_URL: (process.env['TTS_BASE_URL'] ?? 'http://127.0.0.1:8881').replace(/\/$/, ''),
  TTS_VOICE: process.env['TTS_VOICE'] ?? 'martin',
  TTS_SPEED: Number(process.env['TTS_SPEED'] ?? '1.0') || 1.0,
  TTS_LANG: process.env['TTS_LANG'] ?? 'de',
  TTS_TURN_PAUSE_MS: Number(process.env['TTS_TURN_PAUSE_MS'] ?? '350') || 350,
  TTS_CONCURRENCY: Number(process.env['TTS_CONCURRENCY'] ?? '3') || 3,
  STT_PROVIDER: sttProvider(),
  STT_BASE_URL: (process.env['STT_BASE_URL'] ?? 'http://127.0.0.1:8882').replace(/\/+$/, ''),
  STT_MODEL: process.env['STT_MODEL'] ?? 'handy-computer/parakeet-tdt-0.6b-v3-gguf:Q8_0',
  STT_OPENAI_MODEL: process.env['STT_OPENAI_MODEL'] ?? 'whisper-1',
  GENERATED_LISTENING_AUDIO_DIR:
    process.env['GENERATED_LISTENING_AUDIO_DIR']?.trim() || defaultGeneratedListeningAudioDir(),
}))
