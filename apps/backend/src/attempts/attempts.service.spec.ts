import { Test, TestingModule } from '@nestjs/testing'
import { HttpException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { AttemptsService } from './attempts.service'
import { ExercisesService } from '../exercises/exercises.service'
import { makeAttempt, makeExercise, makeResult, makeUser } from '../testing/fixtures'

function expectCode(error: unknown, type: typeof HttpException, code: string) {
  expect(error).toBeInstanceOf(type)
  expect((error as HttpException).getResponse()).toEqual(expect.objectContaining({ code }))
}

describe('AttemptsService', () => {
  let service: AttemptsService
  let prisma: {
    attempt: {
      count: jest.Mock
      findMany: jest.Mock
      findFirst: jest.Mock
      create: jest.Mock
      update: jest.Mock
    }
  }
  let exercises: { findForUser: jest.Mock }

  const user = makeUser()

  beforeEach(async () => {
    prisma = {
      attempt: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    }
    exercises = { findForUser: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExercisesService, useValue: exercises },
      ],
    }).compile()

    service = module.get(AttemptsService)
  })

  it('lists attempts mapped with nested result and exerciseExternalId', async () => {
    const exercise = makeExercise({ externalId: 'reading-a2-teil1-001' })
    const result = makeResult()
    prisma.attempt.findMany.mockResolvedValue([
      { ...makeAttempt({ exerciseId: exercise.id }), result, exercise },
    ])

    const rows = await service.list(user, 'READING')

    expect(rows).toHaveLength(1)
    expect(rows[0]?.exerciseExternalId).toBe('reading-a2-teil1-001')
    expect(rows[0]?.result?.score).toBe(8)
  })

  it('creates an attempt without an exercise id', async () => {
    prisma.attempt.create.mockResolvedValue({
      ...makeAttempt({ exerciseId: null }),
      result: null,
      exercise: null,
    })

    const created = await service.create(user, {
      skill: 'READING',
      answers: { q1: 'a' },
    })

    expect(exercises.findForUser).not.toHaveBeenCalled()
    expect(prisma.attempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: user.id,
          skill: 'READING',
          exerciseId: null,
          answers: { q1: 'a' },
        }),
      })
    )
    expect(created.exerciseExternalId).toBeNull()
  })

  it('looks up the exercise and nested-creates a result', async () => {
    const exercise = makeExercise({ id: 'ex-9', userId: user.id, source: 'generated' })
    exercises.findForUser.mockResolvedValue(exercise)
    const result = makeResult({ score: 3, maxScore: 5, percentage: 60 })
    prisma.attempt.create.mockResolvedValue({
      ...makeAttempt({ exerciseId: exercise.id }),
      result,
      exercise,
    })

    await service.create(user, {
      skill: 'READING',
      exerciseExternalId: exercise.externalId,
      answers: { q1: 'b' },
      result: { score: 3, maxScore: 5, percentage: 60, review: { note: 'ok' } },
    })

    expect(exercises.findForUser).toHaveBeenCalledWith(user, 'READING', exercise.externalId)
    expect(prisma.attempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          exerciseId: exercise.id,
          result: {
            create: {
              score: 3,
              maxScore: 5,
              percentage: 60,
              review: { note: 'ok' },
            },
          },
        }),
      })
    )
  })

  it('rejects patch when the attempt is missing', async () => {
    prisma.attempt.findFirst.mockResolvedValue(null)

    try {
      await service.patch(user, 'missing', { answers: { q1: 'c' } })
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'ATTEMPT_NOT_FOUND')
    }
  })

  it('patches answers and updates an existing result', async () => {
    const existingResult = makeResult({ score: 1, maxScore: 10, percentage: 10 })
    const existing = {
      ...makeAttempt({ id: 'att-1' }),
      result: existingResult,
    }
    const exercise = makeExercise()
    prisma.attempt.findFirst.mockResolvedValue(existing)
    prisma.attempt.update.mockResolvedValue({
      ...existing,
      answers: { q1: 'updated' },
      result: { ...existingResult, score: 9, percentage: 90 },
      exercise,
    })

    await service.patch(user, existing.id, {
      answers: { q1: 'updated' },
      result: { score: 9, percentage: 90 },
    })

    expect(prisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          answers: { q1: 'updated' },
          result: {
            update: {
              score: 9,
              maxScore: existingResult.maxScore,
              percentage: 90,
            },
          },
        }),
      })
    )
  })

  it('nested-creates a result when patching an attempt that has none', async () => {
    const existing = { ...makeAttempt({ id: 'att-2' }), result: null }
    prisma.attempt.findFirst.mockResolvedValue(existing)
    prisma.attempt.update.mockResolvedValue({
      ...existing,
      result: makeResult({ score: 4, maxScore: 4, percentage: 100 }),
      exercise: null,
    })

    await service.patch(user, existing.id, {
      result: { score: 4, maxScore: 4, percentage: 100, review: { ok: true } },
    })

    expect(prisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          result: {
            create: {
              score: 4,
              maxScore: 4,
              percentage: 100,
              review: { ok: true },
            },
          },
        }),
      })
    )
  })

  it('upsertLatestResult patches the latest matching attempt', async () => {
    const exercise = makeExercise({ externalId: 'reading-a2-teil1-001' })
    const older = {
      ...makeAttempt({ id: 'old', submittedAt: new Date('2026-01-01') }),
      result: null,
      exercise,
    }
    const newer = {
      ...makeAttempt({ id: 'new', submittedAt: new Date('2026-01-02') }),
      result: null,
      exercise,
    }
    prisma.attempt.findMany.mockResolvedValue([older, newer])
    prisma.attempt.findFirst.mockResolvedValue(newer)
    prisma.attempt.update.mockResolvedValue({
      ...newer,
      result: makeResult({ score: 5, maxScore: 5, percentage: 100 }),
    })

    const result = await service.upsertLatestResult(
      user,
      'READING',
      'reading-a2-teil1-001',
      { score: 5, maxScore: 5, percentage: 100 },
      { q1: 'final' }
    )

    expect(prisma.attempt.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'new' } })
    )
    expect(prisma.attempt.create).not.toHaveBeenCalled()
    expect(result.id).toBe('new')
  })

  it('upsertLatestResult creates with artifact answers when none exist', async () => {
    prisma.attempt.findMany.mockResolvedValue([])
    const exercise = makeExercise({ id: 'ex-2', externalId: 'reading-a2-teil1-001' })
    exercises.findForUser.mockResolvedValue(exercise)
    prisma.attempt.create.mockResolvedValue({
      ...makeAttempt({ exerciseId: exercise.id }),
      result: makeResult(),
      exercise,
    })

    await service.upsertLatestResult(user, 'READING', 'reading-a2-teil1-001', {
      score: 1,
      maxScore: 1,
      percentage: 100,
    })

    expect(prisma.attempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          answers: { kind: 'artifact' },
          result: expect.objectContaining({
            create: expect.objectContaining({ score: 1, maxScore: 1, percentage: 100 }),
          }),
        }),
      })
    )
  })
})
