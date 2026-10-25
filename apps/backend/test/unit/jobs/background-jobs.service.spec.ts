import { Test } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { PrismaService } from '@exam-one/nestjs-libraries'
import type { BackgroundJob } from '@exam-one/database'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'
import { makeUser } from '../../../src/testing/fixtures'
import { BackgroundJobsService } from '../../../src/jobs/background-jobs.service'
import { JobEventsService } from '../../../src/jobs/job-events.service'
import { QUEUE_NAMES } from '../../../src/jobs/queues'

const now = new Date('2026-01-01T00:00:00Z')
function row(overrides: Partial<BackgroundJob> = {}): BackgroundJob {
  return {
    id: 'job-1',
    userId: 'user-1',
    packId: 'goethe-de-a2',
    level: 'A2',
    type: 'LISTENING_AUDIO',
    status: 'QUEUED',
    title: 'Audio',
    subtitle: null,
    targetId: 'exercise-1',
    activeKey: 'user-1|goethe-de-a2|LISTENING_AUDIO|exercise-1',
    input: { exerciseId: 'exercise-1' },
    progress: { stage: 0, stagePercent: 0 },
    checkpoint: {},
    result: null,
    error: null,
    attempt: 0,
    revision: 0,
    seenAt: null,
    emailAttemptedAt: null,
    createdAt: now,
    startedAt: null,
    finishedAt: null,
    updatedAt: now,
    ...overrides,
  }
}

describe('BackgroundJobsService', () => {
  let service: BackgroundJobsService
  let prisma: {
    backgroundJob: {
      findUnique: jest.Mock
      findFirst: jest.Mock
      findUniqueOrThrow: jest.Mock
      count: jest.Mock
      create: jest.Mock
      updateMany: jest.Mock
      delete: jest.Mock
      findMany: jest.Mock
    }
  }
  let queue: { add: jest.Mock; getJob: jest.Mock }
  let events: { publish: jest.Mock }
  const user = makeUser()

  beforeEach(async () => {
    prisma = {
      backgroundJob: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
    }
    queue = { add: jest.fn().mockResolvedValue(undefined), getJob: jest.fn() }
    events = { publish: jest.fn().mockResolvedValue(undefined) }
    const module = await Test.createTestingModule({
      providers: [
        BackgroundJobsService,
        { provide: PrismaService, useValue: prisma },
        { provide: JobEventsService, useValue: events },
        ...Object.values(QUEUE_NAMES).map(name => ({
          provide: getQueueToken(name),
          useValue: queue,
        })),
      ],
    }).compile()
    service = module.get(BackgroundJobsService)
  })

  it('deduplicates active audio work across tabs', async () => {
    prisma.backgroundJob.findUnique.mockResolvedValue(row())
    const result = await packContext.run({ packId: 'goethe-de-a2' }, () =>
      service.enqueue(user, 'LISTENING_AUDIO', {
        targetId: 'exercise-1',
        title: 'Audio',
        input: { exerciseId: 'exercise-1' },
      })
    )
    expect(result.id).toBe('job-1')
    expect(prisma.backgroundJob.create).not.toHaveBeenCalled()
    expect(queue.add).not.toHaveBeenCalled()
  })

  it('writes to Postgres before adding a valid BullMQ job ID', async () => {
    prisma.backgroundJob.findUnique.mockResolvedValueOnce(null)
    prisma.backgroundJob.create.mockResolvedValue(row())
    prisma.backgroundJob.findUniqueOrThrow.mockResolvedValue(row())
    await packContext.run({ packId: 'goethe-de-a2' }, () =>
      service.enqueue(user, 'LISTENING_AUDIO', {
        targetId: 'exercise-1',
        title: 'Audio',
        input: { exerciseId: 'exercise-1' },
      })
    )
    expect(prisma.backgroundJob.create).toHaveBeenCalled()
    expect(queue.add).toHaveBeenCalledWith(
      'LISTENING_AUDIO',
      { jobRowId: 'job-1', attempt: 0 },
      expect.objectContaining({ jobId: 'job-1-0' })
    )
    expect(events.publish).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ type: 'upsert' })
    )
  })

  it('cannot return another user’s job', async () => {
    prisma.backgroundJob.findFirst.mockResolvedValue(null)
    await expect(service.owned('other-user', 'job-1')).rejects.toMatchObject({ status: 404 })
    expect(prisma.backgroundJob.findFirst).toHaveBeenCalledWith({
      where: { id: 'job-1', userId: 'other-user' },
    })
  })

  it('rejects excessive active jobs before insertion', async () => {
    prisma.backgroundJob.findUnique.mockResolvedValue(null)
    prisma.backgroundJob.count.mockResolvedValue(5)
    await expect(
      packContext.run({ packId: 'goethe-de-a2' }, () =>
        service.enqueue(user, 'LISTENING_AUDIO', {
          targetId: 'exercise-1',
          title: 'Audio',
          input: {},
        })
      )
    ).rejects.toMatchObject({ status: 429 })
  })

  it('only completes the matching active attempt', async () => {
    prisma.backgroundJob.updateMany.mockResolvedValue({ count: 0 })
    await expect(service.complete('job-1', 0, {})).resolves.toBe(false)
    expect(events.publish).not.toHaveBeenCalled()
  })

  it('fails loudly when a queue entry has no row in this database', async () => {
    prisma.backgroundJob.updateMany.mockResolvedValue({ count: 0 })
    prisma.backgroundJob.findUnique.mockResolvedValue(null)
    await expect(service.markRunning('job-1', 0)).rejects.toThrow('not found in this database')
  })

  it('marks completed jobs as fully done', async () => {
    prisma.backgroundJob.findUnique.mockResolvedValue(
      row({
        status: 'RUNNING',
        type: 'EXERCISE_GENERATION',
        progress: { stage: 1, stagePercent: 50, items: [{ label: 'reading:1', done: false }] },
      })
    )
    prisma.backgroundJob.updateMany.mockResolvedValue({ count: 1 })
    await service.complete('job-1', 0, { exerciseIds: ['e'] })
    expect(prisma.backgroundJob.updateMany.mock.calls[0]![0].data.progress).toEqual({
      stage: 2,
      stagePercent: 100,
      items: [{ label: 'reading:1', done: true }],
    })
  })

  it('settles a cancel that arrived while a BullMQ retry was pending', async () => {
    prisma.backgroundJob.updateMany.mockResolvedValue({ count: 0 })
    prisma.backgroundJob.findUnique.mockResolvedValue(row({ status: 'CANCEL_REQUESTED' }))
    await expect(service.markRunning('job-1', 0)).resolves.toBeNull()
    expect(prisma.backgroundJob.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELLED' }),
      })
    )
  })

  it('records a cancel when work finishes after the cancel request', async () => {
    prisma.backgroundJob.findUnique.mockResolvedValue(row({ status: 'CANCEL_REQUESTED' }))
    prisma.backgroundJob.updateMany
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValue({ count: 1 })
    await expect(service.complete('job-1', 0, {})).resolves.toBe(false)
    expect(prisma.backgroundJob.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELLED' }),
      })
    )
  })

  it('refuses to retry when the same target is already active again', async () => {
    prisma.backgroundJob.findFirst.mockResolvedValue(row({ status: 'FAILED', activeKey: null }))
    prisma.backgroundJob.findUnique.mockResolvedValue(row({ id: 'job-2' }))
    await expect(service.retry('user-1', 'job-1')).rejects.toMatchObject({ status: 409 })
    expect(prisma.backgroundJob.updateMany).not.toHaveBeenCalled()
  })
})
