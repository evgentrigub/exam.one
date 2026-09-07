import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { ResultsService } from '../../../src/results/results.service'

describe('ResultsService', () => {
  let service: ResultsService
  let count: jest.Mock

  beforeEach(async () => {
    count = jest.fn().mockResolvedValue(0)
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultsService, { provide: PrismaService, useValue: { result: { count } } }],
    }).compile()

    service = module.get(ResultsService)
  })

  it('delegates count() to Prisma', async () => {
    await expect(service.count()).resolves.toBe(0)
    expect(count).toHaveBeenCalled()
  })
})
