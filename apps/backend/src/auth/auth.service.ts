import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { createHash, randomBytes, randomInt } from 'node:crypto'
import * as bcrypt from 'bcrypt'
import type { Response } from 'express'
import type {
  AuthConfigDto,
  AuthSessionData,
  MessageResponse,
} from '@exam-one/contracts'
import { AuthTokenType, type User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { toUserDto } from '../common/mappers/user.mapper'
import type { AppConfig } from '../config/app.config'
import { EmailService } from '../email/email.service'
import {
  ACCESS_COOKIE,
  ACCESS_TTL_SECONDS,
  BCRYPT_ROUNDS,
  REFRESH_COOKIE,
  REFRESH_TTL_SECONDS,
  RESET_TOKEN_TTL_MS,
  VERIFY_CODE_TTL_MS,
} from './auth.constants'
import type { RegisterDto } from './dto/register.dto'
import type { LoginDto } from './dto/login.dto'
import type { VerifyEmailDto } from './dto/verify-email.dto'
import type { ResendVerificationDto } from './dto/resend-verification.dto'
import type { ForgotPasswordDto } from './dto/forgot-password.dto'
import type { ResetPasswordDto } from './dto/reset-password.dto'
import type { ChangePasswordDto } from './dto/change-password.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService
  ) {}

  getConfig(): AuthConfigDto {
    return {
      emailConfigured: this.email.isConfigured(),
      registrationOpen: true,
    }
  }

  async register(dto: RegisterDto, res: Response): Promise<AuthSessionData> {
    const email = dto.email.trim().toLowerCase()
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'An account with this email already exists',
      })
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
    const emailConfigured = this.email.isConfigured()

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name.trim(),
        passwordHash,
        emailVerified: !emailConfigured,
        settings: {
          create: {
            examLevel: 'A2',
            targetLanguage: 'de',
          },
        },
      },
    })

    if (emailConfigured) {
      await this.issueAndSendVerificationCode(user)
    }

    await this.setSessionCookies(user, res)
    return {
      user: toUserDto(user),
      requiresEmailVerification: emailConfigured && !user.emailVerified,
    }
  }

  async login(dto: LoginDto, res: Response): Promise<AuthSessionData> {
    const email = dto.email.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user?.passwordHash) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'That email and password don’t match',
      })
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash)
    if (!ok) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'That email and password don’t match',
      })
    }

    await this.setSessionCookies(user, res)
    return {
      user: toUserDto(user),
      requiresEmailVerification: this.email.isConfigured() && !user.emailVerified,
    }
  }

  async logoutByRefresh(
    refreshToken: string | undefined,
    res: Response
  ): Promise<MessageResponse> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken)
      await this.prisma.authToken.deleteMany({
        where: { type: AuthTokenType.REFRESH, tokenHash },
      })
    }
    this.clearSessionCookies(res)
    return { data: { message: 'Signed out' } }
  }

  async refresh(refreshToken: string | undefined, res: Response): Promise<AuthSessionData> {
    if (!refreshToken) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      })
    }

    const tokenHash = this.hashToken(refreshToken)
    const stored = await this.prisma.authToken.findFirst({
      where: {
        type: AuthTokenType.REFRESH,
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!stored) {
      this.clearSessionCookies(res)
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      })
    }

    await this.prisma.authToken.update({
      where: { id: stored.id },
      data: { consumedAt: new Date() },
    })

    await this.setSessionCookies(stored.user, res)
    return {
      user: toUserDto(stored.user),
      requiresEmailVerification: this.email.isConfigured() && !stored.user.emailVerified,
    }
  }

  me(user: User): AuthSessionData {
    return {
      user: toUserDto(user),
      requiresEmailVerification: this.email.isConfigured() && !user.emailVerified,
    }
  }

  async verifyEmail(dto: VerifyEmailDto, res: Response): Promise<AuthSessionData> {
    const email = dto.email.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new BadRequestException({
        code: 'INVALID_CODE',
        message: 'That code isn’t right. Check the latest email.',
      })
    }

    if (user.emailVerified) {
      await this.setSessionCookies(user, res)
      return { user: toUserDto(user), requiresEmailVerification: false }
    }

    const tokenHash = this.hashToken(dto.code.trim())
    const stored = await this.prisma.authToken.findFirst({
      where: {
        userId: user.id,
        type: AuthTokenType.EMAIL_VERIFY,
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (!stored) {
      throw new BadRequestException({
        code: 'INVALID_CODE',
        message: 'That code isn’t right. Check the latest email.',
      })
    }

    await this.prisma.$transaction([
      this.prisma.authToken.update({
        where: { id: stored.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
      this.prisma.authToken.deleteMany({
        where: { userId: user.id, type: AuthTokenType.EMAIL_VERIFY },
      }),
    ])

    const updated = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    await this.setSessionCookies(updated, res)
    return { user: toUserDto(updated), requiresEmailVerification: false }
  }

  async resendVerification(dto: ResendVerificationDto): Promise<MessageResponse> {
    const message = 'If that account needs verification, we sent a new code.'
    if (!this.email.isConfigured()) {
      return { data: { message } }
    }

    const email = dto.email.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (user && !user.emailVerified) {
      await this.issueAndSendVerificationCode(user)
    }
    return { data: { message } }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponse> {
    const publicMessage =
      'If an account exists for that email, follow the recovery instructions for this instance.'
    const email = dto.email.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      return { data: { message: publicMessage } }
    }

    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = this.hashToken(rawToken)
    await this.prisma.authToken.deleteMany({
      where: { userId: user.id, type: AuthTokenType.PASSWORD_RESET },
    })
    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        type: AuthTokenType.PASSWORD_RESET,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    })

    const frontendUrl = this.config.getOrThrow<string>('app.FRONTEND_URL')
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/auth/reset?token=${rawToken}`

    if (this.email.isConfigured()) {
      await this.email.sendMail({
        to: user.email,
        subject: 'Reset your exam.one password',
        text: `Reset your password:\n\n${resetUrl}\n\nThis link expires in one hour.`,
        html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in one hour.</p>`,
      })
    } else {
      const nodeEnv = this.config.getOrThrow<string>('app.NODE_ENV')
      if (nodeEnv === 'development') {
        this.logger.warn(`Password reset URL (dev only): ${resetUrl}`)
      } else {
        this.logger.warn(
          `Password reset requested for ${user.email} but SMTP is not configured. Use: pnpm auth:set-password --email ${user.email}`
        )
      }
    }

    return { data: { message: publicMessage } }
  }

  async resetPassword(dto: ResetPasswordDto, res: Response): Promise<AuthSessionData> {
    const tokenHash = this.hashToken(dto.token.trim())
    const stored = await this.prisma.authToken.findFirst({
      where: {
        type: AuthTokenType.PASSWORD_RESET,
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!stored) {
      throw new BadRequestException({
        code: 'INVALID_TOKEN',
        message: 'This reset link is invalid or has expired',
      })
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash, emailVerified: true },
      }),
      this.prisma.authToken.update({
        where: { id: stored.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.authToken.deleteMany({
        where: {
          userId: stored.userId,
          type: { in: [AuthTokenType.REFRESH, AuthTokenType.PASSWORD_RESET] },
        },
      }),
    ])

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: stored.userId } })
    await this.setSessionCookies(user, res)
    return { user: toUserDto(user), requiresEmailVerification: false }
  }

  async changePassword(user: User, dto: ChangePasswordDto): Promise<MessageResponse> {
    if (!user.passwordHash) {
      throw new BadRequestException({
        code: 'NO_PASSWORD',
        message: 'This account has no password set',
      })
    }

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!ok) {
      throw new BadRequestException({
        code: 'INVALID_PASSWORD',
        message: 'Current password is incorrect',
      })
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS)
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.authToken.deleteMany({
        where: { userId: user.id, type: AuthTokenType.REFRESH },
      }),
    ])

    return { data: { message: 'Password updated' } }
  }

  private async issueAndSendVerificationCode(user: User): Promise<void> {
    const code = String(randomInt(100000, 1000000))
    const tokenHash = this.hashToken(code)
    await this.prisma.authToken.deleteMany({
      where: { userId: user.id, type: AuthTokenType.EMAIL_VERIFY },
    })
    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        type: AuthTokenType.EMAIL_VERIFY,
        tokenHash,
        expiresAt: new Date(Date.now() + VERIFY_CODE_TTL_MS),
      },
    })
    await this.email.sendMail({
      to: user.email,
      subject: 'Confirm your exam.one email',
      text: `Your verification code is ${code}. It expires in 15 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`,
    })
  }

  private async setSessionCookies(user: User, res: Response): Promise<void> {
    const secret = this.config.getOrThrow<AppConfig['JWT_SECRET']>('app.JWT_SECRET')
    const accessToken = await this.jwt.signAsync(
      { sub: user.id },
      { secret, expiresIn: ACCESS_TTL_SECONDS }
    )

    const refreshRaw = randomBytes(48).toString('hex')
    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        type: AuthTokenType.REFRESH,
        tokenHash: this.hashToken(refreshRaw),
        expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
      },
    })

    const secure = this.config.getOrThrow<boolean>('app.AUTH_COOKIE_SECURE')
    const common = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure,
      path: '/',
    }

    res.cookie(ACCESS_COOKIE, accessToken, { ...common, maxAge: ACCESS_TTL_SECONDS * 1000 })
    res.cookie(REFRESH_COOKIE, refreshRaw, { ...common, maxAge: REFRESH_TTL_SECONDS * 1000 })
  }

  private clearSessionCookies(res: Response): void {
    const secure = this.config.getOrThrow<boolean>('app.AUTH_COOKIE_SECURE')
    const common = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/' }
    res.clearCookie(ACCESS_COOKIE, common)
    res.clearCookie(REFRESH_COOKIE, common)
  }

  private hashToken(value: string): string {
    return createHash('sha256').update(value).digest('hex')
  }
}
