import { registerAs } from '@nestjs/config'

export interface AppConfig {
  NODE_ENV: string
  PORT: number
  FRONTEND_URL?: string | undefined
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
    PORT: Number(process.env['PORT'] ?? 3000),
    FRONTEND_URL: process.env['FRONTEND_URL'] ?? undefined
  })
)
