import type { LlmProvider, LlmReasoningEffort } from '@exam-one/contracts'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

const DEFAULT_OPENAI_MODEL = 'gpt-6-sol'
const DEFAULT_OPENROUTER_MODEL = 'google/gemma-4-26b-a4b-it:free'
const DEFAULT_REASONING_EFFORT = 'medium'

const REASONING_EFFORT_VALUES = ['minimal', 'low', 'medium', 'high'] as const

export interface LlmConfig {
  provider: LlmProvider
  apiKey: string
  model: string
  reasoningEffort?: LlmReasoningEffort
}

export interface LlmEnvSource {
  provider?: string | undefined
  openaiApiKey?: string | undefined
  openrouterApiKey?: string | undefined
  openaiModel?: string | undefined
  openrouterModel?: string | undefined
  reasoningEffort?: string | undefined
}

export interface LlmMessage {
  role: 'system' | 'user'
  content: string
}

export interface LlmOptions {
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
}

const DEFAULT_GENERATION_TIMEOUT_MS = 120_000

export type LlmConnectionResult =
  | { status: 'skipped'; provider: LlmProvider; message: string }
  | { status: 'ok'; provider: LlmProvider; model: string }
  | { status: 'error'; provider: LlmProvider; model: string; message: string }

const LLM_HEALTH_CHECK_TIMEOUT_MS = 15_000

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown LLM connection error'
}

export function getLlmConfig(source: LlmEnvSource): LlmConfig | null {
  const providerRaw = (source.provider || 'openrouter').trim()
  const provider: LlmProvider = providerRaw === 'openai' ? 'openai' : 'openrouter'
  const apiKey = (
    provider === 'openai' ? source.openaiApiKey || '' : source.openrouterApiKey || ''
  ).trim()

  if (!apiKey) {
    return null
  }

  const model =
    provider === 'openai'
      ? source.openaiModel || DEFAULT_OPENAI_MODEL
      : source.openrouterModel || DEFAULT_OPENROUTER_MODEL

  const configuredEffort = source.reasoningEffort || DEFAULT_REASONING_EFFORT
  const reasoningEffort = REASONING_EFFORT_VALUES.includes(configuredEffort as LlmReasoningEffort)
    ? (configuredEffort as LlmReasoningEffort)
    : DEFAULT_REASONING_EFFORT

  return {
    provider,
    apiKey,
    model,
    ...(provider === 'openai' && { reasoningEffort }),
  }
}

export async function callLlm(
  config: LlmConfig,
  messages: LlmMessage[],
  opts?: LlmOptions
): Promise<string> {
  const { OpenAI } = await import('openai')
  const baseURL = config.provider === 'openrouter' ? OPENROUTER_BASE_URL : undefined
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL,
    maxRetries: 0,
    timeout: opts?.timeoutMs ?? DEFAULT_GENERATION_TIMEOUT_MS,
  })

  const usesOpenAiReasoning = config.provider === 'openai' && config.reasoningEffort !== undefined
  const maxTokensOption =
    opts?.maxTokens !== undefined
      ? config.provider === 'openai'
        ? { max_completion_tokens: opts.maxTokens }
        : { max_tokens: opts.maxTokens }
      : {}

  console.log(
    `[exam.one][llm] request provider=${config.provider} model=${config.model} messages=${messages.length}`
  )

  const startedAt = Date.now()

  try {
    const completion = await client.chat.completions.create({
      model: config.model,
      messages,
      ...(usesOpenAiReasoning && { reasoning_effort: config.reasoningEffort }),
      ...(!usesOpenAiReasoning &&
        opts?.temperature !== undefined && { temperature: opts.temperature }),
      ...maxTokensOption,
    })

    const content = completion.choices?.[0]?.message?.content ?? ''
    const duration = Date.now() - startedAt
    console.log(`[exam.one][llm] done ms=${duration} chars=${content.length}`)
    return content
  } catch (error: unknown) {
    const duration = Date.now() - startedAt
    const errorMessage = error instanceof Error ? error.message : 'Unknown LLM error'
    console.error(`[exam.one][llm] failed ms=${duration} error=${errorMessage}`)
    throw error
  }
}

export async function verifyLlmConnection(config: LlmConfig): Promise<LlmConnectionResult> {
  try {
    const response = await Promise.race([
      callLlm(config, [{ role: 'user', content: 'Reply with OK.' }], { maxTokens: 16 }),
      new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(new Error(`LLM health check timed out after ${LLM_HEALTH_CHECK_TIMEOUT_MS}ms`)),
          LLM_HEALTH_CHECK_TIMEOUT_MS
        )
      }),
    ])

    if (!response.trim()) {
      return {
        status: 'error',
        provider: config.provider,
        model: config.model,
        message: 'LLM returned an empty response during health check.',
      }
    }

    return { status: 'ok', provider: config.provider, model: config.model }
  } catch (error: unknown) {
    return {
      status: 'error',
      provider: config.provider,
      model: config.model,
      message: toErrorMessage(error),
    }
  }
}
