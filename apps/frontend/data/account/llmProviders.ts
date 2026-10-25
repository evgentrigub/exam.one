import type { LlmModelOption, LlmProvider, LlmReasoningEffort } from '@exam-one/contracts'

export const LLM_REASONING_EFFORTS = [
  'minimal',
  'low',
  'medium',
  'high',
] as const satisfies readonly LlmReasoningEffort[]

export const DEFAULT_LLM_REASONING_EFFORT: LlmReasoningEffort = 'medium'

/** Matches the backend limit on fallback models. */
export const MAX_LLM_FALLBACK_MODELS = 3

export interface LlmProviderInfo {
  id: LlmProvider
  label: string
  /** Where users create a key; shown as "Key from …". */
  keyHint: string
  supportsReasoningEffort: boolean
  /** Free API tiers may train on prompts; show the privacy notice for the whole provider. */
  freeTierMayTrain: boolean
}

export const LLM_PROVIDER_INFO: LlmProviderInfo[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    keyHint: 'platform.openai.com/api-keys',
    supportsReasoningEffort: true,
    freeTierMayTrain: false,
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    keyHint: 'openrouter.ai/keys',
    supportsReasoningEffort: true,
    freeTierMayTrain: false,
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    keyHint: 'aistudio.google.com/apikey',
    supportsReasoningEffort: true,
    freeTierMayTrain: true,
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    keyHint: 'console.anthropic.com/settings/keys',
    supportsReasoningEffort: false,
    freeTierMayTrain: false,
  },
  {
    id: 'xai',
    label: 'xAI',
    keyHint: 'console.x.ai',
    supportsReasoningEffort: false,
    freeTierMayTrain: false,
  },
]

export const DEFAULT_LLM_PROVIDER: LlmProvider = 'openrouter'

export function llmProviderInfo(provider: LlmProvider): LlmProviderInfo {
  return LLM_PROVIDER_INFO.find(info => info.id === provider) ?? LLM_PROVIDER_INFO[0]!
}

/** OpenRouter marks free models in its catalogue; `:free` ids and its free router are free too. */
export function isFreeModel(id: string, models: LlmModelOption[]): boolean {
  return (
    models.find(model => model.id === id)?.free === true ||
    id.endsWith(':free') ||
    id === 'openrouter/free'
  )
}
