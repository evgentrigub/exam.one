import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { HealthService } from './health.service'

describe('HealthService', () => {
  let service: HealthService
  let queryRaw: jest.Mock

  beforeEach(async () => {
    queryRaw = jest.fn()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } }
      ]
    }).compile()

    service = module.get<HealthService>(HealthService)
  })

  it('reports database up when the query succeeds', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }])

    await expect(service.readiness()).resolves.toEqual({
      data: { status: 'ok', checks: { database: 'up' } }
    })
  })

  it('degrades to a business error envelope when the query fails', async () => {
    queryRaw.mockRejectedValue(new Error('connection refused'))

    const result = await service.readiness()

    expect(result.data).toEqual({ status: 'degraded', checks: { database: 'down' } })
    expect(result.error?.code).toBe('DATABASE_UNAVAILABLE')
  })
})
