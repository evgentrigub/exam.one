import type { LlmModelOption, LlmProvider, LlmReasoningEffort } from '@exam-one/contracts'

const OPENAI_DEFAULT_BASE_URL = 'https://api.openai.com/v1'
const ANTHROPIC_VERSION = '2023-06-01'
const ANTHROPIC_DEFAULT_MAX_TOKENS = 8192
const ANTHROPIC_MAX_TEMPERATURE = 1
const MODEL_LIST_TIMEOUT_MS = 15_000

export interface LlmProviderPreset {
  id: LlmProvider
  label: string
  /** Where users create a key; shown as "Key from …". */
  keyHint: string
  supportsReasoningEffort: boolean
}

export interface ChatParamsInput {
  model: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  reasoningEffort: LlmReasoningEffort | undefined
  temperature?: number
  maxTokens?: number
}

export class LlmProviderHttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'LlmProviderHttpError'
  }
}

const PRESETS: Record<LlmProvider, LlmProviderPreset> = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    keyHint: 'platform.openai.com/api-keys',
    supportsReasoningEffort: true,
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    keyHint: 'openrouter.ai/keys',
    supportsReasoningEffort: true,
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    keyHint: 'aistudio.google.com/apikey',
    supportsReasoningEffort: true,
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic',
    keyHint: 'console.anthropic.com/settings/keys',
    supportsReasoningEffort: false,
  },
  xai: { id: 'xai', label: 'xAI', keyHint: 'console.x.ai', supportsReasoningEffort: false },
}

const BASE_URLS: Record<Exclude<LlmProvider, 'openai'>, string> = {
  openrouter: 'https://openrouter.ai/api/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
  anthropic: 'https://api.anthropic.com/v1',
  xai: 'https://api.x.ai/v1',
}

export function getProviderPreset(provider: LlmProvider): LlmProviderPreset {
  return PRESETS[provider]
}

/** OpenAI honours `OPENAI_BASE_URL` so the e2e stack can point it at a stub server. */
export function providerBaseUrl(provider: LlmProvider): string {
  if (provider === 'openai') {
    return (process.env['OPENAI_BASE_URL']?.trim() || OPENAI_DEFAULT_BASE_URL).replace(/\/+$/, '')
  }
  return BASE_URLS[provider]
}

function reasoningParams(
  provider: LlmProvider,
  effort: LlmReasoningEffort | undefined
): Record<string, unknown> {
  if (!effort || !PRESETS[provider].supportsReasoningEffort) return {}
  if (provider === 'openrouter') return { reasoning: { effort } }
  if (provider === 'gemini') return { reasoning_effort: effort === 'minimal' ? 'low' : effort }
  return { reasoning_effort: effort }
}

function temperatureParam(provider: LlmProvider, input: ChatParamsInput): Record<string, unknown> {
  if (input.temperature === undefined) return {}
  // OpenAI reasoning models reject a custom temperature.
  if (provider === 'openai' && input.reasoningEffort !== undefined) return {}
  if (provider === 'anthropic')
    return { temperature: Math.min(input.temperature, ANTHROPIC_MAX_TEMPERATURE) }
  return { temperature: input.temperature }
}

function tokenParam(provider: LlmProvider, maxTokens: number | undefined): Record<string, unknown> {
  if (provider === 'anthropic') return { max_tokens: maxTokens ?? ANTHROPIC_DEFAULT_MAX_TOKENS }
  if (maxTokens === undefined) return {}
  return provider === 'openai' ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens }
}

/** Chat Completions body for one provider; every provider speaks the OpenAI wire format. */
export function buildChatParams(
  provider: LlmProvider,
  input: ChatParamsInput
): Record<string, unknown> {
  return {
    model: input.model,
    messages: input.messages,
    ...reasoningParams(provider, input.reasoningEffort),
    ...temperatureParam(provider, input),
    ...tokenParam(provider, input.maxTokens),
  }
}

function authHeaders(provider: LlmProvider, apiKey: string): Record<string, string> {
  if (provider === 'anthropic') {
    return { 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_VERSION }
  }
  return { authorization: `Bearer ${apiKey}` }
}

async function getJson(
  url: string,
  headers: Record<string, string>,
  fetchImpl: typeof fetch
): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers,
    signal: AbortSignal.timeout(MODEL_LIST_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new LlmProviderHttpError(response.status, `Provider returned HTTP ${response.status}.`)
  }
  return response.json()
}

interface RawModel {
  id?: unknown
  name?: unknown
  display_name?: unknown
  context_length?: unknown
  pricing?: { prompt?: unknown; completion?: unknown }
}

function rawModels(body: unknown): RawModel[] {
  const data = (body as { data?: unknown } | null)?.data
  return Array.isArray(data)
    ? (data.filter(item => typeof item?.id === 'string') as RawModel[])
    : []
}

const OPENAI_NON_CHAT =
  /(embedding|whisper|tts|dall-e|realtime|transcribe|image|moderation|audio|search|davinci|babbage|codex|sora)/
const GEMINI_NON_CHAT = /(embedding|tts|image|imagen|veo|aqa|live)/
const XAI_NON_CHAT = /(image|imagine|video)/

function toOption(model: RawModel, provider: LlmProvider): LlmModelOption {
  const id = String(model.id).replace(/^models\//, '')
  if (provider === 'openrouter') {
    const free = String(model.pricing?.prompt) === '0' && String(model.pricing?.completion) === '0'
    const contextLength =
      typeof model.context_length === 'number' ? model.context_length : undefined
    return {
      id,
      name: typeof model.name === 'string' ? model.name : id,
      ...(contextLength && { contextLength }),
      free,
    }
  }
  if (provider === 'anthropic' && typeof model.display_name === 'string') {
    return { id, name: model.display_name }
  }
  return { id, name: id }
}

function isChatModel(provider: LlmProvider, id: string): boolean {
  if (provider === 'openai') return !OPENAI_NON_CHAT.test(id)
  if (provider === 'gemini') return id.startsWith('gemini') && !GEMINI_NON_CHAT.test(id)
  if (provider === 'xai') return !XAI_NON_CHAT.test(id)
  return true
}

/** Lists the chat models a key can use. Also the key check: a rejected key throws `LlmProviderHttpError`. */
export async function listModels(
  provider: LlmProvider,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
  baseUrl: string = providerBaseUrl(provider)
): Promise<LlmModelOption[]> {
  const headers = authHeaders(provider, apiKey)
  if (provider === 'openrouter') {
    // The OpenRouter catalogue is public, so check the key separately.
    await getJson(`${baseUrl}/key`, headers, fetchImpl)
  }
  const query = provider === 'anthropic' ? '?limit=1000' : ''
  const body = await getJson(`${baseUrl}/models${query}`, headers, fetchImpl)
  return rawModels(body)
    .map(model => toOption(model, provider))
    .filter(option => isChatModel(provider, option.id))
    .sort((a, b) => a.id.localeCompare(b.id))
}
