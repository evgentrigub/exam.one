import { randomUUID } from 'node:crypto'
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { getLivePack } from '@exam-one/exam-packs'
import type { BackgroundJob, User } from '@exam-one/database'
import type {
  BackgroundJobDto,
  BackgroundJobList,
  BackgroundJobStatus,
  BackgroundJobType,
  JobProgress,
} from '@exam-one/contracts'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { Queue, UnrecoverableError } from 'bullmq'
import { resolveUserPackId } from '../core/context/active-pack'
import { asJson } from '../common/json'
import { toBackgroundJobDto } from '../common/mappers/practice.mapper'
import { JobEventsService } from './job-events.service'
import { FINAL_STAGE, JOB_OPTIONS, QUEUE_NAMES } from './queues'

const TERMINAL = ['COMPLETED', 'FAILED', 'CANCELLED'] as const

@Injectable()
export class BackgroundJobsService {
  private readonly logger = new Logger(BackgroundJobsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: JobEventsService,
    @InjectQueue(QUEUE_NAMES.LISTENING_AUDIO) private readonly audioQueue: Queue,
    @InjectQueue(QUEUE_NAMES.EXERCISE_GENERATION) private readonly exercisesQueue: Queue,
    @InjectQueue(QUEUE_NAMES.MOCK_EXAM_SET) private readonly mockQueue: Queue
  ) {}

  queue(type: BackgroundJobType): Queue {
    if (type === 'LISTENING_AUDIO') return this.audioQueue
    if (type === 'EXERCISE_GENERATION') return this.exercisesQueue
    return this.mockQueue
  }

  jobId(row: Pick<BackgroundJob, 'id' | 'attempt'>): string {
    return `${row.id}-${row.attempt}`
  }

  async addToQueue(row: BackgroundJob): Promise<void> {
    await this.queue(row.type).add(
      row.type,
      { jobRowId: row.id, attempt: row.attempt },
      {
        ...JOB_OPTIONS,
        jobId: this.jobId(row),
      }
    )
  }

  private async publish(row: BackgroundJob): Promise<void> {
    await this.events
      .publish(row.userId, { type: 'upsert', job: toBackgroundJobDto(row) })
      .catch(error => this.logger.warn(`Job event publish failed: ${String(error)}`))
  }

  async enqueue(
    user: User,
    type: BackgroundJobType,
    options: { title: string; subtitle?: string; targetId?: string; input: unknown }
  ): Promise<BackgroundJobDto> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const pack = getLivePack(packId)
    const targetId = options.targetId ?? randomUUID()
    const activeKey = `${user.id}|${packId}|${type}|${targetId}`
    const active = await this.prisma.backgroundJob.findUnique({ where: { activeKey } })
    if (active) return toBackgroundJobDto(active)
    if (
      (await this.prisma.backgroundJob.count({
        where: { userId: user.id, activeKey: { not: null } },
      })) >= 5
    )
      throw new HttpException(
        { code: 'TOO_MANY_JOBS', message: 'Too many active jobs' },
        HttpStatus.TOO_MANY_REQUESTS
      )

