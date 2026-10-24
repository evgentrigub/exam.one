import { defineConfig, env } from 'prisma/config'

const DEFAULT_DATABASE_URL =
  'postgresql://exam_one:exam_one@localhost:5432/exam_one?schema=public'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl(),
  },
})

function databaseUrl(): string {
  try {
    return env('DATABASE_URL')
  } catch {
    return DEFAULT_DATABASE_URL
  }
}
