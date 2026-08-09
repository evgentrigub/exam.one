import type { H3Event } from 'h3'
import { getSttConfig, transcribeAudio, type SttProvider } from '~/server/utils/stt/sttAdapter'

const MAX_AUDIO_BYTES = 25 * 1024 * 1024

interface TranscriptionData {
  transcript: string
  provider: SttProvider
}

interface AiResponse<T> {
  data: T | null
  error: string | null
}

export default defineEventHandler(
  async (event: H3Event): Promise<AiResponse<TranscriptionData>> => {
    try {
      const parts = await readMultipartFormData(event)
      const audioPart = parts?.find(part => part.name === 'file' && part.filename)

      if (!audioPart || audioPart.data.length === 0) {
        return { data: null, error: 'No audio recording was provided.' }
      }
      if (audioPart.data.length > MAX_AUDIO_BYTES) {
        return { data: null, error: 'The audio recording is larger than 25 MB.' }
      }

      const config = getSttConfig(useRuntimeConfig())
      const data = Uint8Array.from(audioPart.data).buffer
      const transcript = await transcribeAudio(
        {
          data,
          fileName: audioPart.filename || 'speaking.webm',
          mimeType: audioPart.type || 'application/octet-stream',
        },
        config
      )
      return {
        data: { transcript, provider: config.provider },
        error: null,
      }
    } catch (error: unknown) {
      console.error('[stt/transcribe] failed', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Transcription failed.',
      }
    }
  }
)
