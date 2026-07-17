import { registerAs } from '@nestjs/config'

export interface AppConfig {
  NODE_ENV: string
  BACKEND_PORT: number
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
    BACKEND_PORT: Number(process.env['BACKEND_PORT'] ?? 3001)
  })
)
