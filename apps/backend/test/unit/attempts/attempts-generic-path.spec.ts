/**
 * The pack still carries `compatibility: 'goethe-a2-v1'` at the time of writing, which routes
 * A2 down a separate scoring branch. Stripping it here drives the service through
 * `checkedResult` — the path A2 takes once the flag is removed — so these assertions are
 * meaningful both before and after that happens.
 */
jest.mock('@exam-one/exam-packs', () => {
  const actual = jest.requireActual('@exam-one/exam-packs')
  return {
    ...actual,
    getPack: (packId: string) => {
      const pack = actual.getPack(packId)
      if (!pack) return pack
      const { compatibility: _compatibility, ...rest } = pack
      return rest
    },
  }
})

import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { AttemptsService } from '../../../src/practice/attempts.service'
import { ExercisesService } from '../../../src/practice/exercises.service'
import { makeAttempt, makeExercise, makeUser } from '../../../src/testing/fixtures'

/**
 * These exercise the path A2 takes once `pack.compatibility` is gone. They are written against
 * a pack whose flag is absent, so they stay meaningful before and after the flag is removed:
 * the service is driven through `checkedResult`, not the compatibility branch.
 */
describe('AttemptsService on the generic path', () => {
  let service: AttemptsService
  let prisma: {
    setting: { findUnique: jest.Mock }
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

  /** The created row, so assertions can read what the service decided to persist. */
  const captured = () => prisma.attempt.create.mock.calls[0]?.[0]?.data

  beforeEach(async () => {
    prisma = {
      setting: { findUnique: jest.fn().mockResolvedValue({ packId: 'goethe-de-a2' }) },
      attempt: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn().mockImplementation(() =>
          Promise.resolve({ ...makeAttempt(), result: null, exercise: null })
        ),
        update: jest.fn(),
      },
    }
    exercises = { findForUser: jest.fn().mockResolvedValue(makeExercise()) }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExercisesService, useValue: exercises },
      ],
    }).compile()
    service = module.get(AttemptsService)
  })

  it('scores a reading attempt from the responses envelope the client sends', async () => {
    // All five correct against the fixture's `correctAnswer: 1`.
    await service.create(user, {
      skill: 'READING',
      exerciseExternalId: 'reading-a2-teil1-001',
      answers: {
        score: 5,
        totalQuestions: 5,
        responses: Object.fromEntries(
          Array.from({ length: 5 }, (_, i) => [`reading-a2-teil1-001-q${i + 1}`, 1])
        ),
      },
      result: { score: 5, maxScore: 5, percentage: 100 },
    })

    expect(captured().result.create).toEqual(
      expect.objectContaining({ score: 5, maxScore: 5, percentage: 100 })
    )
  })

  it('does not overwrite a correct client score with zeros', async () => {
    await service.create(user, {
      skill: 'READING',
      exerciseExternalId: 'reading-a2-teil1-001',
      answers: {
        score: 3,
        totalQuestions: 5,
        responses: { 'reading-a2-teil1-001-q1': 1, 'reading-a2-teil1-001-q2': 1 },
      },
      result: { score: 3, maxScore: 5, percentage: 60 },
    })

    expect(captured().result.create.score).toBeGreaterThan(0)
  })

  it('persists a writing review wrapper instead of rejecting it', async () => {
    const review = {
      criteria: [
        { id: 'aufgabenerfuellung', label: 'Task completion', maxPoints: 5, points: 4, comment: 'ok' },
        { id: 'sprache', label: 'Language', maxPoints: 5, points: 4, comment: 'ok' },
      ],
      totalPoints: 8,
      maxPoints: 10,
      summary: 'Gut.',
      strengths: [],
      improvements: [],
    }

    await expect(
      service.create(user, {
        skill: 'WRITING',
        exerciseExternalId: 'reading-a2-teil1-001',
        answers: { kind: 'writing-review', content: 'Sehr geehrte Frau Berger, '.repeat(6) },
        result: { review: { writingReview: { topicId: 't', status: 'ready', responseData: review } } },
      })
    ).resolves.toBeDefined()
  })

  it('persists a speaking attempt record instead of rejecting it', async () => {
    const review = {
      criteria: [
        { id: 'answers', label: 'Answers', maxPoints: 2, points: 2, comment: 'ok' },
        { id: 'questions', label: 'Questions', maxPoints: 2, points: 2, comment: 'ok' },
      ],
      totalPoints: 4,
      maxPoints: 4,
      summary: 'Gut.',
      strengths: [],
      improvements: [],
    }
    const attempt = { id: 's-1', topicId: 't', durationSec: 60, transcripts: { answers: 'a', questions: 'b' }, review }

    await expect(
      service.create(user, {
        skill: 'SPEAKING',
        exerciseExternalId: 'reading-a2-teil1-001',
        answers: attempt,
        result: { review: attempt },
      })
    ).resolves.toBeDefined()
  })

  it('does not create an empty result row for a submission that carries none', async () => {
    await service.create(user, {
      skill: 'WRITING',
      exerciseExternalId: 'reading-a2-teil1-001',
      answers: { id: 'w-1', topicId: 't', content: 'Ein Text.', wordCount: 2 },
    })

    expect(captured().result).toBeUndefined()
  })
})
