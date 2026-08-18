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

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    query?: Record<string, string>
  } = {}
): Promise<T> {
  const url = `${apiBaseUrl()}/api/v1${path.startsWith('/') ? path : `/${path}`}`

  try {
    const fetchOptions: {
      method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
      credentials: 'include'
      body?: BodyInit | Record<string, unknown> | null
      query?: Record<string, string>
    } = {
      method: (options.method ?? 'GET') as 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
      credentials: 'include',
    }
    if (options.body !== undefined) {
      fetchOptions.body = options.body as BodyInit | Record<string, unknown> | null
    }
    if (options.query !== undefined) {
      fetchOptions.query = options.query
    }

    const res = await $fetch<ApiResponse<T>>(url, fetchOptions)

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
