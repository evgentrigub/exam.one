import type { AiResponse } from '@exam-one/contracts'
import { refreshAccessCookie } from '~/composables/useApi'

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

type AiFetchOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
}

function isUnauthorized(error: unknown): boolean {
  const fetchError = error as { statusCode?: number; status?: number }
  return (fetchError.statusCode ?? fetchError.status) === 401
}

async function requestAiOnce<T>(path: string, options: AiFetchOptions = {}): Promise<AiResponse<T>> {
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
}

function envelopeFromCatch(error: unknown): AiResponse<never> {
  const fetchError = error as {
    statusCode?: number
    status?: number
    data?: unknown
    message?: string
  }
  const status = fetchError.statusCode ?? fetchError.status ?? 500
  const fallback = status === 401 ? 'Please sign in again.' : fetchError.message || 'Request failed'
  return envelopeFromUnknown(fetchError.data, fallback)
}

export async function aiFetch<T>(
  path: string,
  options: AiFetchOptions = {}
): Promise<AiResponse<T>> {
  try {
    return await requestAiOnce<T>(path, options)
  } catch (error: unknown) {
    if (import.meta.client && isUnauthorized(error) && (await refreshAccessCookie())) {
      try {
        return await requestAiOnce<T>(path, options)
      } catch (retryError: unknown) {
        return envelopeFromCatch(retryError)
      }
    }
    return envelopeFromCatch(error)
  }
}
