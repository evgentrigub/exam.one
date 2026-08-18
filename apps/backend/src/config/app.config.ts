import { registerAs } from '@nestjs/config'

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

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
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
  })
)
