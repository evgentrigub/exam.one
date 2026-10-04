import { createPrismaClient } from './client'

/**
 * Remove practice data so a verification run starts from a known state.
 *
 * Deletes exercises, attempts, results, drafts, mock exams and background jobs. Accounts,
 * sessions and settings are deliberately left alone: the point is to re-verify the exam
 * modules after a significant change, not to start the app over. `db:seed` re-upserts the
 * bundled seeds afterwards, and generated exercises are meant to be regenerated.
 *
 * Results and mock-exam attempts cascade from their parents, but they are counted explicitly
 * so the summary says what actually went.
 */
async function main(): Promise<void> {
  const url = process.env['DATABASE_URL'] ?? ''
  const target = url.replace(/\/\/[^@]*@/, '//***@') || '(default local database)'

  if (process.env['NODE_ENV'] === 'production' && !process.argv.includes('--force')) {
    console.error(`Refusing to prune ${target} with NODE_ENV=production. Pass --force to override.`)
    process.exitCode = 1
    return
  }

  const prisma = createPrismaClient()
  try {
    console.info(`Pruning practice data from ${target}`)
    const counts = {
      results: await prisma.result.count(),
      attempts: await prisma.attempt.count(),
      mockExamAttempts: await prisma.mockExamAttempt.count(),
      mockExamSets: await prisma.mockExamSet.count(),
      drafts: await prisma.draft.count(),
      backgroundJobs: await prisma.backgroundJob.count(),
      promptOverrides: await prisma.promptOverride.count(),
      exercises: await prisma.exercise.count(),
    }

    // Children first, so the summary is accurate even where a cascade would have covered it.
    await prisma.result.deleteMany()
    await prisma.attempt.deleteMany()
    await prisma.mockExamAttempt.deleteMany()
    await prisma.mockExamSet.deleteMany()
    await prisma.draft.deleteMany()
    await prisma.backgroundJob.deleteMany()
    await prisma.promptOverride.deleteMany()
    await prisma.exercise.deleteMany()

    const kept = { users: await prisma.user.count(), settings: await prisma.setting.count() }
    console.info(
      `Deleted: exercises=${counts.exercises} attempts=${counts.attempts} results=${counts.results} ` +
        `drafts=${counts.drafts} mockSets=${counts.mockExamSets} mockAttempts=${counts.mockExamAttempts} ` +
        `backgroundJobs=${counts.backgroundJobs} promptOverrides=${counts.promptOverrides}`
    )
    console.info(`Kept: users=${kept.users} settings=${kept.settings} (sessions untouched)`)
    console.info(
      'Next: `pnpm db:seed` to restore the bundled exercises, then `pnpm stack:seed-audio` for seed audio.'
    )
    console.info(
      'Note: generated audio under GENERATED_LISTENING_AUDIO_DIR is keyed by exercise id and is now orphaned; it is safe to delete.'
    )
  } finally {
    await prisma.$disconnect()
  }
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
