import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig(
  globalIgnores([
    '**/node_modules/**',
    '**/.nuxt/**',
    '**/.output/**',
    '**/dist/**',
    '**/.cursor/**',
    '**/.claude/**',
    '**/.idea/**',
    'pnpm-lock.yaml',
    'graphify-out/**'
  ])
)
