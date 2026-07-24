import { checkSttHealth, getSttConfig, type SttHealth } from '~/server/utils/stt/sttAdapter'

interface AiResponse<T> {
  data: T | null
  error: string | null
}

export default defineEventHandler(async (): Promise<AiResponse<SttHealth>> => {
  try {
    const health = await checkSttHealth(getSttConfig(useRuntimeConfig()))
    return {
      data: health,
      error: health.ready ? null : health.detail,
    }
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Could not read STT configuration.',
    }
  }
})
