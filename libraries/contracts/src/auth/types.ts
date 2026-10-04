import type { UserDto } from '../domain/user'
import type { ApiResponse } from '../api/response'

export interface AuthConfigDto {
  emailConfigured: boolean
  registrationOpen: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  examTargetDate?: string | null
}

export interface UpdateSettingRequest {
  packId?: string
  examLevel?: 'A2' | 'C1'
  targetLanguage?: string
  notifyMockReadyEmail?: boolean
}

export interface AuthSessionData {
  user: UserDto
  /** True when email verification is still required before full access */
  requiresEmailVerification: boolean
}

export type AuthConfigResponse = ApiResponse<AuthConfigDto>
export type AuthSessionResponse = ApiResponse<AuthSessionData>
export type MessageResponse = ApiResponse<{ message: string }>
