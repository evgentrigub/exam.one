import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: { user: { count: jest.fn().mockResolvedValue(0) } },
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('resolves with an injected PrismaService', () => {
    expect(service).toBeDefined()
  })

  it('delegates count() to Prisma', async () => {
    await expect(service.count()).resolves.toBe(0)
  })
})
