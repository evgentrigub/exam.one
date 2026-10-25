import { createPrismaClient } from './client'
import { prunePractice } from './prune'

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter(arg => arg !== '--')
  const flag = args.findIndex(arg => arg === '--pack' || arg.startsWith('--pack='))
  const packId =
    flag < 0 ? undefined : args[flag]!.includes('=') ? args[flag]!.split('=')[1] : args[flag + 1]
  if (flag >= 0 && (!packId || packId.startsWith('--')))
    throw new Error('--pack requires a pack ID')
  if (
    args.some(
      (arg, index) =>
        arg !== '--force' &&
        index !== flag &&
        !(flag >= 0 && index === flag + 1 && args[flag] === '--pack')
    )
  )
    throw new Error('Usage: pnpm --filter @exam-one/database db:prune [--pack pack-id] [--force]')
  if (process.env['NODE_ENV'] === 'production' && !args.includes('--force'))
    throw new Error('Production pruning requires --force')
  const prisma = createPrismaClient()
  try {
    console.info(`Pruning ${packId ?? 'all packs'}; accounts, sessions and settings are preserved.`)
    console.info('Deleted:', await prunePractice(prisma, packId))
    console.info(
      'Run pnpm db:seed once to install replacement seeds. Pruning is never part of startup.'
    )
  } finally {
    await prisma.$disconnect()
  }
}
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Pruning failed')
  process.exitCode = 1
})
