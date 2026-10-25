import { Body, Controller, Get, Post, Req, Res as NestRes } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type {
  ApiResponse,
  AuthConfigDto,
  AuthSessionData,
  MessageResponse,
} from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import type { Request, Response } from 'express'
import {
  ApiErrorDto,
  AuthConfigResponseDto,
  AuthSessionResponseDto,
  MessageResponseDto,
} from '../dto/api-response.dto'
import { CurrentUser } from '../decorators/current-user.decorator'
import { Public } from '../decorators/public.decorator'
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
  @ApiOperation({
    summary: 'Auth instance config (email / registration)',
    description:
      'Returns server configuration flags indicating whether SMTP email delivery is enabled and whether open registration is allowed.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Authentication configuration flags',
    type: AuthConfigResponseDto,
  })
  config(): ApiResponse<AuthConfigDto> {
    return { data: this.auth.getConfig() }
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({
    summary: 'Register a new account',
    description:
      'Registers a new user account and sets `exam_one_access` and `exam_one_refresh` HTTP-only session cookies. If email delivery is configured, sets `requiresEmailVerification: true` until verified.',
  })
  @ApiResponseDoc({
    status: 201,
    description: 'Account created and session established',
    type: AuthSessionResponseDto,
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Validation failure or weak password',
    type: ApiErrorDto,
  })
  @ApiResponseDoc({
    status: 403,
    description: 'Registration is currently disabled',
    type: ApiErrorDto,
  })
  @ApiResponseDoc({
    status: 409,
    description: 'Email address is already registered',
    type: ApiErrorDto,
  })
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
  @ApiOperation({
    summary: 'Sign in',
    description:
      'Authenticates user credentials and issues `exam_one_access` and `exam_one_refresh` HTTP-only session cookies.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Successfully authenticated session',
    type: AuthSessionResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Validation failure', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Invalid email or password', type: ApiErrorDto })
  async login(
    @Body() dto: LoginDto,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<ApiResponse<AuthSessionData>> {
    const data = await this.auth.login(dto, res)
    return { data }
  }

  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'Sign out',
    description:
      'Revokes the active refresh token session and clears both `exam_one_access` and `exam_one_refresh` cookies.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Session revoked and cookies cleared',
    type: MessageResponseDto,
  })
  logout(
    @Req() req: Request,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<MessageResponse> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined
    return this.auth.logoutByRefresh(refreshToken, res)
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access cookie',
    description:
      'Reads the `exam_one_refresh` HTTP-only cookie, validates token validity, and issues a refreshed `exam_one_access` cookie.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Access token cookie successfully refreshed',
    type: AuthSessionResponseDto,
  })
  @ApiResponseDoc({
    status: 401,
    description: 'Missing, invalid, or revoked refresh cookie',
    type: ApiErrorDto,
  })
  async refresh(
    @Req() req: Request,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<ApiResponse<AuthSessionData>> {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    const data = await this.auth.refresh(token, res)
    return { data }
  }

  @Get('me')
  @ApiCookieAuth('exam_one_access')
  @ApiOperation({
    summary: 'Current session',
    description:
      'Returns the session user profile and email confirmation status for the active `exam_one_access` session.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Current session profile',
    type: AuthSessionResponseDto,
  })
  @ApiResponseDoc({
    status: 401,
    description: 'Unauthorized - invalid or missing session cookie',
    type: ApiErrorDto,
  })
  me(@CurrentUser() user: User): ApiResponse<AuthSessionData> {
    return { data: this.auth.me(user) }
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-email')
  @ApiOperation({
    summary: 'Confirm email with 6-digit code',
    description:
      'Validates the 6-digit code sent to the users email address, marks `emailVerified: true`, and updates session cookies.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Email confirmed and access granted',
    type: AuthSessionResponseDto,
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Invalid or expired confirmation code',
    type: ApiErrorDto,
  })
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
  @ApiOperation({
    summary: 'Resend verification code',
    description:
      'Generates and delivers a fresh 6-digit email confirmation code if the account is unverified.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Verification code resent if account exists',
    type: MessageResponseDto,
  })
  @ApiResponseDoc({
    status: 429,
    description: 'Rate limit exceeded (5 requests/minute)',
    type: ApiErrorDto,
  })
  resendVerification(@Body() dto: ResendVerificationDto): Promise<MessageResponse> {
    return this.auth.resendVerification(dto)
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends a secure password reset link and token to the provided email address if the account exists.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Password reset email queued',
    type: MessageResponseDto,
  })
  @ApiResponseDoc({ status: 429, description: 'Rate limit exceeded', type: ApiErrorDto })
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponse> {
    return this.auth.forgotPassword(dto)
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Resets the account password using the token sent via email, revokes prior sessions, and establishes a new session.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Password reset successfully',
    type: AuthSessionResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid or expired reset token', type: ApiErrorDto })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<ApiResponse<AuthSessionData>> {
    const data = await this.auth.resetPassword(dto, res)
    return { data }
  }

  @Post('change-password')
  @ApiCookieAuth('exam_one_access')
  @ApiOperation({
    summary: 'Change password while signed in',
    description:
      'Updates password for the currently signed-in user after verifying their current password.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Password changed successfully',
    type: MessageResponseDto,
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Incorrect current password or weak new password',
    type: ApiErrorDto,
  })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
    @NestRes({ passthrough: true }) res: Response
  ): Promise<MessageResponse> {
    return this.auth.changePassword(user, dto, res)
  }
}
