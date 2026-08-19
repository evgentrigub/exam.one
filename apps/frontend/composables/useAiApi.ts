import type { AiResponse } from '@exam-one/contracts'

function apiBaseUrl(): string {
  const config = useRuntimeConfig()
  return String(config.public.apiUrl || 'http://localhost:3001').replace(/\/$/, '')
}

function aiUrl(path: string): string {
  return `${apiBaseUrl()}/api/v1${path.startsWith('/') ? path : `/${path}`}`
}

function envelopeFromUnknown(value: unknown, fallback: string): AiResponse<never> {
  if (value && typeof value === 'object' && 'error' in value) {
    const error = (value as { error?: unknown }).error
    if (typeof error === 'string' && error.trim()) {
      return { data: null, error }
    }
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: unknown }).message
      if (typeof message === 'string' && message.trim()) {
        return { data: null, error: message }
      }
    }
  }
  if (value && typeof value === 'object' && 'message' in value) {
    const message = (value as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return { data: null, error: message }
    }
    if (Array.isArray(message) && message.every(item => typeof item === 'string')) {
      return { data: null, error: message.join(', ') }
    }
  }
  return { data: null, error: fallback }
}

export async function aiFetch<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST'
    body?: unknown
  } = {}
): Promise<AiResponse<T>> {
  try {
    const fetchOptions: {
      method: 'GET' | 'POST'
      credentials: 'include'
      body?: BodyInit | Record<string, unknown> | null
    } = {
      method: options.method ?? 'GET',
      credentials: 'include',
    }
    if (options.body !== undefined) {
      fetchOptions.body = options.body as BodyInit | Record<string, unknown> | null
    }

    return await $fetch<AiResponse<T>>(aiUrl(path), fetchOptions)
  } catch (error: unknown) {
    const fetchError = error as {
      statusCode?: number
      status?: number
      data?: unknown
      message?: string
    }
    const status = fetchError.statusCode ?? fetchError.status ?? 500
    const fallback =
      status === 401 ? 'Please sign in again.' : fetchError.message || 'Request failed'
    return envelopeFromUnknown(fetchError.data, fallback)
  }
}
