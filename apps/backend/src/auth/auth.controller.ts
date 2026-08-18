import { Body, Controller, Get, Post, Req, Res as NestRes } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type {
  ApiResponse,
  AuthConfigDto,
  AuthSessionData,
  MessageResponse,
} from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import type { Request, Response } from 'express'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { REFRESH_COOKIE } from './auth.constants'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { VerifyEmailDto } from './dto/verify-email.dto'
import { ResendVerificationDto } from './dto/resend-verification.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Auth instance config (email / registration)' })
  config(): ApiResponse<AuthConfigDto> {
    return { data: this.auth.getConfig() }
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  async register(
    @Body() dto: RegisterDto,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<ApiResponse<AuthSessionData>> {
    const data = await this.auth.register(dto, res)
    return { data }
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Sign in' })
  async login(
    @Body() dto: LoginDto,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<ApiResponse<AuthSessionData>> {
    const data = await this.auth.login(dto, res)
    return { data }
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Sign out' })
  logout(
    @Req() req: Request,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<MessageResponse> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined
    return this.auth.logoutByRefresh(refreshToken, res)
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access cookie' })
  async refresh(
    @Req() req: Request,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<ApiResponse<AuthSessionData>> {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    const data = await this.auth.refresh(token, res)
    return { data }
  }

  @Get('me')
  @ApiOperation({ summary: 'Current session' })
  me(@CurrentUser() user: User): ApiResponse<AuthSessionData> {
    return { data: this.auth.me(user) }
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-email')
  @ApiOperation({ summary: 'Confirm email with 6-digit code' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<ApiResponse<AuthSessionData>> {
    const data = await this.auth.verifyEmail(dto, res)
    return { data }
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification code' })
  resendVerification(@Body() dto: ResendVerificationDto): Promise<MessageResponse> {
    return this.auth.resendVerification(dto)
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponse> {
    return this.auth.forgotPassword(dto)
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<ApiResponse<AuthSessionData>> {
    const data = await this.auth.resetPassword(dto, res)
    return { data }
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password while signed in' })
  changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto
  ): Promise<MessageResponse> {
    return this.auth.changePassword(user, dto)
  }
}
