export type LlmProvider = 'openai' | 'openrouter'

export type LlmReasoningEffort = 'minimal' | 'low' | 'medium' | 'high'

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

export type SttProvider = 'local' | 'openai'

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
}

export interface GenerateListeningAudioData {
  audio: ListeningExerciseAudioMap
  written: number
}

export interface DeleteListeningAudioData {
  deleted: number
}
