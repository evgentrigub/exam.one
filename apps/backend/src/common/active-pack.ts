import { packContext } from './pack-context.interceptor'
import { DEFAULT_PACK_ID, getLivePack } from '@exam-one/exam-packs'
import type { PrismaService } from '@exam-one/nestjs-libraries'

export async function resolveUserPackId(prisma: PrismaService, userId: string): Promise<string> {
  const explicit = packContext.getStore()?.packId
  if (explicit) return explicit
  const setting = await prisma.setting.findUnique({
    where: { userId },
    select: { packId: true },
  })
  return getLivePack(setting?.packId ?? DEFAULT_PACK_ID).packId
}