    let row: BackgroundJob
    try {
      row = await this.prisma.backgroundJob.create({
        data: {
          userId: user.id,
          packId,
          level: pack.cefr,
          type,
          title: options.title.slice(0, 200),
          ...(options.subtitle ? { subtitle: options.subtitle.slice(0, 200) } : {}),
          targetId,
          activeKey,
          input: asJson(options.input),
          progress: asJson({ stage: 0, stagePercent: 0 }),
          checkpoint: asJson({}),
        },
      })
    } catch (error) {
      const existing = await this.prisma.backgroundJob.findUnique({ where: { activeKey } })
      if (existing) return toBackgroundJobDto(existing)
      throw error
    }
    await this.publish(row)
    try {
      await this.addToQueue(row)
    } catch (error) {
      const failed = await this.fail(row.id, row.attempt, 'Job queue is unavailable', 'QUEUED')
      if (!failed) this.logger.warn(`Queue acknowledgement lost for ${row.id}: ${String(error)}`)
    }
    return toBackgroundJobDto(
      await this.prisma.backgroundJob.findUniqueOrThrow({ where: { id: row.id } })
    )
  }

  async list(userId: string, limit = 50, cursor?: string): Promise<BackgroundJobList> {
    const take = Math.max(1, Math.min(100, limit))
    if (cursor) await this.owned(userId, cursor)
    const [rows, unreadCount] = await Promise.all([
      this.prisma.backgroundJob.findMany({
        where: { userId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      this.prisma.backgroundJob.count({
        where: { userId, status: { in: ['COMPLETED', 'FAILED'] }, seenAt: null },
      }),
    ])
    return {
      jobs: rows.slice(0, take).map(toBackgroundJobDto),
      nextCursor: rows.length > take ? rows[take - 1]!.id : null,
      unreadCount,
    }
  }

  async owned(userId: string, id: string): Promise<BackgroundJob> {
    const row = await this.prisma.backgroundJob.findFirst({ where: { id, userId } })
    if (!row) throw new NotFoundException({ code: 'JOB_NOT_FOUND', message: 'Job not found' })
    return row
  }

  async get(id: string): Promise<BackgroundJob | null> {
    return this.prisma.backgroundJob.findUnique({ where: { id } })
  }

  async markRunning(id: string, attempt: number): Promise<BackgroundJob | null> {
    const claimed = await this.prisma.backgroundJob.updateMany({
      where: { id, attempt, status: 'QUEUED' },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        finishedAt: null,
        revision: { increment: 1 },
      },
    })
    const row = await this.get(id)
    // A queue entry without a row means another environment shares this Redis; fail loudly.
    if (!row) throw new UnrecoverableError(`Background job ${id} not found in this database`)
    if (claimed.count) await this.publish(row)
    // Cancelled while waiting for a BullMQ retry: settle it now instead of after the reconciler timeout.
    if (row.attempt === attempt && row.status === 'CANCEL_REQUESTED')
      await this.fail(id, attempt, 'Cancelled')
    return row.attempt === attempt && row.status === 'RUNNING' ? row : null
  }

  async progress(
    id: string,
    attempt: number,
    progress: JobProgress,
    checkpoint?: unknown
  ): Promise<boolean> {
    const changed = await this.prisma.backgroundJob.updateMany({
      where: { id, attempt, status: 'RUNNING' },
      data: {
        progress: asJson(progress),
        ...(checkpoint !== undefined ? { checkpoint: asJson(checkpoint) } : {}),
        revision: { increment: 1 },
      },
    })
    if (!changed.count) return false
    const row = await this.get(id)
    if (row) await this.publish(row)
    return true
  }

  async complete(id: string, attempt: number, result: unknown): Promise<boolean> {
    const current = await this.get(id)
    if (!current) return false
    const progress = current.progress as unknown as JobProgress
    const done: JobProgress = {
      ...progress,
      stage: FINAL_STAGE[current.type],
      stagePercent: 100,
      ...(progress.items ? { items: progress.items.map(item => ({ ...item, done: true })) } : {}),
    }
    const changed = await this.prisma.backgroundJob.updateMany({
      where: { id, attempt, status: 'RUNNING' },
      data: {
        status: 'COMPLETED',
        result: asJson(result),
        progress: asJson(done),
        activeKey: null,
        seenAt: null,
        finishedAt: new Date(),
        revision: { increment: 1 },
      },
    })
    if (!changed.count) {
      // The work finished after a cancel request; record the cancel rather than leaving it pending.
      const latest = await this.get(id)
      if (latest?.attempt === attempt && latest.status === 'CANCEL_REQUESTED')
        await this.fail(id, attempt, 'Cancelled')
      return false
    }
    const row = await this.get(id)
    if (row) await this.publish(row)
    return true
  }

  async fail(
    id: string,
    attempt: number,
    error: string,
    expectedStatus?: BackgroundJobStatus
  ): Promise<boolean> {
    const row = await this.get(id)
    if (
      !row ||
      row.attempt !== attempt ||
      (expectedStatus && row.status !== expectedStatus) ||
      !['QUEUED', 'RUNNING', 'CANCEL_REQUESTED'].includes(row.status)
    )
      return false
    const changed = await this.prisma.backgroundJob.updateMany({
      where: { id, attempt, status: row.status },
      data: {
        status: row.status === 'CANCEL_REQUESTED' ? 'CANCELLED' : 'FAILED',
        activeKey: null,
        seenAt: null,
        error: error.slice(0, 500),
        finishedAt: new Date(),
        revision: { increment: 1 },
      },
    })
    if (!changed.count) return false
    const updated = await this.get(id)
    if (updated) await this.publish(updated)
    return true
  }

  /** Fail the row for a setup error no retry can fix; throw the result so BullMQ stops too. */
  async abort(
    row: Pick<BackgroundJob, 'id' | 'attempt'>,
    message: string
  ): Promise<UnrecoverableError> {
    await this.fail(row.id, row.attempt, message)
    return new UnrecoverableError(message)
  }

  async cancel(userId: string, id: string): Promise<BackgroundJobDto> {
    const row = await this.owned(userId, id)
    if (row.status !== 'QUEUED' && row.status !== 'RUNNING') return toBackgroundJobDto(row)
    const queued = row.status === 'QUEUED'
    const changed = await this.prisma.backgroundJob.updateMany({
      where: { id, userId, attempt: row.attempt, status: row.status },
      data: queued
        ? {
            status: 'CANCELLED',
            activeKey: null,
            finishedAt: new Date(),
            revision: { increment: 1 },
          }
        : { status: 'CANCEL_REQUESTED', revision: { increment: 1 } },
    })
    if (queued && changed.count) {
      const job = await this.queue(row.type).getJob(this.jobId(row))
      await job?.remove().catch(() => undefined)
    }
    const updated = await this.owned(userId, id)
    if (changed.count) await this.publish(updated)
    if (!changed.count && updated.status === 'RUNNING') return this.cancel(userId, id)
    return toBackgroundJobDto(updated)
  }

  async retry(userId: string, id: string): Promise<BackgroundJobDto> {
    const row = await this.owned(userId, id)
    if (row.status !== 'FAILED')
      throw new ConflictException({
        code: 'JOB_NOT_FAILED',
        message: 'Only failed jobs can be retried',
      })
    const activeKey = `${userId}|${row.packId}|${row.type}|${row.targetId}`
    const active = await this.prisma.backgroundJob.findUnique({ where: { activeKey } })
    if (active)
      throw new ConflictException({ code: 'JOB_ACTIVE', message: 'This work is already running' })
    let changed: { count: number }
    try {
      changed = await this.prisma.backgroundJob.updateMany({
        where: { id, userId, status: 'FAILED', attempt: row.attempt },
        data: {
          status: 'QUEUED',
          activeKey,
          attempt: { increment: 1 },
          revision: { increment: 1 },
          seenAt: null,
          error: null,
          finishedAt: null,
        },
      })
    } catch {
      // Lost a race with a new enqueue of the same target (unique activeKey).
      throw new ConflictException({ code: 'JOB_ACTIVE', message: 'This work is already running' })
    }
    if (!changed.count)
      throw new ConflictException({
        code: 'JOB_CHANGED',
        message: 'Job changed; refresh and try again',
      })
    const updated = await this.owned(userId, id)
    await this.publish(updated)
    try {
      await this.addToQueue(updated)
    } catch {
      await this.fail(id, updated.attempt, 'Job queue is unavailable', 'QUEUED')
    }
    return toBackgroundJobDto(await this.owned(userId, id))
  }

  async markSeen(userId: string): Promise<void> {
    const rows = await this.prisma.backgroundJob.findMany({
      where: { userId, status: { in: ['COMPLETED', 'FAILED'] }, seenAt: null },
    })
    for (const row of rows) {
      const changed = await this.prisma.backgroundJob.updateMany({
        where: { id: row.id, userId, revision: row.revision },
        data: { seenAt: new Date(), revision: { increment: 1 } },
      })
      if (changed.count) {
        const updated = await this.get(row.id)
        if (updated) await this.publish(updated)
      }
    }
  }

  async dismiss(userId: string, id: string): Promise<void> {
    const row = await this.owned(userId, id)
    if (!TERMINAL.includes(row.status as (typeof TERMINAL)[number]))
      throw new ConflictException({
        code: 'JOB_ACTIVE',
        message: 'Cancel the job before dismissing it',
      })
    await this.prisma.backgroundJob.delete({ where: { id: row.id } })
    await this.events
      .publish(userId, { type: 'remove', id, revision: row.revision + 1 })
      .catch(() => undefined)
  }

  async clearFinished(userId: string): Promise<void> {
    const rows = await this.prisma.backgroundJob.findMany({
      where: { userId, status: { in: [...TERMINAL] } },
      select: { id: true },
    })
    for (const row of rows) await this.dismiss(userId, row.id)
  }
}
