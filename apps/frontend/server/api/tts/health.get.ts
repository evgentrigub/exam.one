import { checkTtsHealth } from '~/server/utils/tts/ttsAdapter'

interface AiResponse<T> {
  data: T | null
  error: string | null
}

export default defineEventHandler(async (): Promise<AiResponse<{ ok: boolean }>> => {
  try {
    const ok = await checkTtsHealth()
    return { data: { ok }, error: null }
  } catch (error: unknown) {
    console.error('[tts/health] unexpected error', error)
    return { data: { ok: false }, error: 'Could not reach TTS health endpoint.' }
  }
})
