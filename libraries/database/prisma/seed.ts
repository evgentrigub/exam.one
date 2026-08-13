import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_OPERATOR_EMAIL = 'operator@exam.one'

async function seed(): Promise<void> {
  const operator = await prisma.user.upsert({
    where: { email: DEFAULT_OPERATOR_EMAIL },
    update: {},
    create: {
      email: DEFAULT_OPERATOR_EMAIL,
      name: 'Default Operator',
      plan: 'FREE'
    }
  })

  await prisma.setting.upsert({
    where: { userId: operator.id },
    update: {},
    create: {
      userId: operator.id,
      examLevel: 'A2',
      targetLanguage: 'de'
    }
  })
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
