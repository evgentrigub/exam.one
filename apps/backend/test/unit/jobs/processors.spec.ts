import type { BackgroundJob } from '@exam-one/database'
import type { Job } from 'bullmq'
import { ExerciseGenerationProcessor } from '../../../src/jobs/processors/exercise-generation.processor'
import { MockExamProcessor } from '../../../src/jobs/processors/mock-exam.processor'
import type { BackgroundJobsService } from '../../../src/jobs/background-jobs.service'
import type { ExercisesService } from '../../../src/practice/exercises.service'
import type { PackAiService } from '../../../src/ai/pack-ai.service'
import type { MockExamService } from '../../../src/mock-exam/mock-exam.service'
import type { EmailService } from '../../../src/core/email/email.service'
import type { PrismaService } from '@exam-one/nestjs-libraries'
import { makeUser } from '../../../src/testing/fixtures'

jest.mock('@exam-one/exam-packs', () => ({
  ...jest.requireActual('@exam-one/exam-packs'),
  getLivePack: () => ({
    packId: 'goethe-de-a2', title: 'Goethe A2',
    createMockSet: (_n: number, content: unknown) => ({ id: 'set-2', content }),
  }),
  getAvailableExamParts: (_pack: unknown, skill: string) => (skill === 'listening' ? [{ n: 1 }] : []),
}))

const now = new Date('2026-01-01T00:00:00Z')
function row(overrides: Partial<BackgroundJob> = {}): BackgroundJob {
  return {
    id: 'job-1', userId: 'user-1', packId: 'goethe-de-a2', level: 'A2',
    type: 'EXERCISE_GENERATION', status: 'RUNNING', title: 'Jobs', subtitle: null,
    targetId: 't', activeKey: 'k', input: {}, progress: {}, checkpoint: {}, result: null,
    error: null, attempt: 0, revision: 0, seenAt: null, emailAttemptedAt: null,
    createdAt: now, startedAt: now, finishedAt: null, updatedAt: now, ...overrides,
  }
}
const bullJob = { data: { jobRowId: 'job-1', attempt: 0 }, attemptsMade: 0, opts: { attempts: 2 } } as unknown as Job<{ jobRowId: string; attempt: number }>

function jobsService(current: BackgroundJob) {
  return {
    markRunning: jest.fn().mockResolvedValue(current),
    get: jest.fn().mockResolvedValue(current),
    progress: jest.fn().mockResolvedValue(true),
    complete: jest.fn().mockResolvedValue(true),
    fail: jest.fn().mockResolvedValue(true),
    queue: jest.fn(),
  }
}

describe('ExerciseGenerationProcessor', () => {
  const user = makeUser()
  const input = { selections: [{ skill: 'reading', part: 1 }, { skill: 'writing', part: 2 }] }

  it('publishes the item checklist before the first part finishes', async () => {
    const current = row({ input })
    const jobs = jobsService(current)
    const ai = { generate: jest.fn().mockResolvedValue({ data: [{ id: 'x' }], error: null }) }
    const exercises = { create: jest.fn().mockResolvedValue({ externalId: 'ex-1' }) }
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(user) } }
    const processor = new ExerciseGenerationProcessor(
      jobs as unknown as BackgroundJobsService, prisma as unknown as PrismaService,
      exercises as unknown as ExercisesService, ai as unknown as PackAiService
    )

    await processor.process(bullJob)

    expect(jobs.progress.mock.calls[0]![2]).toEqual({
      stage: 1, stagePercent: 0,
      items: [{ label: 'reading:1', done: false }, { label: 'writing:2', done: false }],
    })
    expect(jobs.complete).toHaveBeenCalledWith('job-1', 0, { exerciseIds: ['ex-1', 'ex-1'] })
  })

  it('stops between parts once the job is no longer running', async () => {
    const current = row({ input })
    const jobs = jobsService(current)
    jobs.get.mockResolvedValue({ ...current, status: 'CANCEL_REQUESTED' })
    const ai = { generate: jest.fn() }
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(user) } }
    const processor = new ExerciseGenerationProcessor(
      jobs as unknown as BackgroundJobsService, prisma as unknown as PrismaService,
      {} as ExercisesService, ai as unknown as PackAiService
    )

    await expect(processor.process(bullJob)).rejects.toThrow('Generation cancelled')
    expect(ai.generate).not.toHaveBeenCalled()
    expect(jobs.fail).toHaveBeenCalledWith('job-1', 0, 'Generation cancelled')
  })
})

describe('MockExamProcessor', () => {
  it('reads the audio result from a fresh job, not the add() snapshot', async () => {
    const current = row({ type: 'MOCK_EXAM_SET', input: { setNumber: 2, setId: 'set-2' } })
    const jobs = jobsService(current)
    const audioMap = { shared: '/audio/listening/generated/x/shared.wav', items: {} }
    const snapshot = { id: 'job-1-0-audio-1', getState: jest.fn().mockResolvedValue('completed'), returnvalue: undefined }
    const audioQueue = { add: jest.fn().mockResolvedValue(snapshot), getJob: jest.fn().mockResolvedValue({ returnvalue: audioMap }) }
    jobs.queue.mockReturnValue(audioQueue)
    const ai = { generate: jest.fn().mockResolvedValue({ data: [{ id: 'l1', testingPart: 1 }], error: null }) }
    const mock = { createSet: jest.fn().mockResolvedValue(undefined) }
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(makeUser()) },
      mockExamSet: { findFirst: jest.fn().mockResolvedValue(null) },
      setting: { findUnique: jest.fn().mockResolvedValue(null) },
    }
    const processor = new MockExamProcessor(
      jobs as unknown as BackgroundJobsService, prisma as unknown as PrismaService,
      ai as unknown as PackAiService, mock as unknown as MockExamService,
      { isConfigured: () => false } as unknown as EmailService
    )

    await processor.process(bullJob as unknown as Job<{ jobRowId: string; attempt: number }>)

    expect(audioQueue.getJob).toHaveBeenCalledWith('job-1-0-audio-1')
    const set = mock.createSet.mock.calls[0]![1] as { content: { listening: { audio: unknown }[] } }
    expect(set.content.listening[0]!.audio).toEqual(audioMap)
    expect(jobs.complete).toHaveBeenCalledWith('job-1', 0, { setId: 'set-2' })
  })
})
