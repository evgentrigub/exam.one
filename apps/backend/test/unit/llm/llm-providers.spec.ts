import {
  buildChatParams,
  getProviderPreset,
  listModels,
  LlmProviderHttpError,
} from '../../../src/ai/llm-providers'

type FetchCall = { url: string; init: RequestInit | undefined }

function fakeFetch(responses: Record<string, { status?: number; body: unknown }>) {
  const calls: FetchCall[] = []
  const impl = jest.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, init })
    const match = Object.entries(responses).find(([prefix]) => url.startsWith(prefix))
    if (!match) throw new Error(`Unexpected URL ${url}`)
    const { status = 200, body } = match[1]
    return new Response(JSON.stringify(body), { status })
  })
  return { impl: impl as unknown as typeof fetch, calls }
}

function headerOf(call: FetchCall | undefined, name: string): string | null {
  return new Headers(call?.init?.headers).get(name)
}

const messages = [{ role: 'user' as const, content: 'Hi' }]

describe('buildChatParams', () => {
  it('uses max_completion_tokens and reasoning_effort for OpenAI, dropping temperature', () => {
    expect(
      buildChatParams('openai', { model: 'gpt-x', messages, reasoningEffort: 'medium', temperature: 0.4, maxTokens: 100 })
    ).toEqual({ model: 'gpt-x', messages, reasoning_effort: 'medium', max_completion_tokens: 100 })
  })

  it('sends reasoning as an object for OpenRouter and keeps temperature', () => {
    expect(
      buildChatParams('openrouter', { model: 'a/b:free', messages, reasoningEffort: 'low', temperature: 0.4, maxTokens: 50 })
    ).toEqual({ model: 'a/b:free', messages, reasoning: { effort: 'low' }, temperature: 0.4, max_tokens: 50 })
  })

  it('maps minimal effort to low for Gemini', () => {
    expect(buildChatParams('gemini', { model: 'gemini-x', messages, reasoningEffort: 'minimal' })).toEqual({
      model: 'gemini-x',
      messages,
      reasoning_effort: 'low',
    })
  })

  it('always sends max_tokens to Anthropic, caps temperature at 1 and ignores effort', () => {
    expect(
      buildChatParams('anthropic', { model: 'claude-x', messages, reasoningEffort: 'high', temperature: 1.4 })
    ).toEqual({ model: 'claude-x', messages, temperature: 1, max_tokens: 8192 })
  })

  it('ignores effort for xAI', () => {
    expect(buildChatParams('xai', { model: 'grok-x', messages, reasoningEffort: 'high', maxTokens: 10 })).toEqual({
      model: 'grok-x',
      messages,
      max_tokens: 10,
    })
  })

  it('omits effort when the caller disables it', () => {
    expect(
      buildChatParams('openai', { model: 'gpt-4o', messages, reasoningEffort: undefined, temperature: 0.2 })
    ).toEqual({ model: 'gpt-4o', messages, temperature: 0.2 })
  })
})

describe('getProviderPreset', () => {
  it('reports which providers accept a reasoning effort', () => {
    expect(getProviderPreset('openai').supportsReasoningEffort).toBe(true)
    expect(getProviderPreset('openrouter').supportsReasoningEffort).toBe(true)
    expect(getProviderPreset('gemini').supportsReasoningEffort).toBe(true)
    expect(getProviderPreset('anthropic').supportsReasoningEffort).toBe(false)
    expect(getProviderPreset('xai').supportsReasoningEffort).toBe(false)
  })
})

describe('listModels', () => {
  it('drops non-chat OpenAI models but keeps fine-tuned ones, sorted', async () => {
    const { impl, calls } = fakeFetch({
      'https://api.openai.com/v1/models': {
        body: {
          data: [
            { id: 'whisper-1' },
            { id: 'gpt-5-mini' },
            { id: 'text-embedding-3-small' },
            { id: 'gpt-4o-realtime-preview' },
            { id: 'o4-mini' },
            { id: 'dall-e-3' },
            { id: 'gpt-4o-mini-tts' },
            { id: 'ft:gpt-4o-mini:acme::abc123' },
            { id: 'omni-moderation-latest' },
          ],
        },
      },
    })
    const models = await listModels('openai', 'sk-test', impl, 'https://api.openai.com/v1')
    expect(models.map(m => m.id)).toEqual(['ft:gpt-4o-mini:acme::abc123', 'gpt-5-mini', 'o4-mini'])
    expect(headerOf(calls[0], 'authorization')).toBe('Bearer sk-test')
  })

  it('checks the OpenRouter key, then flags free models', async () => {
    const { impl, calls } = fakeFetch({
      'https://openrouter.ai/api/v1/key': { body: { data: { label: 'k' } } },
      'https://openrouter.ai/api/v1/models': {
        body: {
          data: [
            { id: 'z/paid', name: 'Paid', context_length: 1000, pricing: { prompt: '0.000001', completion: '0.000002' } },
            { id: 'a/free:free', name: 'Free', context_length: 2000, pricing: { prompt: '0', completion: '0' } },
          ],
        },
      },
    })
    const models = await listModels('openrouter', 'sk-or', impl)
    expect(calls[0]?.url).toBe('https://openrouter.ai/api/v1/key')
    expect(models).toEqual([
      { id: 'a/free:free', name: 'Free', contextLength: 2000, free: true },
      { id: 'z/paid', name: 'Paid', contextLength: 1000, free: false },
    ])
  })

  it('strips the models/ prefix and drops non-chat Gemini models', async () => {
    const { impl } = fakeFetch({
      'https://generativelanguage.googleapis.com/v1beta/openai/models': {
        body: {
          data: [
            { id: 'models/gemini-flash-latest' },
            { id: 'models/text-embedding-004' },
            { id: 'models/gemini-embedding-001' },
            { id: 'models/gemini-2.5-flash-preview-tts' },
            { id: 'models/imagen-4' },
          ],
        },
      },
    })
    const models = await listModels('gemini', 'g-key', impl)
    expect(models.map(m => m.id)).toEqual(['gemini-flash-latest'])
  })

  it('uses Anthropic headers and display names', async () => {
    const { impl, calls } = fakeFetch({
      'https://api.anthropic.com/v1/models': {
        body: { data: [{ id: 'claude-haiku-x', display_name: 'Claude Haiku X' }] },
      },
    })
    const models = await listModels('anthropic', 'sk-ant', impl)
    expect(models).toEqual([{ id: 'claude-haiku-x', name: 'Claude Haiku X' }])
    expect(headerOf(calls[0], 'x-api-key')).toBe('sk-ant')
    expect(headerOf(calls[0], 'anthropic-version')).toBe('2023-06-01')
    expect(headerOf(calls[0], 'authorization')).toBeNull()
  })

  it('drops xAI image and video models', async () => {
    const { impl } = fakeFetch({
      'https://api.x.ai/v1/models': {
        body: { data: [{ id: 'grok-4-fast' }, { id: 'grok-2-image' }, { id: 'grok-imagine-video' }] },
      },
    })
    const models = await listModels('xai', 'xai-key', impl)
    expect(models.map(m => m.id)).toEqual(['grok-4-fast'])
  })

  it('throws an HTTP error carrying the status when the key is rejected', async () => {
    const { impl } = fakeFetch({
      'https://api.x.ai/v1/models': { status: 401, body: { error: 'Incorrect API key' } },
    })
    await expect(listModels('xai', 'bad', impl)).rejects.toMatchObject({ status: 401 })
    await expect(listModels('xai', 'bad', impl)).rejects.toBeInstanceOf(LlmProviderHttpError)
  })
})
