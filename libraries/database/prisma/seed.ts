import { createPrismaClient } from '../src/client'
import { seedCatalog } from '../src/seed'

const prisma = createPrismaClient()

seedCatalog(prisma)
  .then(summary => {
    console.info(
      `Seeded exercises: reading=${summary.reading} writing=${summary.writing} listening=${summary.listening} speaking=${summary.speaking}; bundled mock sets upserted.`
    )
    console.info(
      `Per pack: ${Object.entries(summary.packs).map(([id, n]) => `${id}=${n}`).join(' ')}`
    )
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
