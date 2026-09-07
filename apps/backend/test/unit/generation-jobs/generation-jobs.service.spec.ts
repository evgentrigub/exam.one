import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { GenerationJobsService } from '../../../src/generation-jobs/generation-jobs.service'
import { makeGenerationJob, makeUser } from '../../../src/testing/fixtures'

describe('GenerationJobsService', () => {
  let service: GenerationJobsService
  let prisma: {
    generationJob: {
      findUnique: jest.Mock
      findMany: jest.Mock
      upsert: jest.Mock
      deleteMany: jest.Mock
    }
    setting: {
      findUnique: jest.Mock
    }
  }

  const user = makeUser()

  beforeEach(async () => {
    prisma = {
      generationJob: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({}),
      },
      setting: {
        findUnique: jest.fn().mockResolvedValue({ packId: 'goethe-de-a2' }),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerationJobsService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(GenerationJobsService)
  })

  it('lists jobs for the current user', async () => {
    const job = makeGenerationJob({ status: 'RUNNING' })
    prisma.generationJob.findMany.mockResolvedValue([job])

    const result = await service.list(user)

    expect(prisma.generationJob.findMany).toHaveBeenCalledWith({
      where: { userId: user.id, packId: 'goethe-de-a2' },
      orderBy: { updatedAt: 'desc' },
    })
    expect(result).toHaveLength(1)
    expect(result[0]?.status).toBe('RUNNING')
  })

  it('returns null when no job exists', async () => {
    prisma.generationJob.findUnique.mockResolvedValue(null)

    await expect(service.get(user, 'READING')).resolves.toBeNull()
  })

  it('maps an existing job', async () => {
    const job = makeGenerationJob({ status: 'RUNNING' })
    prisma.generationJob.findUnique.mockResolvedValue(job)

    const result = await service.get(user, 'READING')

    expect(prisma.generationJob.findUnique).toHaveBeenCalledWith({
      where: { userId_packId_kind: { userId: user.id, packId: 'goethe-de-a2', kind: 'READING' } },
    })
    expect(result?.status).toBe('RUNNING')
  })

  it('upserts with default IDLE status', async () => {
    prisma.generationJob.upsert.mockResolvedValue(makeGenerationJob())

    await service.upsert(user, 'READING', { step: 1 })

    expect(prisma.generationJob.upsert).toHaveBeenCalledWith({
      where: { userId_packId_kind: { userId: user.id, packId: 'goethe-de-a2', kind: 'READING' } },
      create: {
        userId: user.id,
        packId: 'goethe-de-a2',
        kind: 'READING',
        status: 'IDLE',
        payload: { step: 1 },
      },
      update: { status: 'IDLE', payload: { step: 1 } },
    })
  })

  it('passes an explicit status through', async () => {
    prisma.generationJob.upsert.mockResolvedValue(makeGenerationJob({ status: 'COMPLETED' }))

    await service.upsert(user, 'MOCK', { done: true }, 'COMPLETED')

    expect(prisma.generationJob.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ kind: 'MOCK', status: 'COMPLETED' }),
        update: expect.objectContaining({ status: 'COMPLETED' }),
      })
    )
  })

  it('removes with deleteMany by user and kind', async () => {
    await service.remove(user, 'SPEAKING')

    expect(prisma.generationJob.deleteMany).toHaveBeenCalledWith({
      where: { userId: user.id, packId: 'goethe-de-a2', kind: 'SPEAKING' },
    })
  })
})
