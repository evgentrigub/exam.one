import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import type { HealthReadyResponse } from '@exam-one/contracts'
import { JobEventsService } from '../../jobs/job-events.service'

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(private readonly prisma: PrismaService, private readonly jobs: JobEventsService) {}

  async readiness(): Promise<HealthReadyResponse> {
    const [database, redis] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1 FROM "_prisma_migrations" LIMIT 1`,
      this.jobs.ping(),
    ])
    const checks = {
      database: database.status === 'fulfilled' ? 'up' as const : 'down' as const,
      redis: redis.status === 'fulfilled' ? 'up' as const : 'down' as const,
    }
    if (checks.database === 'up' && checks.redis === 'up') return { data: { status: 'ok', checks } }
    this.logger.warn(`Readiness check failed: database=${checks.database} redis=${checks.redis}`)
    return {
      data: { status: 'degraded', checks },
      error: {
        code: checks.database === 'down' ? 'DATABASE_UNAVAILABLE' : 'REDIS_UNAVAILABLE',
        message: checks.database === 'down' ? 'Database is not reachable' : 'Job queue is not reachable',
      },
    }
  }
}
