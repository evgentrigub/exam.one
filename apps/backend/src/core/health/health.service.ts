import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import type { HealthReadyResponse } from '@exam-one/contracts'

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(private readonly prisma: PrismaService) {}

  async readiness(): Promise<HealthReadyResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1 FROM "_prisma_migrations" LIMIT 1`
      return { data: { status: 'ok', checks: { database: 'up' } } }
    } catch (error) {
      this.logger.warn(`Database readiness check failed: ${String(error)}`)
      return {
        data: { status: 'degraded', checks: { database: 'down' } },
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database is not reachable',
        },
      }
    }
  }
}
