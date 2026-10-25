import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, HttpException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { UsersService } from '../../../src/users/users.service'
import { makeUser } from '../../../src/testing/fixtures'

function expectCode(error: unknown, type: new (...args: any[]) => HttpException, code: string) {
  expect(error).toBeInstanceOf(type)
  expect((error as HttpException).getResponse()).toEqual(expect.objectContaining({ code }))
}

describe('UsersService', () => {
  let service: UsersService
  let prisma: {
    user: {
      count: jest.Mock
      findUnique: jest.Mock
      update: jest.Mock
    }
  }

  beforeEach(async () => {
    prisma = {
      user: {
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(UsersService)
  })

  it('resolves with an injected PrismaService', () => {
    expect(service).toBeDefined()
  })

  it('delegates count() to Prisma', async () => {
    await expect(service.count()).resolves.toBe(0)
  })

  it('maps getMe through toUserDto including examTargetDate', () => {
    const user = makeUser({
      examTargetDate: new Date('2026-06-15T00:00:00.000Z'),
    })

    expect(service.getMe(user)).toEqual(
      expect.objectContaining({
        id: user.id,
        email: user.email,
        examTargetDate: '2026-06-15',
      })
    )
  })

  it('trims the name on updateMe', async () => {
    const user = makeUser()
    prisma.user.update.mockResolvedValue(makeUser({ name: 'Ada Lovelace' }))

    await service.updateMe(user, { name: '  Ada Lovelace  ' })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { name: 'Ada Lovelace' },
    })
  })

  it('marks email unverified when the address changes', async () => {
    const user = makeUser({ email: 'ada@example.com', emailVerified: true })
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.update.mockResolvedValue(
      makeUser({ email: 'new@example.com', emailVerified: false })
    )

    const result = await service.updateMe(user, { email: 'New@example.com' })

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'new@example.com' },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { email: 'new@example.com', emailVerified: false },
    })
    expect(result.emailVerified).toBe(false)
  })

  it('does not un-verify when the email is unchanged after normalize', async () => {
    const user = makeUser({ email: 'ada@example.com', emailVerified: true })
    prisma.user.update.mockResolvedValue(user)

    await service.updateMe(user, { email: 'Ada@example.com' })

    expect(prisma.user.findUnique).not.toHaveBeenCalled()
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: {},
    })
  })

  it('rejects a taken email', async () => {
    const user = makeUser()
    prisma.user.findUnique.mockResolvedValue(makeUser({ id: 'other', email: 'taken@example.com' }))

    try {
      await service.updateMe(user, { email: 'taken@example.com' })
      fail('expected ConflictException')
    } catch (error) {
      expectCode(error, ConflictException, 'EMAIL_TAKEN')
    }
  })

  it('clears examTargetDate when null or empty', async () => {
    const user = makeUser()
    prisma.user.update.mockResolvedValue(user)

    await service.updateMe(user, { examTargetDate: null })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { examTargetDate: null },
    })

    await service.updateMe(user, { examTargetDate: '' })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { examTargetDate: null },
    })
  })

  it('parses an ISO examTargetDate', async () => {
    const user = makeUser()
    prisma.user.update.mockResolvedValue(user)

    await service.updateMe(user, { examTargetDate: '2026-06-15' })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { examTargetDate: new Date('2026-06-15') },
    })
  })

  it('returns the user from findById', async () => {
    const user = makeUser()
    prisma.user.findUnique.mockResolvedValue(user)

    await expect(service.findById(user.id)).resolves.toBe(user)
  })

  it('throws USER_NOT_FOUND when findById misses', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    try {
      await service.findById('missing')
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'USER_NOT_FOUND')
    }
  })
})
