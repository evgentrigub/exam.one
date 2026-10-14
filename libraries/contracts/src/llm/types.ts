// Types only: this package is not compiled to JavaScript, so runtime lists of providers and
// efforts live with their users (backend `ai/llm-options.ts`, frontend `data/account/llmProviders.ts`).
export type LlmProvider = 'openai' | 'openrouter' | 'gemini' | 'anthropic' | 'xai'

export type LlmReasoningEffort = 'minimal' | 'low' | 'medium' | 'high'

export interface LlmModelOption {
  id: string
  name: string
  contextLength?: number
  /** OpenRouter only: both prompt and completion are priced at zero. */
  free?: boolean
}

export interface LlmModelListData {
  models: LlmModelOption[]
}

/** A saved key, without the key itself. */
export interface LlmKeySummary {
  provider: LlmProvider
  last4: string
  updatedAt: string
}

export interface LlmSettingsDto {
  provider: LlmProvider | null
  model: string | null
  fallbackModels: string[]
  reasoningEffort: LlmReasoningEffort
  keys: LlmKeySummary[]
}

export interface UpdateLlmSettingsInput {
  provider: LlmProvider
  model: string
  fallbackModels?: string[]
  reasoningEffort?: LlmReasoningEffort
}

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmCompletionRequest {
  provider: LlmProvider
  model: string
  messages: LlmMessage[]
  temperature?: number
  reasoningEffort?: LlmReasoningEffort
}

export interface LlmCompletionResponse {
  content: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

/** Business-level AI envelope. Distinct from REST `ApiResponse` (`error` is a string). */
export interface AiResponse<T> {
  data: T | null
  error: string | null
}

export interface LlmHealthData {
  configured: boolean
  connected: boolean
  provider: string | null
  model: string | null
  message: string | null
}

export type SttProvider = 'local'

export interface SttHealthData {
  provider: SttProvider
  ready: boolean
  detail: string
}

export interface TranscriptionData {
  transcript: string
  provider: SttProvider
}

export interface TtsHealthData {
  ok: boolean
  /** Why TTS is not ready: the service is unreachable, or it lacks this pack's voices. */
  reason?: 'offline' | 'unsupported'
}

export interface ListeningExerciseAudioMap {
  shared?: string
  items?: Record<string, string>
  sections?: Record<string, string>
}

export interface GenerateListeningAudioData {
  audio: ListeningExerciseAudioMap
  written: number
}

export interface DeleteListeningAudioData {
  deleted: number
}
