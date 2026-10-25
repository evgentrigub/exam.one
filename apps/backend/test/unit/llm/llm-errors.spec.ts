import { redactLlmError, redactSecrets } from '../../../src/ai/llm-errors'

describe('redactSecrets', () => {
  it('removes the exact key and anything shaped like a provider key', () => {
    const text =
      'Incorrect API key provided: sk-proj-abc123def456. Also sk-ant-api03-zzzzzzzz, xai-ABCDEFGH1234 and AIzaSyA1234567890abcdef, plus my-custom-secret-key.'
    const result = redactSecrets(text, 'my-custom-secret-key')
    expect(result).not.toMatch(/sk-proj-abc|sk-ant-api03|xai-ABCD|AIzaSy|my-custom-secret-key/)
    expect(result).toContain('[redacted]')
  })

  it('leaves ordinary messages alone', () => {
    expect(redactSecrets('Rate limit exceeded for model gpt-x', 'sk-123456789')).toBe(
      'Rate limit exceeded for model gpt-x'
    )
  })
})

describe('redactLlmError', () => {
  it('keeps status and name so fallback decisions still work', () => {
    const original = Object.assign(
      new Error('401 Incorrect API key provided: sk-proj-abcdef123456'),
      {
        status: 401,
        name: 'AuthenticationError',
      }
    )
    const redacted = redactLlmError(original, 'sk-proj-abcdef123456')
    expect(redacted.message).toBe('401 Incorrect API key provided: [redacted]')
    expect(redacted).toMatchObject({ status: 401, name: 'AuthenticationError' })
  })

  it('wraps non-Error values', () => {
    expect(redactLlmError('boom', 'k').message).toBe('Unknown LLM error')
  })
})
