import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { cambridgeEnA2 } from '@exam-one/exam-packs'
import { AttemptsService } from '../../../src/practice/attempts.service'
import { ExercisesService } from '../../../src/practice/exercises.service'
import { makeAttempt, makeExercise, makeUser } from '../../../src/testing/fixtures'

/** Reading Part 5 of the Cambridge pack: six typed gaps, scored against their accepted lists. */
const openCloze = cambridgeEnA2.seedExercises!.reading!.find(s => s['testingPart'] === 5)!
const gapIds = (openCloze['questions'] as Array<{ id: string }>).map(q => q.id)

describe('AttemptsService with typed gap answers', () => {
  let service: AttemptsService
  let create: jest.Mock
  const user = makeUser()

  beforeEach(async () => {
    create = jest.fn().mockImplementation(() =>
      Promise.resolve({ ...makeAttempt(), result: null, exercise: null })
    )
    const prisma = {
      setting: { findUnique: jest.fn().mockResolvedValue({ packId: 'cambridge-en-a2' }) },
      attempt: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create,
        update: jest.fn(),
      },
    }
    const exercises = {
      findForUser: jest.fn().mockResolvedValue(
        makeExercise({
          packId: 'cambridge-en-a2',
          externalId: String(openCloze['id']),
          payload: openCloze as never,
        })
      ),
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExercisesService, useValue: exercises },
      ],
    }).compile()
    service = module.get(AttemptsService)
  })

  it('re-scores typed answers on the server and ignores the client score', async () => {
    // Case, spacing and a trailing full stop do not matter; the fourth gap is misspelled.
    const typed = ['Because', ' at ', 'have.', 'wuold', 'could', 'WHAT']
    await service.create(user, {
      skill: 'READING',
      exerciseExternalId: String(openCloze['id']),
      answers: { responses: Object.fromEntries(gapIds.map((id, i) => [id, typed[i]])) },
      result: { score: 6, maxScore: 6, percentage: 100 },
    })
    const data = create.mock.calls[0]?.[0]?.data
    expect(data.result.create).toEqual(expect.objectContaining({ score: 5, maxScore: 6 }))
    expect(data.snapshot.view.questions[0]).toEqual(
      expect.objectContaining({ options: [], correctAnswer: -1, accepted: ['because', 'since', 'as'] })
    )
  })
})
