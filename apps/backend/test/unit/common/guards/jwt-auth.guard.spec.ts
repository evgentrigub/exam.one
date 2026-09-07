import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { JwtAuthGuard } from '../../../../src/common/guards/jwt-auth.guard'
import { ACCESS_COOKIE } from '../../../../src/auth/auth.constants'
import { makeUser } from '../../../../src/testing/fixtures'

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard
  let reflector: { getAllAndOverride: jest.Mock }
  let jwt: { verifyAsync: jest.Mock }
  let prisma: { user: { findUnique: jest.Mock } }

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) }
    jwt = { verifyAsync: jest.fn() }
    prisma = { user: { findUnique: jest.fn() } }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: reflector },
        { provide: JwtService, useValue: jwt },
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => 'test-secret' },
        },
      ],
    }).compile()

    guard = module.get(JwtAuthGuard)
  })

  function contextWith(request: Record<string, unknown>): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext
  }

  it('allows public routes without a JWT', async () => {
    reflector.getAllAndOverride.mockReturnValue(true)
    const request = { cookies: {} }

    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true)
    expect(jwt.verifyAsync).not.toHaveBeenCalled()
  })

  it('rejects a missing access cookie', async () => {
    await expect(guard.canActivate(contextWith({ cookies: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException
    )
  })

  it('rejects an invalid JWT', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('invalid'))

    await expect(
      guard.canActivate(contextWith({ cookies: { [ACCESS_COOKIE]: 'bad' } }))
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('rejects when the user no longer exists', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'missing' })
    prisma.user.findUnique.mockResolvedValue(null)

    await expect(
      guard.canActivate(contextWith({ cookies: { [ACCESS_COOKIE]: 'token' } }))
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('attaches the user to the request on success', async () => {
    const user = makeUser()
    jwt.verifyAsync.mockResolvedValue({ sub: user.id })
    prisma.user.findUnique.mockResolvedValue(user)
    const request: Record<string, unknown> = { cookies: { [ACCESS_COOKIE]: 'token' } }

    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true)
    expect(request['user']).toBe(user)
    expect(jwt.verifyAsync).toHaveBeenCalledWith('token', { secret: 'test-secret' })
  })
})
