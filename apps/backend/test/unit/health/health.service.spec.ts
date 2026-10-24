import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { HealthService } from '../../../src/core/health/health.service'
import { JobEventsService } from '../../../src/jobs/job-events.service'

describe('HealthService', () => {
  let service: HealthService
  let queryRaw: jest.Mock

  beforeEach(async () => {
    queryRaw = jest.fn()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } },
        { provide: JobEventsService, useValue: { ping: jest.fn().mockResolvedValue('PONG') } },
      ],
    }).compile()

    service = module.get<HealthService>(HealthService)
  })

  it('reports database up when the query succeeds', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }])

    await expect(service.readiness()).resolves.toEqual({
      data: { status: 'ok', checks: { database: 'up', redis: 'up' } },
    })
  })

  it('degrades to a business error envelope when the query fails', async () => {
    queryRaw.mockRejectedValue(new Error('connection refused'))

    const result = await service.readiness()

    expect(result.data).toEqual({ status: 'degraded', checks: { database: 'down', redis: 'up' } })
    expect(result.error?.code).toBe('DATABASE_UNAVAILABLE')
  })
})
