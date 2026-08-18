import { Prisma } from '@exam-one/database'

export function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

export function payloadId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const id = (payload as { id?: unknown }).id
  return typeof id === 'string' && id.length > 0 ? id : null
}
