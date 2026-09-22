import { packEpoch } from '~/utils/packScope'
import { useSettingsStore } from '~/stores/settings'
import type { ApiError, ApiResponse } from '@exam-one/contracts'

export class ApiClientError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, error: ApiError) {
    super(error.message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = error.code
    this.details = error.details
  }
}

function apiBaseUrl(): string {
  const config = useRuntimeConfig()
  return String(config.public.apiUrl || 'http://localhost:3001').replace(/\/$/, '')
}

const SKIP_REFRESH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
])

function normalizeApiPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function shouldAttemptRefresh(path: string): boolean {
  return !SKIP_REFRESH_PATHS.has(normalizeApiPath(path))
}

let refreshInFlight: Promise<boolean> | null = null

/** Rotate the access cookie once; concurrent 401s share the same refresh. */
export async function refreshAccessCookie(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        await $fetch(`${apiBaseUrl()}/api/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        return true
      } catch {
        return false
      } finally {
        refreshInFlight = null
      }
    })()
  }
  return refreshInFlight
}

export type ApiFetchOptions = {
  packId?: string

  method?: string
  body?: unknown
  query?: Record<string, string>
}

async function requestOnce<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = `${apiBaseUrl()}/api/v1${normalizeApiPath(path)}`

  try {
    const fetchOptions: {
      method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
      credentials: 'include'
      headers: Record<string, string>
      body?: BodyInit | Record<string, unknown> | null
      query?: Record<string, string>
    } = {
      method: (options.method ?? 'GET') as 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
      credentials: 'include',
      headers: { 'x-exam-pack': options.packId ?? useSettingsStore().packId },
    }
    if (options.body !== undefined) {
      fetchOptions.body = options.body as BodyInit | Record<string, unknown> | null
    }
    if (options.query !== undefined) {
      fetchOptions.query = options.query
    }

    const res = (await $fetch(url, fetchOptions)) as ApiResponse<T>

    if (res.error) {
      throw new ApiClientError(400, res.error)
    }
    return res.data as T
  } catch (error: unknown) {
    if (error instanceof ApiClientError) throw error

    const fetchError = error as {
      statusCode?: number
      status?: number
      data?: ApiResponse<unknown> | { message?: string; error?: ApiError }
      message?: string
    }

    const status = fetchError.statusCode ?? fetchError.status ?? 500
    const nested = fetchError.data
    if (nested && typeof nested === 'object' && 'error' in nested && nested.error) {
      throw new ApiClientError(status, nested.error as ApiError)
    }

    // Nest often puts { code, message } directly in response body via exception filter default
    const body = nested as { code?: string; message?: string } | undefined
    if (body?.code && body?.message) {
      throw new ApiClientError(status, { code: body.code, message: body.message })
    }

    // Nest HttpException with object body: { statusCode, message: { code, message }, error }
    const nestBody = nested as
      | { message?: string | string[] | { code?: string; message?: string }; code?: string }
      | undefined
    if (
      nestBody?.message &&
      typeof nestBody.message === 'object' &&
      !Array.isArray(nestBody.message) &&
      nestBody.message.code &&
      nestBody.message.message
    ) {
      throw new ApiClientError(status, {
        code: nestBody.message.code,
        message: nestBody.message.message,
      })
    }

    const nestMsg = nestBody?.message
    const message = Array.isArray(nestMsg)
      ? nestMsg.join(', ')
      : typeof nestMsg === 'string'
        ? nestMsg
        : fetchError.message || 'Request failed'

    throw new ApiClientError(status, {
      code: status === 401 ? 'UNAUTHORIZED' : 'REQUEST_FAILED',
      message,
    })
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  options = { ...options, packId: options.packId ?? useSettingsStore().packId }
  const epoch = packEpoch()
  try {
    const result = await requestOnce<T>(path, options)
    if (epoch !== packEpoch() && (options.method ?? 'GET') === 'GET') throw new ApiClientError(409, { code: 'PACK_CHANGED', message: 'Exam selection changed' })
    return result
  } catch (error: unknown) {
    if (
      import.meta.client &&
      error instanceof ApiClientError &&
      error.status === 401 &&
      shouldAttemptRefresh(path) &&
      (await refreshAccessCookie())
    ) {
      const result = await requestOnce<T>(path, options)
      if (epoch !== packEpoch() && (options.method ?? 'GET') === 'GET') throw new ApiClientError(409, { code: 'PACK_CHANGED', message: 'Exam selection changed' })
      return result
    }
    throw error
  }
}
