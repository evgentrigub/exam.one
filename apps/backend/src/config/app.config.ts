import { registerAs } from '@nestjs/config'

export interface AppConfig {
  NODE_ENV: string
  BACKEND_PORT: number
  DATABASE_URL: string
}

function requireDatabaseUrl(): string {
  const url = process.env['DATABASE_URL']
  if (!url) {
    throw new Error('DATABASE_URL is not set. Provide it via the environment or .env file.')
  }
  return url
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
    BACKEND_PORT: Number(process.env['BACKEND_PORT'] ?? 3001),
    DATABASE_URL: requireDatabaseUrl()
  })
)
