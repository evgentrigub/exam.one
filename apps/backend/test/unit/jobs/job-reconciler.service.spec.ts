import type { BackgroundJob } from '@exam-one/database'
import type { PrismaService } from '@exam-one/nestjs-libraries'
import { JobReconcilerService } from '../../../src/jobs/job-reconciler.service'
import type { BackgroundJobsService } from '../../../src/jobs/background-jobs.service'

const old = new Date(Date.now() - 10 * 60_000)
const row = (overrides: Partial<BackgroundJob> = {}) =>
  ({
    id: 'job-1',
    attempt: 0,
    type: 'MOCK_EXAM_SET',
    status: 'QUEUED',
    updatedAt: old,
    ...overrides,
  }) as BackgroundJob

function setup(rows: BackgroundJob[], job: { getState: jest.Mock; remove: jest.Mock } | null) {
  const prisma = { backgroundJob: { findMany: jest.fn().mockResolvedValue(rows) } }
  const jobs = {
    queue: jest.fn().mockReturnValue({ getJob: jest.fn().mockResolvedValue(job) }),
    jobId: jest.fn().mockReturnValue('job-1-0'),
    addToQueue: jest.fn().mockResolvedValue(undefined),
    fail: jest.fn().mockResolvedValue(true),
  }
  const service = new JobReconcilerService(
    prisma as unknown as PrismaService,
    jobs as unknown as BackgroundJobsService
  )
  return { service, jobs }
}

describe('JobReconcilerService', () => {
  it('re-queues a stale QUEUED row whose queue entry is gone', async () => {
    const { service, jobs } = setup([row()], null)
    await service.reconcile()
    expect(jobs.addToQueue).toHaveBeenCalled()
  })

  it('replaces a queue entry that finished without claiming its row', async () => {
    const job = {
      getState: jest.fn().mockResolvedValue('completed'),
      remove: jest.fn().mockResolvedValue(undefined),
    }
    const { service, jobs } = setup([row()], job)
    await service.reconcile()
    expect(job.remove).toHaveBeenCalled()
    expect(jobs.addToQueue).toHaveBeenCalled()
  })

  it('leaves a waiting queue entry alone', async () => {
    const job = { getState: jest.fn().mockResolvedValue('waiting'), remove: jest.fn() }
    const { service, jobs } = setup([row()], job)
    await service.reconcile()
    expect(job.remove).not.toHaveBeenCalled()
    expect(jobs.addToQueue).not.toHaveBeenCalled()
  })

  it('fails a RUNNING row whose queue entry already finished', async () => {
    const job = { getState: jest.fn().mockResolvedValue('failed'), remove: jest.fn() }
    const { service, jobs } = setup([row({ status: 'RUNNING' })], job)
    await service.reconcile()
    expect(jobs.fail).toHaveBeenCalledWith('job-1', 0, 'Job interrupted; retry to resume')
  })
})
