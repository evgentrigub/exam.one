import { createPrismaClient } from './client'
import { seedCatalog } from './seed'

async function main(): Promise<void> {
  const prisma = createPrismaClient()
  try {
    const summary = await seedCatalog(prisma)
    console.info(
      `Seeded exercises: reading=${summary.reading} writing=${summary.writing} listening=${summary.listening} speaking=${summary.speaking}; mock set 1 upserted.`
    )
  } finally {
    await prisma.$disconnect()
  }
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
