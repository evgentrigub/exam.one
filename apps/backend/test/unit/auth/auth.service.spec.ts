import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  BadRequestException,
  ConflictException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common'
import { createHash } from 'node:crypto'
import * as bcrypt from 'bcrypt'
import type { Response } from 'express'
import { AuthTokenType } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { AuthService } from '../../../src/auth/auth.service'
import { EmailService } from '../../../src/email/email.service'
import {
  ACCESS_COOKIE,
  ACCESS_TTL_SECONDS,
  REFRESH_COOKIE,
} from '../../../src/auth/auth.constants'
import { makeCookieResponse, makeUser } from '../../../src/testing/fixtures'

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}))

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

function tokenHash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function expectCode(error: unknown, type: new (...args: never[]) => HttpException, code: string) {
  expect(error).toBeInstanceOf(type)
  expect((error as HttpException).getResponse()).toEqual(expect.objectContaining({ code }))
}

describe('AuthService', () => {
  let service: AuthService
  let prisma: {
    user: {
      findUnique: jest.Mock
      findUniqueOrThrow: jest.Mock
      create: jest.Mock
      update: jest.Mock
    }
    authToken: {
      create: jest.Mock
      findFirst: jest.Mock
      update: jest.Mock
      deleteMany: jest.Mock
    }
    $transaction: jest.Mock
  }
  let email: { isConfigured: jest.Mock; sendMail: jest.Mock }
  let jwt: { signAsync: jest.Mock }
  let res: Pick<Response, 'cookie' | 'clearCookie'>

  beforeEach(async () => {
    mockedBcrypt.hash.mockResolvedValue('hashed-password' as never)
    mockedBcrypt.compare.mockResolvedValue(true as never)

    prisma = {
      user: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      authToken: {
        create: jest.fn().mockResolvedValue({}),
        findFirst: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
    }
    email = {
      isConfigured: jest.fn().mockReturnValue(false),
      sendMail: jest.fn().mockResolvedValue(undefined),
    }
    jwt = {
      signAsync: jest.fn().mockResolvedValue('access-token'),
    }
    res = makeCookieResponse()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              const map: Record<string, string | boolean | number> = {
                'app.JWT_SECRET': 'test-secret',
                'app.AUTH_COOKIE_SECURE': false,
                'app.FRONTEND_URL': 'http://localhost:3000',
                'app.NODE_ENV': 'test',
              }
              return map[key]
            },
          },
        },
        { provide: EmailService, useValue: email },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  it('registers and auto-verifies when SMTP is off', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    const created = makeUser({ email: 'a@b.com', emailVerified: true })
    prisma.user.create.mockResolvedValue(created)

    const result = await service.register(
      { name: 'Ada', email: 'A@B.com', password: 'password1' },
      res as Response
    )

    expect(result.user.email).toBe('a@b.com')
    expect(result.requiresEmailVerification).toBe(false)
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'a@b.com',
          emailVerified: true,
        }),
      })
    )
    expect(res.cookie).toHaveBeenCalled()
  })

  it('rejects duplicate registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' })
    await expect(
      service.register({ name: 'Ada', email: 'a@b.com', password: 'password1' }, res as Response)
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('rejects invalid login', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    await expect(
      service.login({ email: 'a@b.com', password: 'x' }, res as Response)
    ).rejects.toBeInstanceOf(UnauthorizedException)
    expect(mockedBcrypt.compare).toHaveBeenCalledWith('x', expect.any(String))
  })

  it('exposes emailConfigured false by default', () => {
    expect(service.getConfig()).toEqual({
      emailConfigured: false,
      registrationOpen: true,
    })
  })

  it('registers unverified and sends a code when SMTP is on', async () => {
    email.isConfigured.mockReturnValue(true)
    prisma.user.findUnique.mockResolvedValue(null)
    const created = makeUser({ email: 'a@b.com', emailVerified: false })
    prisma.user.create.mockResolvedValue(created)

    const result = await service.register(
      { name: 'Ada', email: 'a@b.com', password: 'password1' },
      res as Response
    )

    expect(result.requiresEmailVerification).toBe(true)
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ emailVerified: false }),
      })
    )
    expect(email.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a@b.com',
        subject: 'Confirm your exam.one email',
      })
    )
    expect(prisma.authToken.create).toHaveBeenCalled()
    expect(res.cookie).toHaveBeenCalledTimes(2)
  })

  it('logs in with valid credentials and sets cookies', async () => {
    const user = makeUser({ email: 'a@b.com' })
    prisma.user.findUnique.mockResolvedValue(user)

    const result = await service.login({ email: 'A@B.com', password: 'password1' }, res as Response)

    expect(mockedBcrypt.compare).toHaveBeenCalledWith('password1', user.passwordHash)
    expect(result.user.email).toBe('a@b.com')
    expect(result.requiresEmailVerification).toBe(false)
    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_COOKIE,
      'access-token',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
    )
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE,
      expect.any(String),
      expect.objectContaining({ httpOnly: true, maxAge: expect.any(Number) })
    )
  })

  it('omits cookie maxAge when remember is false', async () => {
    const user = makeUser({ email: 'a@b.com' })
    prisma.user.findUnique.mockResolvedValue(user)

    await service.login(
      { email: 'a@b.com', password: 'password1', remember: false },
      res as Response
    )

    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_COOKIE,
      'access-token',
      expect.not.objectContaining({ maxAge: expect.anything() })
    )
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE,
      expect.any(String),
      expect.not.objectContaining({ maxAge: expect.anything() })
    )
  })

  it('keeps persistent cookies when remember is true', async () => {
    const user = makeUser({ email: 'a@b.com' })
    prisma.user.findUnique.mockResolvedValue(user)

    await service.login(
      { email: 'a@b.com', password: 'password1', remember: true },
      res as Response
    )

    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_COOKIE,
      'access-token',
      expect.objectContaining({ maxAge: ACCESS_TTL_SECONDS * 1000 })
    )
  })

  it('rejects login when the password does not match', async () => {
    mockedBcrypt.compare.mockResolvedValue(false as never)
    prisma.user.findUnique.mockResolvedValue(makeUser())

    try {
      await service.login({ email: 'ada@example.com', password: 'wrong' }, res as Response)
      fail('expected UnauthorizedException')
    } catch (error) {
      expectCode(error, UnauthorizedException, 'INVALID_CREDENTIALS')
    }
  })

  it('deletes the refresh token and clears cookies on logout', async () => {
    const result = await service.logoutByRefresh('refresh-raw', res as Response)

    expect(result).toEqual({ data: { message: 'Signed out' } })
    expect(prisma.authToken.deleteMany).toHaveBeenCalledWith({
      where: { type: AuthTokenType.REFRESH, tokenHash: tokenHash('refresh-raw') },
    })
    expect(res.clearCookie).toHaveBeenCalledWith(ACCESS_COOKIE, expect.any(Object))
    expect(res.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE, expect.any(Object))
  })

  it('clears cookies on logout even without a refresh token', async () => {
    await service.logoutByRefresh(undefined, res as Response)

    expect(prisma.authToken.deleteMany).not.toHaveBeenCalled()
    expect(res.clearCookie).toHaveBeenCalled()
  })

  it('rejects refresh without a token', async () => {
    try {
      await service.refresh(undefined, res as Response)
      fail('expected UnauthorizedException')
    } catch (error) {
      expectCode(error, UnauthorizedException, 'UNAUTHORIZED')
    }
  })

  it('rejects refresh when the stored token is missing and clears cookies', async () => {
    prisma.authToken.findFirst.mockResolvedValue(null)

    try {
      await service.refresh('stale-refresh', res as Response)
      fail('expected UnauthorizedException')
    } catch (error) {
      expectCode(error, UnauthorizedException, 'UNAUTHORIZED')
    }
    expect(res.clearCookie).toHaveBeenCalled()
  })

  it('rotates the refresh token on success', async () => {
    const user = makeUser({ emailVerified: true })
    prisma.authToken.findFirst.mockResolvedValue({
      id: 'tok-1',
      user,
    })

    const result = await service.refresh('valid-refresh', res as Response)

    expect(prisma.authToken.update).toHaveBeenCalledWith({
      where: { id: 'tok-1' },
      data: { consumedAt: expect.any(Date) },
    })
    expect(result.user.id).toBe(user.id)
    expect(result.requiresEmailVerification).toBe(false)
    expect(res.cookie).toHaveBeenCalledTimes(2)
  })

  it('maps me() and requires verification when SMTP is on and email is unverified', () => {
    email.isConfigured.mockReturnValue(true)
    const user = makeUser({ emailVerified: false })

    expect(service.me(user)).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({ id: user.id, email: user.email }),
        requiresEmailVerification: true,
      })
    )
  })

  it('rejects verifyEmail for an unknown user', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    try {
      await service.verifyEmail({ email: 'missing@example.com', code: '123456' }, res as Response)
      fail('expected BadRequestException')
    } catch (error) {
      expectCode(error, BadRequestException, 'INVALID_CODE')
    }
  })

  it('rejects verifyEmail when the email is already verified', async () => {
    const user = makeUser({ emailVerified: true })
    prisma.user.findUnique.mockResolvedValue(user)

    try {
      await service.verifyEmail({ email: user.email, code: '123456' }, res as Response)
      fail('expected BadRequestException')
    } catch (error) {
      expectCode(error, BadRequestException, 'INVALID_CODE')
    }
    expect(prisma.authToken.findFirst).not.toHaveBeenCalled()
    expect(res.cookie).not.toHaveBeenCalled()
  })

  it('rejects verifyEmail when the code is invalid', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser({ emailVerified: false }))
    prisma.authToken.findFirst.mockResolvedValue(null)

    try {
      await service.verifyEmail({ email: 'ada@example.com', code: '000000' }, res as Response)
      fail('expected BadRequestException')
    } catch (error) {
      expectCode(error, BadRequestException, 'INVALID_CODE')
    }
  })

  it('consumes a valid verification code and signs the user in', async () => {
    const user = makeUser({ emailVerified: false })
    const verified = makeUser({ emailVerified: true })
    prisma.user.findUnique.mockResolvedValue(user)
    prisma.authToken.findFirst.mockResolvedValue({ id: 'verify-1' })
    prisma.user.findUniqueOrThrow.mockResolvedValue(verified)

    const result = await service.verifyEmail({ email: user.email, code: '123456' }, res as Response)

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(result.user.emailVerified).toBe(true)
    expect(result.requiresEmailVerification).toBe(false)
    expect(res.cookie).toHaveBeenCalled()
  })

  it('does not look up a user when resending verification without SMTP', async () => {
    const result = await service.resendVerification({ email: 'ada@example.com' })

    expect(result.data?.message).toContain('If that account needs verification')
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
    expect(email.sendMail).not.toHaveBeenCalled()
  })

  it('sends a new code for an unverified user when SMTP is on', async () => {
    email.isConfigured.mockReturnValue(true)
    prisma.user.findUnique.mockResolvedValue(makeUser({ emailVerified: false }))

    const result = await service.resendVerification({ email: 'Ada@example.com' })

    expect(result.data?.message).toContain('If that account needs verification')
    expect(email.sendMail).toHaveBeenCalled()
    expect(prisma.authToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: AuthTokenType.EMAIL_VERIFY }),
      })
    )
  })

  it('returns the same public message without sending when the user is already verified', async () => {
    email.isConfigured.mockReturnValue(true)
    prisma.user.findUnique.mockResolvedValue(makeUser({ emailVerified: true }))

    const result = await service.resendVerification({ email: 'ada@example.com' })

    expect(result.data?.message).toContain('If that account needs verification')
    expect(email.sendMail).not.toHaveBeenCalled()
  })

  it('returns a public message for forgotPassword when the email is unknown', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const result = await service.forgotPassword({ email: 'missing@example.com' })

    expect(result.data?.message).toContain('If an account exists')
    expect(prisma.authToken.create).not.toHaveBeenCalled()
    expect(email.sendMail).not.toHaveBeenCalled()
  })

  it('creates a reset token and emails a frontend URL when SMTP is on', async () => {
    email.isConfigured.mockReturnValue(true)
    const user = makeUser()
    prisma.user.findUnique.mockResolvedValue(user)

    const result = await service.forgotPassword({ email: user.email })

    expect(result.data?.message).toContain('If an account exists')
    expect(prisma.authToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: user.id, type: AuthTokenType.PASSWORD_RESET },
    })
    expect(prisma.authToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: user.id,
          type: AuthTokenType.PASSWORD_RESET,
        }),
      })
    )
    expect(email.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        subject: 'Reset your exam.one password',
        text: expect.stringContaining('http://localhost:3000/auth/reset?token='),
      })
    )
  })

  it('rejects resetPassword with an invalid token', async () => {
    prisma.authToken.findFirst.mockResolvedValue(null)

    try {
      await service.resetPassword({ token: 'bad', password: 'password1' }, res as Response)
      fail('expected BadRequestException')
    } catch (error) {
      expectCode(error, BadRequestException, 'INVALID_TOKEN')
    }
  })

  it('resets the password, consumes the token, and signs the user in', async () => {
    const storedUser = makeUser()
    const updatedUser = makeUser({ passwordHash: 'hashed-password', emailVerified: true })
    prisma.authToken.findFirst.mockResolvedValue({
      id: 'reset-1',
      userId: storedUser.id,
      user: storedUser,
    })
    prisma.user.findUniqueOrThrow.mockResolvedValue(updatedUser)

    const result = await service.resetPassword(
      { token: 'reset-token', password: 'newpassword' },
      res as Response
    )

    expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword', 10)
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(result.requiresEmailVerification).toBe(false)
    expect(res.cookie).toHaveBeenCalled()
  })

  it('rejects changePassword when the account has no password', async () => {
    const user = makeUser({ passwordHash: null })

    try {
      await service.changePassword(
        user,
        {
          currentPassword: 'old',
          newPassword: 'password1',
        },
        res as Response
      )
      fail('expected BadRequestException')
    } catch (error) {
      expectCode(error, BadRequestException, 'NO_PASSWORD')
    }
  })

  it('rejects changePassword when the current password is wrong', async () => {
    mockedBcrypt.compare.mockResolvedValue(false as never)

    try {
      await service.changePassword(
        makeUser(),
        {
          currentPassword: 'wrong',
          newPassword: 'password1',
        },
        res as Response
      )
      fail('expected BadRequestException')
    } catch (error) {
      expectCode(error, BadRequestException, 'INVALID_PASSWORD')
    }
  })

  it('updates the password hash, deletes refresh tokens, and rotates cookies', async () => {
    const user = makeUser()
    prisma.user.findUniqueOrThrow.mockResolvedValue(user)

    const result = await service.changePassword(
      user,
      {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      },
      res as Response
    )

    expect(result).toEqual({ data: { message: 'Password updated' } })
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { passwordHash: 'hashed-password' },
    })
    expect(prisma.authToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: user.id, type: AuthTokenType.REFRESH },
    })
    expect(res.cookie).toHaveBeenCalledTimes(2)
  })

  it('locks login after five failures for the same email', async () => {
    mockedBcrypt.compare.mockResolvedValue(false as never)
    prisma.user.findUnique.mockResolvedValue(makeUser({ email: 'lock@example.com' }))

    for (let i = 0; i < 5; i++) {
      await expect(
        service.login({ email: 'lock@example.com', password: 'wrong' }, res as Response)
      ).rejects.toBeInstanceOf(UnauthorizedException)
    }

    try {
      await service.login({ email: 'lock@example.com', password: 'wrong' }, res as Response)
      fail('expected HttpException')
    } catch (error) {
      expectCode(error, HttpException, 'TOO_MANY_ATTEMPTS')
      expect((error as HttpException).getStatus()).toBe(429)
    }
    expect(res.cookie).not.toHaveBeenCalled()
  })

  it('clears login lockout after a successful sign-in', async () => {
    mockedBcrypt.compare.mockResolvedValue(false as never)
    const user = makeUser({ email: 'reset-lock@example.com' })
    prisma.user.findUnique.mockResolvedValue(user)

    for (let i = 0; i < 4; i++) {
      await expect(
        service.login({ email: 'reset-lock@example.com', password: 'wrong' }, res as Response)
      ).rejects.toBeInstanceOf(UnauthorizedException)
    }

    mockedBcrypt.compare.mockResolvedValue(true as never)
    await service.login(
      { email: 'reset-lock@example.com', password: 'password1' },
      res as Response
    )

    mockedBcrypt.compare.mockResolvedValue(false as never)
    await expect(
      service.login({ email: 'reset-lock@example.com', password: 'wrong' }, res as Response)
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
