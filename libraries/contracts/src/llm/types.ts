export type LlmProvider = 'openai' | 'openrouter' | 'gemini' | string

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmCompletionRequest {
  provider: LlmProvider
  model: string
  messages: LlmMessage[]
  temperature?: number
  reasoningEffort?: 'low' | 'medium' | 'high'
}

export interface LlmCompletionResponse {
  content: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}
