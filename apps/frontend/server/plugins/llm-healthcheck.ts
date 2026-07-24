import { getLlmConfig, verifyLlmConnection } from '~/server/utils/llm'

export default defineNitroPlugin(async () => {
  const runtimeConfig = useRuntimeConfig()
  const llmConfig = getLlmConfig(runtimeConfig)

  if (!llmConfig) {
    const providerRaw = String(runtimeConfig.llmProvider || process.env['LLM_PROVIDER'] || 'openrouter').trim()
    const provider = providerRaw === 'openai' ? 'openai' : 'openrouter'
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
