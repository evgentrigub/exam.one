import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { BackgroundJobsService } from './background-jobs.service'

@Injectable()
export class JobReconcilerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(JobReconcilerService.name)
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(private readonly prisma: PrismaService, private readonly jobs: BackgroundJobsService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.reconcile()
    this.timer = setInterval(() => { void this.reconcile().catch(error => this.logger.warn(String(error))) }, 60_000)
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer)
  }

  async reconcile(): Promise<void> {
    const rows = await this.prisma.backgroundJob.findMany({
      where: { status: { in: ['QUEUED', 'RUNNING', 'CANCEL_REQUESTED'] }, updatedAt: { lt: new Date(Date.now() - 5 * 60_000) } },
    })
    for (const row of rows) {
      const queue = this.jobs.queue(row.type)
      const job = await queue.getJob(this.jobs.jobId(row))
      if (row.status === 'QUEUED') {
        const state = job ? await job.getState() : null
        // A finished queue entry for a still-QUEUED row was swallowed; replace it.
        if (job && (state === 'completed' || state === 'failed')) await job.remove()
        if (!job || state === 'completed' || state === 'failed') await this.jobs.addToQueue(row)
        continue
      }
      if (!job || ['completed', 'failed', 'unknown'].includes(await job.getState()))
        await this.jobs.fail(row.id, row.attempt, row.status === 'CANCEL_REQUESTED' ? 'Cancelled' : 'Job interrupted; retry to resume')
    }
  }
}
