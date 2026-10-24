import { APIConnectionError, APIConnectionTimeoutError } from 'openai'
import { redactLlmError } from '../../../src/ai/llm-errors'
import { isRetryableLlmError, runWithFallback } from '../../../src/ai/llm-fallback'

function httpError(status: number): Error & { status: number } {
  return Object.assign(new Error(`HTTP ${status}`), { status })
}

describe('isRetryableLlmError', () => {
  it.each([402, 429, 404, 500, 502, 503])('retries HTTP %i', status => {
    expect(isRetryableLlmError(httpError(status))).toBe(true)
  })

  it.each([400, 401, 403, 422])('does not retry HTTP %i', status => {
    expect(isRetryableLlmError(httpError(status))).toBe(false)
  })

  it('retries real SDK connection and timeout errors, also after redaction', () => {
    const timeout = new APIConnectionTimeoutError()
    const connection = new APIConnectionError({ message: 'Connection error.' })
    expect(isRetryableLlmError(timeout)).toBe(true)
    expect(isRetryableLlmError(connection)).toBe(true)
    expect(isRetryableLlmError(redactLlmError(timeout, 'sk-key'))).toBe(true)
    expect(isRetryableLlmError(redactLlmError(connection, 'sk-key'))).toBe(true)
  })

  it('retries errors named like connection and timeout errors', () => {
    const timeout = Object.assign(new Error('Request timed out.'), { name: 'APIConnectionTimeoutError' })
    const connection = Object.assign(new Error('Connection error.'), { name: 'APIConnectionError' })
    expect(isRetryableLlmError(timeout)).toBe(true)
    expect(isRetryableLlmError(connection)).toBe(true)
    expect(isRetryableLlmError(new Error('boom'))).toBe(false)
  })
})

describe('runWithFallback', () => {
  it('returns the first model result without trying fallbacks', async () => {
    const attempt = jest.fn(async (model: string) => `ok:${model}`)
    await expect(runWithFallback(['main', 'backup'], attempt)).resolves.toBe('ok:main')
    expect(attempt).toHaveBeenCalledTimes(1)
  })

  it('moves to the next model on a retryable error', async () => {
    const onSwitch = jest.fn()
    const attempt = jest.fn(async (model: string) => {
      if (model === 'main') throw httpError(429)
      return `ok:${model}`
    })
    await expect(runWithFallback(['main', 'backup'], attempt, onSwitch)).resolves.toBe('ok:backup')
    expect(onSwitch).toHaveBeenCalledWith('main', 'backup', expect.any(Error))
  })

  it('stops at a non-retryable error', async () => {
    const attempt = jest.fn(async () => {
      throw httpError(401)
    })
    await expect(runWithFallback(['main', 'backup'], attempt)).rejects.toMatchObject({ status: 401 })
    expect(attempt).toHaveBeenCalledTimes(1)
  })

  it('throws the last error when every model fails', async () => {
    const attempt = jest.fn(async (model: string) => {
      throw httpError(model === 'main' ? 503 : 429)
    })
    await expect(runWithFallback(['main', 'backup'], attempt)).rejects.toMatchObject({ status: 429 })
    expect(attempt).toHaveBeenCalledTimes(2)
  })
})
