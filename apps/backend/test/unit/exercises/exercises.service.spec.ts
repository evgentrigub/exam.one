import { Test, TestingModule } from '@nestjs/testing'
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { ExercisesService } from '../../../src/practice/exercises.service'
import { makeExercise, makeUser } from '../../../src/testing/fixtures'

function expectCode(error: unknown, type: new (...args: any[]) => HttpException, code: string) {
  expect(error).toBeInstanceOf(type)
  expect((error as HttpException).getResponse()).toEqual(expect.objectContaining({ code }))
}

/**
 * A payload the pack can project. The write-gate validates every created exercise now that
 * the compatibility flag is gone, so a bare `{ id, title }` stub no longer reaches the store.
 */
function readingPayload(id: string, title = 'Seed') {
  return {
    id,
    title,
    content: 'Seed text',
    testingPart: 1,
    questions: Array.from({ length: 5 }, (_, index) => ({
      id: `${id}-q${index + 1}`,
      question: `Frage ${index + 1}`,
      options: ['a', 'b', 'c'],
      correctAnswer: 1,
      explanation: 'Steht im Text.',
    })),
  }
}

describe('ExercisesService', () => {
  let service: ExercisesService
  let prisma: {
    exercise: {
      count: jest.Mock
      findMany: jest.Mock
      findFirst: jest.Mock
      create: jest.Mock
      update: jest.Mock
      delete: jest.Mock
    }
    setting: {
      findUnique: jest.Mock
    }
  }

  const user = makeUser()

  beforeEach(async () => {
    prisma = {
      exercise: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
      },
      setting: {
        findUnique: jest.fn().mockResolvedValue({ packId: 'goethe-de-a2' }),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExercisesService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(ExercisesService)
  })

  it('lists seed exercises for a skill', async () => {
    prisma.exercise.findMany.mockResolvedValue([
      makeExercise({
        id: 'row-1',
        skill: 'READING',
        externalId: 'reading-a2-teil1-001',
        payload: readingPayload('reading-a2-teil1-001'),
      }),
    ])

    const rows = await service.list(user, 'READING')
    expect(rows).toHaveLength(1)
    expect(rows[0]?.externalId).toBe('reading-a2-teil1-001')
  })

  it('creates a generated exercise for the current user', async () => {
    prisma.exercise.create.mockResolvedValue(
      makeExercise({
        id: 'row-2',
        source: 'generated',
        visibility: 'PRACTICE',
        externalId: 'generated-1',
        payload: readingPayload('generated-1', 'New'),
        createdAt: new Date('2026-01-02'),
        userId: user.id,
      })
    )

    const created = await service.create(user, 'READING', readingPayload('generated-1', 'New'))
    expect(created.externalId).toBe('generated-1')
    expect(prisma.exercise.create).toHaveBeenCalled()
  })

  it('overlays the current user row on a shared seed by externalId', async () => {
    prisma.exercise.findMany.mockResolvedValue([
      makeExercise({
        id: 'seed-1',
        skill: 'LISTENING',
        source: 'seed',
        externalId: 'listening-a2-teil1-001',
        payload: { id: 'listening-a2-teil1-001', audio: { q1: '/audio/seed.wav' } },
        userId: null,
      }),
      makeExercise({
        id: 'user-1-row',
        skill: 'LISTENING',
        source: 'generated',
        externalId: 'listening-a2-teil1-001',
        payload: { id: 'listening-a2-teil1-001', audio: { q1: '/audio/override.wav' } },
        createdAt: new Date('2026-01-02'),
        userId: user.id,
      }),
    ])

    const rows = await service.list(user, 'LISTENING')
    expect(rows).toHaveLength(1)
    expect((rows[0]?.payload as { audio?: { q1?: string } }).audio?.q1).toBe('/audio/override.wav')
  })

  it('rejects create when the payload has no id', async () => {
    try {
      await service.create(user, 'READING', { title: 'No id' })
      fail('expected BadRequestException')
    } catch (error) {
      expectCode(error, BadRequestException, 'INVALID_PAYLOAD')
    }
  })

  it('updates an existing user row instead of inserting', async () => {
    const existing = makeExercise({
      id: 'owned-1',
      userId: user.id,
      source: 'generated',
      externalId: 'generated-1',
      payload: readingPayload('generated-1', 'Old'),
    })
    const updated = { ...existing, payload: readingPayload('generated-1', 'New') }
    prisma.exercise.findFirst.mockResolvedValue(existing)
    prisma.exercise.update.mockResolvedValue(updated)

    const result = await service.create(user, 'READING', readingPayload('generated-1', 'New'))

    expect(prisma.exercise.update).toHaveBeenCalledWith({
      where: { id: existing.id },
      data: { payload: readingPayload('generated-1', 'New') },
    })
    expect(prisma.exercise.create).not.toHaveBeenCalled()
    expect(result.payload).toEqual(readingPayload('generated-1', 'New'))
  })

  it('rejects create against a bundled seed id', async () => {
    prisma.exercise.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeExercise({ source: 'seed', externalId: 'reading-a2-teil1-001' }))

    try {
      await service.create(user, 'READING', { id: 'reading-a2-teil1-001', title: 'Overwrite' })
      fail('expected BadRequestException')
    } catch (error) {
      expectCode(error, BadRequestException, 'SEED_ID')
    }
  })

  it('createMany maps each payload through create', async () => {
    prisma.exercise.create
      .mockResolvedValueOnce(
        makeExercise({
          id: 'a',
          userId: user.id,
          source: 'generated',
          externalId: 'gen-a',
          payload: readingPayload('gen-a'),
        })
      )
      .mockResolvedValueOnce(
        makeExercise({
          id: 'b',
          userId: user.id,
          source: 'generated',
          externalId: 'gen-b',
          payload: readingPayload('gen-b'),
        })
      )

    const created = await service.createMany(user, 'READING', [
      readingPayload('gen-a'),
      readingPayload('gen-b'),
    ])

    expect(created.map(row => row.externalId)).toEqual(['gen-a', 'gen-b'])
    expect(prisma.exercise.create).toHaveBeenCalledTimes(2)
  })

  it('findForUser prefers the owned row over a seed', async () => {
    const owned = makeExercise({
      id: 'owned',
      userId: user.id,
      source: 'generated',
      externalId: 'reading-a2-teil1-001',
    })
    prisma.exercise.findFirst.mockResolvedValueOnce(owned)

    await expect(service.findForUser(user, 'READING', 'reading-a2-teil1-001')).resolves.toBe(owned)
    expect(prisma.exercise.findFirst).toHaveBeenCalledTimes(1)
  })

  it('findForUser falls back to the seed row', async () => {
    const seed = makeExercise({ source: 'seed', externalId: 'reading-a2-teil1-001' })
    prisma.exercise.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(seed)

    await expect(service.findForUser(user, 'READING', 'reading-a2-teil1-001')).resolves.toBe(seed)
  })

  it('rejects updateAudio when the exercise is missing', async () => {
    prisma.exercise.findFirst.mockResolvedValue(null)

    try {
      await service.updateAudio(user, 'missing', { q1: '/a.wav' })
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'EXERCISE_NOT_FOUND')
    }
  })

  it('creates a user overlay when updating seed audio', async () => {
    const seed = makeExercise({
      skill: 'LISTENING',
      source: 'seed',
      externalId: 'listening-a2-teil1-001',
      payload: { id: 'listening-a2-teil1-001', audio: { q1: '/seed.wav' } },
    })
    const overlay = makeExercise({
      id: 'overlay-1',
      userId: user.id,
      skill: 'LISTENING',
      source: 'generated',
      externalId: seed.externalId,
      payload: { id: seed.externalId, audio: { q1: '/new.wav' } },
    })
    prisma.exercise.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(seed)
      .mockResolvedValueOnce(null)
    prisma.exercise.create.mockResolvedValue(overlay)

    const result = await service.updateAudio(user, seed.externalId, { q1: '/new.wav' })

    expect(prisma.exercise.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: user.id,
          skill: 'LISTENING',
          source: 'generated',
          externalId: seed.externalId,
        }),
      })
    )
    expect(result.externalId).toBe(seed.externalId)
  })

  it('updates an existing overlay when seed audio is saved again', async () => {
    const seed = makeExercise({
      skill: 'LISTENING',
      source: 'seed',
      externalId: 'listening-a2-teil1-001',
      payload: { id: 'listening-a2-teil1-001' },
    })
    const owned = makeExercise({
      id: 'overlay-1',
      userId: user.id,
      skill: 'LISTENING',
      source: 'generated',
      externalId: seed.externalId,
    })
    prisma.exercise.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(seed)
      .mockResolvedValueOnce(owned)
    prisma.exercise.update.mockResolvedValue({
      ...owned,
      payload: { id: seed.externalId, audio: { q1: '/newer.wav' } },
    })

    await service.updateAudio(user, seed.externalId, { q1: '/newer.wav' })

    expect(prisma.exercise.update).toHaveBeenCalledWith({
      where: { id: owned.id },
      data: { payload: expect.objectContaining({ audio: { q1: '/newer.wav' } }) },
    })
    expect(prisma.exercise.create).not.toHaveBeenCalled()
  })

  it('updates generated listening audio in place', async () => {
    const generated = makeExercise({
      id: 'gen-1',
      userId: user.id,
      skill: 'LISTENING',
      source: 'generated',
      externalId: 'generated-listen-1',
      payload: { id: 'generated-listen-1', audio: { q1: '/old.wav' } },
    })
    prisma.exercise.findFirst.mockResolvedValueOnce(generated)
    prisma.exercise.update.mockResolvedValue({
      ...generated,
      payload: { id: generated.externalId, audio: { q1: '/new.wav' } },
    })

    await service.updateAudio(user, generated.externalId, { q1: '/new.wav' })

    expect(prisma.exercise.update).toHaveBeenCalledWith({
      where: { id: generated.id },
      data: { payload: { id: generated.externalId, audio: { q1: '/new.wav' } } },
    })
  })

  it('deletes an owned exercise', async () => {
    const owned = makeExercise({
      id: 'owned-1',
      userId: user.id,
      source: 'generated',
      externalId: 'generated-1',
    })
    prisma.exercise.findFirst.mockResolvedValueOnce(owned)

    await service.remove(user, owned.externalId)

    expect(prisma.exercise.delete).toHaveBeenCalledWith({ where: { id: owned.id } })
  })

  it('rejects deleting bundled seed content', async () => {
    prisma.exercise.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeExercise({ source: 'seed', externalId: 'reading-a2-teil1-001' }))

    try {
      await service.remove(user, 'reading-a2-teil1-001')
      fail('expected ForbiddenException')
    } catch (error) {
      expectCode(error, ForbiddenException, 'SEED_LOCKED')
    }
  })

  it('rejects deleting a missing exercise', async () => {
    prisma.exercise.findFirst.mockResolvedValue(null)

    try {
      await service.remove(user, 'missing')
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'EXERCISE_NOT_FOUND')
    }
  })
})
