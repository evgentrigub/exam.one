import type { LlmProvider, LlmReasoningEffort } from '@exam-one/contracts'
import { extractJsonObject } from './json'
import { redactLlmError } from './llm-errors'
import { runWithFallback } from './llm-fallback'
import { buildChatParams, providerBaseUrl } from './llm-providers'

export interface LlmConfig {
  provider: LlmProvider
  apiKey: string
  model: string
  fallbackModels: string[]
  reasoningEffort: LlmReasoningEffort
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
  | { status: 'ok'; provider: LlmProvider; model: string }
  | { status: 'error'; provider: LlmProvider; model: string; message: string }

const LLM_HEALTH_CHECK_TIMEOUT_MS = 30_000
// Reasoning models spend part of this budget thinking, so it is not tiny.
const HEALTH_CHECK_MAX_TOKENS = 1024
const HEALTH_CHECK_PROMPT = 'Reply with exactly this JSON and nothing else: {"ok": true}'

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown LLM connection error'
}

/** Non-reasoning models reject a reasoning effort with HTTP 400; such a call is retried without it. */
function rejectsReasoning(error: unknown): boolean {
  const status = (error as { status?: unknown } | null)?.status
  return status === 400 && /reasoning/i.test(toErrorMessage(error))
}

async function requestCompletion(
  config: LlmConfig,
  model: string,
  messages: LlmMessage[],
  opts: LlmOptions | undefined,
  reasoningEffort: LlmReasoningEffort | undefined
): Promise<string> {
  const { OpenAI } = await import('openai')
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: providerBaseUrl(config.provider),
    maxRetries: 0,
    timeout: opts?.timeoutMs ?? DEFAULT_GENERATION_TIMEOUT_MS,
  })
  const params = buildChatParams(config.provider, {
    model,
    messages,
    reasoningEffort,
    ...(opts?.temperature !== undefined && { temperature: opts.temperature }),
    ...(opts?.maxTokens !== undefined && { maxTokens: opts.maxTokens }),
  })
  const completion = await client.chat.completions.create(
    params as unknown as Parameters<typeof client.chat.completions.create>[0] & { stream?: false }
  )
  return completion.choices?.[0]?.message?.content ?? ''
}

/** One model, one request; retried once without a reasoning effort if the model rejects it. */
export async function callLlm(
  config: LlmConfig,
  model: string,
  messages: LlmMessage[],
  opts?: LlmOptions
): Promise<string> {
  console.log(
    `[exam.one][llm] request provider=${config.provider} model=${model} messages=${messages.length}`
  )
  const startedAt = Date.now()

  try {
    let content: string
    try {
      content = await requestCompletion(config, model, messages, opts, config.reasoningEffort)
    } catch (error: unknown) {
      if (!rejectsReasoning(error)) throw error
      console.log(`[exam.one][llm] model=${model} rejected reasoning effort; retrying without it`)
      content = await requestCompletion(config, model, messages, opts, undefined)
    }
    console.log(`[exam.one][llm] done ms=${Date.now() - startedAt} chars=${content.length}`)
    return content
  } catch (error: unknown) {
    // Provider errors can quote the key ("Incorrect API key provided: sk-…"); they reach logs,
    // job rows and the browser, so they are redacted once, here.
    const safe = redactLlmError(error, config.apiKey)
    console.error(`[exam.one][llm] failed ms=${Date.now() - startedAt} error=${safe.message}`)
    throw safe
  }
}

/** The main model, then each fallback model when the previous one is rate-limited or unavailable. */
export function callLlmWithFallback(
  config: LlmConfig,
  messages: LlmMessage[],
  opts?: LlmOptions
): Promise<string> {
  return runWithFallback(
    [config.model, ...config.fallbackModels],
    model => callLlm(config, model, messages, opts),
    (from, to) =>
      console.log(`[exam.one][llm] model=${from} unavailable; falling back to model=${to}`)
  )
}

/** Checks that the main model answers and returns parseable JSON, which every AI feature relies on. */
export async function verifyLlmConnection(config: LlmConfig): Promise<LlmConnectionResult> {
  let timer: NodeJS.Timeout | undefined
  try {
    const response = await Promise.race([
      callLlm(
        { ...config, reasoningEffort: 'low' },
        config.model,
        [{ role: 'user', content: HEALTH_CHECK_PROMPT }],
        {
          maxTokens: HEALTH_CHECK_MAX_TOKENS,
          timeoutMs: LLM_HEALTH_CHECK_TIMEOUT_MS,
        }
      ),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
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
    if (!extractJsonObject(response)) {
      return {
        status: 'error',
        provider: config.provider,
        model: config.model,
        message:
          'The model answered, but not with valid JSON. AI features need a model that can return JSON.',
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
  } finally {
    clearTimeout(timer)
  }
}
