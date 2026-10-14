import type { LlmProvider, LlmReasoningEffort } from '@exam-one/contracts'

export const LLM_PROVIDERS = ['openai', 'openrouter', 'gemini', 'anthropic', 'xai'] as const satisfies readonly LlmProvider[]

export const LLM_REASONING_EFFORTS = ['minimal', 'low', 'medium', 'high'] as const satisfies readonly LlmReasoningEffort[]

export const DEFAULT_LLM_REASONING_EFFORT: LlmReasoningEffort = 'medium'

/** Fallback models tried in order when the main model is rate-limited or unavailable. */
export const MAX_LLM_FALLBACK_MODELS = 3

export function isLlmProvider(value: unknown): value is LlmProvider {
  return typeof value === 'string' && (LLM_PROVIDERS as readonly string[]).includes(value)
}

export function isLlmReasoningEffort(value: unknown): value is LlmReasoningEffort {
  return typeof value === 'string' && (LLM_REASONING_EFFORTS as readonly string[]).includes(value)
}
