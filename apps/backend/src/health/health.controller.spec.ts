import { Test, TestingModule } from '@nestjs/testing'
import type { HealthReadyResponse } from '@exam-one/contracts'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'

describe('HealthController', () => {
  let controller: HealthController
  let readiness: jest.Mock<Promise<HealthReadyResponse>>

  beforeEach(async () => {
    readiness = jest.fn()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: { readiness } }]
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  it('should return ok status', () => {
    expect(controller.check()).toEqual({
      data: {
        status: 'ok',
        service: 'exam.one-backend'
      }
    })
  })

  it('delegates readiness to the health service', async () => {
    const expected: HealthReadyResponse = {
      data: { status: 'ok', checks: { database: 'up' } }
    }
    readiness.mockResolvedValue(expected)

    await expect(controller.ready()).resolves.toEqual(expected)
    expect(readiness).toHaveBeenCalledTimes(1)
  })
})
