import { getLlmConfig, verifyLlmConnection } from '~/server/utils/llm'

export default defineNitroPlugin(async () => {
  const runtimeConfig = useRuntimeConfig()
  const provider = runtimeConfig.llmProvider === 'openai' ? 'openai' : 'openrouter'
  const llmConfig = getLlmConfig(runtimeConfig)

  if (!llmConfig) {
    const apiKeyEnvVar = provider === 'openai' ? 'OPENAI_API_KEY' : 'OPENROUTER_API_KEY'
    console.info(
      `[exam.one] AI features disabled: no API key configured for provider "${provider}". Set ${apiKeyEnvVar} to enable AI.`
    )
    return
  }

  console.info(`[exam.one] Verifying LLM connection (${llmConfig.provider}, model: ${llmConfig.model})...`)
  const result = await verifyLlmConnection(llmConfig)

  if (result.status === 'ok') {
    console.info(`[exam.one] LLM connection verified (${result.provider}, model: ${result.model}).`)
    return
  }

  if (result.status === 'error') {
    console.error(
      `[exam.one] LLM connection failed (${result.provider}, model: ${result.model}): ${result.message}`
    )
  }
})
