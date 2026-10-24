import type { PrismaClient, Prisma } from './generated/prisma/client'
import { getPack, listPacks } from '@exam-one/exam-packs'

/** A one-off operation. Never invoked by seed or application startup. */
export async function prunePractice(prisma: PrismaClient, packId?: string) {
  const pack = packId ? getPack(packId) : undefined
  if (packId && !pack) throw new Error(`Unknown pack: ${packId}`)
  const scope = packId ? { packId } : {}
  // Workers watch cancellation state and abort provider calls before committing artifacts.
  await prisma.backgroundJob.updateMany({
    where: { ...scope, status: 'QUEUED' },
    data: {
      status: 'CANCELLED',
      activeKey: null,
      finishedAt: new Date(),
      revision: { increment: 1 },
    },
  })
  await prisma.backgroundJob.updateMany({
    where: { ...scope, status: 'RUNNING' },
    data: { status: 'CANCEL_REQUESTED', revision: { increment: 1 } },
  })
  const deadline = Date.now() + 30_000
  while (await prisma.backgroundJob.count({ where: { ...scope, status: 'CANCEL_REQUESTED' } })) {
    if (Date.now() >= deadline)
      throw new Error(
        'Cancellation is still pending. Keep the worker running and retry pruning after it acknowledges cancellation; no practice records were deleted.'
      )
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  // Overrides are level-scoped, so never erase them if another identity shares this level.
  const sharedLevel =
    pack && listPacks().some(p => p.packId !== pack.packId && p.cefr === pack.cefr)
  const overrideLevel = pack?.cefr === 'A2' || pack?.cefr === 'C1' ? pack.cefr : undefined
  const overrides: Prisma.PromptOverrideWhereInput = pack
    ? !overrideLevel || sharedLevel
      ? { id: { in: [] } }
      : { level: overrideLevel }
    : {}
  return prisma.$transaction(async tx => {
    const results = await tx.result.deleteMany({ where: packId ? { attempt: { packId } } : {} })
    const attempts = await tx.attempt.deleteMany({ where: scope })
    const mockAttempts = await tx.mockExamAttempt.deleteMany({
      where: packId ? { set: { packId } } : {},
    })
    const mockSets = await tx.mockExamSet.deleteMany({ where: scope })
    const drafts = await tx.draft.deleteMany({ where: scope })
    const jobs = await tx.backgroundJob.deleteMany({ where: scope })
    const prompts = await tx.promptOverride.deleteMany({ where: overrides })
    const exercises = await tx.exercise.deleteMany({ where: scope })
    return {
      results: results.count,
      attempts: attempts.count,
      mockAttempts: mockAttempts.count,
      mockSets: mockSets.count,
      drafts: drafts.count,
      jobs: jobs.count,
      prompts: prompts.count,
      exercises: exercises.count,
    }
  })
}
