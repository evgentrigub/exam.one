import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

const DEFAULT_DATABASE_URL =
  'postgresql://exam_one:exam_one@localhost:5432/exam_one?schema=public'

export function databaseUrl(): string {
  return process.env['DATABASE_URL'] ?? DEFAULT_DATABASE_URL
}

export function createPrismaAdapter(connectionString = databaseUrl()): PrismaPg {
  return new PrismaPg({
    connectionString,
    // Match Prisma 6's 5s pool timeout; node-pg defaults to 0 (no timeout).
    connectionTimeoutMillis: 5_000,
  })
}

export function createPrismaClient(connectionString = databaseUrl()): PrismaClient {
  return new PrismaClient({ adapter: createPrismaAdapter(connectionString) })
}
