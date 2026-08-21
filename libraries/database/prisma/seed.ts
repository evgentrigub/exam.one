import { PrismaClient } from '@prisma/client'
import { seedCatalog } from '../src/seed'

const prisma = new PrismaClient()

seedCatalog(prisma)
  .then(summary => {
    console.info(
      `Seeded exercises: reading=${summary.reading} writing=${summary.writing} listening=${summary.listening} speaking=${summary.speaking}; mock set 1 upserted.`
    )
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
