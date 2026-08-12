import { getLlmConfig, verifyLlmConnection } from '~/server/utils/llm'

interface LlmHealthData {
  configured: boolean
  connected: boolean
  provider: string | null
  model: string | null
  message: string | null
}

export default defineEventHandler(async (): Promise<{ data: LlmHealthData; error: string | null }> => {
  const llmConfig = getLlmConfig(useRuntimeConfig())
  if (!llmConfig) {
    return {
      data: {
        configured: false,
        connected: false,
        provider: null,
        model: null,
        message: 'No LLM API key is configured.',
      },
      error: null,
    }
  }

  const result = await verifyLlmConnection(llmConfig)
  return {
    data: {
      configured: true,
      connected: result.status === 'ok',
      provider: result.provider,
      model: 'model' in result ? result.model : llmConfig.model,
      message: 'message' in result ? result.message : null,
    },
    error: null,
  }
})
