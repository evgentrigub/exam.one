import { HttpException, HttpStatus } from '@nestjs/common'
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
      providers: [{ provide: HealthService, useValue: { readiness } }],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  it('should return ok status', () => {
    expect(controller.check()).toEqual({
      data: {
        status: 'ok',
        service: 'exam.one-backend',
      },
    })
  })

  it('delegates readiness to the health service', async () => {
    const expected: HealthReadyResponse = {
      data: { status: 'ok', checks: { database: 'up' } },
    }
    readiness.mockResolvedValue(expected)

    await expect(controller.ready()).resolves.toEqual(expected)
    expect(readiness).toHaveBeenCalledTimes(1)
  })

  it('throws 503 when readiness is degraded', async () => {
    const degraded: HealthReadyResponse = {
      data: { status: 'degraded', checks: { database: 'down' } },
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is not reachable',
      },
    }
    readiness.mockResolvedValue(degraded)

    try {
      await controller.ready()
      throw new Error('expected HttpException')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException)
      const exception = error as HttpException
      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE)
      expect(exception.getResponse()).toEqual(degraded)
    }
  })
})
