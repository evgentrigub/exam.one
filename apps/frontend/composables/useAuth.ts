import type { AuthConfigDto, AuthSessionData, SettingDto, UserDto } from '@exam-one/contracts'
import { ApiClientError, apiFetch } from '~/composables/useApi'

const sessionUser = ref<UserDto | null>(null)
const sessionReady = ref(false)
const authConfig = ref<AuthConfigDto | null>(null)

export function useAuth() {
  async function loadConfig(): Promise<AuthConfigDto> {
    const data = await apiFetch<AuthConfigDto>('/auth/config')
    authConfig.value = data
    return data
  }

  async function refreshSession(): Promise<UserDto | null> {
    try {
      const data = await apiFetch<AuthSessionData>('/auth/me')
      sessionUser.value = data.user
      return data.user
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        try {
          const data = await apiFetch<AuthSessionData>('/auth/refresh', { method: 'POST' })
          sessionUser.value = data.user
          return data.user
        } catch {
          sessionUser.value = null
          return null
        }
      }
      sessionUser.value = null
      return null
    } finally {
      sessionReady.value = true
    }
  }

  async function ensureSession(): Promise<UserDto | null> {
    if (sessionReady.value) return sessionUser.value
    return refreshSession()
  }

  async function register(input: {
    name: string
    email: string
    password: string
  }): Promise<AuthSessionData> {
    const data = await apiFetch<AuthSessionData>('/auth/register', {
      method: 'POST',
      body: input,
    })
    sessionUser.value = data.user
    sessionReady.value = true
    return data
  }

  async function login(input: {
    email: string
    password: string
    remember?: boolean
  }): Promise<AuthSessionData> {
    const data = await apiFetch<AuthSessionData>('/auth/login', {
      method: 'POST',
      body: input,
    })
    sessionUser.value = data.user
    sessionReady.value = true
    return data
  }

  async function logout(): Promise<void> {
    try {
      await apiFetch<{ message: string }>('/auth/logout', { method: 'POST' })
    } finally {
      sessionUser.value = null
      sessionReady.value = true
    }
  }

  async function forgotPassword(email: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  }

  async function resetPassword(input: {
    token: string
    password: string
  }): Promise<AuthSessionData> {
    const data = await apiFetch<AuthSessionData>('/auth/reset-password', {
      method: 'POST',
      body: input,
    })
    sessionUser.value = data.user
    sessionReady.value = true
    return data
  }

  async function verifyEmail(input: { email: string; code: string }): Promise<AuthSessionData> {
    const data = await apiFetch<AuthSessionData>('/auth/verify-email', {
      method: 'POST',
      body: input,
    })
    sessionUser.value = data.user
    sessionReady.value = true
    return data
  }

  async function resendVerification(email: string): Promise<void> {
    await apiFetch<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: { email },
    })
  }

  async function changePassword(input: {
    currentPassword: string
    newPassword: string
  }): Promise<void> {
    await apiFetch<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: input,
    })
  }

  async function updateProfile(input: {
    name?: string
    email?: string
    examTargetDate?: string | null
  }): Promise<UserDto> {
    const data = await apiFetch<UserDto>('/users/me', { method: 'PATCH', body: input })
    sessionUser.value = data
    return data
  }

  async function getSettings(): Promise<SettingDto> {
    return apiFetch<SettingDto>('/settings/me')
  }

  async function updateSettings(input: {
    packId?: string
    examLevel?: 'A2' | 'C1'
    targetLanguage?: string
    notifyMockReadyEmail?: boolean
  }): Promise<SettingDto> {
    return apiFetch<SettingDto>('/settings/me', { method: 'PATCH', body: input })
  }

  return {
    // State
    user: readonly(sessionUser),
    sessionReady: readonly(sessionReady),
    authConfig: readonly(authConfig),
    // Methods
    loadConfig,
    refreshSession,
    ensureSession,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    changePassword,
    updateProfile,
    getSettings,
    updateSettings,
  }
}
