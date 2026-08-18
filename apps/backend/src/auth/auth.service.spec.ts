import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import type { Response } from 'express'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { AuthService } from './auth.service'
import { EmailService } from '../email/email.service'

describe('AuthService', () => {
  let service: AuthService
  let prisma: {
    user: {
      findUnique: jest.Mock
      create: jest.Mock
    }
    authToken: {
      create: jest.Mock
      deleteMany: jest.Mock
    }
  }
  let email: { isConfigured: jest.Mock; sendMail: jest.Mock }
  let jwt: { signAsync: jest.Mock }
  let res: { cookie: jest.Mock; clearCookie: jest.Mock }

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      authToken: {
        create: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({}),
      },
    }
    email = {
      isConfigured: jest.fn().mockReturnValue(false),
      sendMail: jest.fn(),
    }
    jwt = {
      signAsync: jest.fn().mockResolvedValue('access-token'),
    }
    res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    }

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
    const created = {
      id: 'u1',
      email: 'a@b.com',
      name: 'Ada',
      examTargetDate: null,
      plan: 'FREE',
      emailVerified: true,
      passwordHash: 'hash',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    }
    prisma.user.create.mockResolvedValue(created)

    const result = await service.register(
      { name: 'Ada', email: 'A@B.com', password: 'password1' },
      res as unknown as Response
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
      service.register(
        { name: 'Ada', email: 'a@b.com', password: 'password1' },
        res as unknown as Response
      )
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('rejects invalid login', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    await expect(
      service.login({ email: 'a@b.com', password: 'x' }, res as unknown as Response)
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('exposes emailConfigured false by default', () => {
    expect(service.getConfig()).toEqual({
      emailConfigured: false,
      registrationOpen: true,
    })
  })
})
