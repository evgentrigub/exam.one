import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { ExercisesService } from './exercises.service'
import type { User } from '@exam-one/database'

describe('ExercisesService', () => {
  let service: ExercisesService
  let prisma: {
    exercise: {
      count: jest.Mock
      findMany: jest.Mock
      findFirst: jest.Mock
      create: jest.Mock
      update: jest.Mock
    }
  }

  const user = { id: 'user-1' } as User

  beforeEach(async () => {
    prisma = {
      exercise: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExercisesService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(ExercisesService)
  })

  it('lists seed exercises for a skill', async () => {
    prisma.exercise.findMany.mockResolvedValue([
      {
        id: 'row-1',
        skill: 'READING',
        level: 'A2',
        source: 'seed',
        visibility: 'PRACTICE',
        externalId: 'reading-a2-teil1-001',
        payload: { id: 'reading-a2-teil1-001', title: 'Seed' },
        createdAt: new Date('2026-01-01'),
        userId: null,
      },
    ])

    const rows = await service.list(user, 'READING')
    expect(rows).toHaveLength(1)
    expect(rows[0]?.externalId).toBe('reading-a2-teil1-001')
  })

  it('creates a generated exercise for the current user', async () => {
    prisma.exercise.create.mockResolvedValue({
      id: 'row-2',
      skill: 'READING',
      level: 'A2',
      source: 'generated',
      visibility: 'PRACTICE',
      externalId: 'generated-1',
      payload: { id: 'generated-1', title: 'New' },
      createdAt: new Date('2026-01-02'),
      userId: user.id,
    })

    const created = await service.create(user, 'READING', { id: 'generated-1', title: 'New' })
    expect(created.externalId).toBe('generated-1')
    expect(prisma.exercise.create).toHaveBeenCalled()
  })

  it('overlays the current user row on a shared seed by externalId', async () => {
    prisma.exercise.findMany.mockResolvedValue([
      {
        id: 'seed-1',
        skill: 'LISTENING',
        level: 'A2',
        source: 'seed',
        visibility: 'PRACTICE',
        externalId: 'listening-a2-teil1-001',
        payload: { id: 'listening-a2-teil1-001', audio: { q1: '/audio/seed.wav' } },
        createdAt: new Date('2026-01-01'),
        userId: null,
      },
      {
        id: 'user-1-row',
        skill: 'LISTENING',
        level: 'A2',
        source: 'generated',
        visibility: 'PRACTICE',
        externalId: 'listening-a2-teil1-001',
        payload: { id: 'listening-a2-teil1-001', audio: { q1: '/audio/override.wav' } },
        createdAt: new Date('2026-01-02'),
        userId: user.id,
      },
    ])

    const rows = await service.list(user, 'LISTENING')
    expect(rows).toHaveLength(1)
    expect((rows[0]?.payload as { audio?: { q1?: string } }).audio?.q1).toBe('/audio/override.wav')
  })
})
