import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AiResponse, SttHealthData, TranscriptionData } from '@exam-one/contracts'
import type { AppConfig } from '../config/app.config'
import { checkSttHealth, getSttConfig, transcribeAudio, type SttConfig } from './stt.adapter'

const MAX_AUDIO_BYTES = 25 * 1024 * 1024

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name)

  constructor(private readonly config: ConfigService) {}

  private sttConfig(): SttConfig {
    return getSttConfig({
      provider: this.config.get<AppConfig['STT_PROVIDER']>('app.STT_PROVIDER'),
      baseUrl: this.config.get<string>('app.STT_BASE_URL'),
      model: this.config.get<string>('app.STT_MODEL'),
      openaiModel: this.config.get<string>('app.STT_OPENAI_MODEL'),
      openaiApiKey: this.config.get<string>('app.OPENAI_API_KEY'),
    })
  }

  async health(): Promise<AiResponse<SttHealthData>> {
    try {
      const health = await checkSttHealth(this.sttConfig())
      return { data: health, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Could not read STT configuration.',
      }
    }
  }

  async transcribe(file?: {
    buffer: Buffer
    size: number
    originalname?: string
    mimetype?: string
  }): Promise<AiResponse<TranscriptionData>> {
    if (!file || file.size === 0) {
      return { data: null, error: 'No audio recording was provided.' }
    }
    if (file.size > MAX_AUDIO_BYTES) {
      return { data: null, error: 'The audio recording is larger than 25 MB.' }
    }

    try {
      const config = this.sttConfig()
      const transcript = await transcribeAudio(
        {
          data: Uint8Array.from(file.buffer).buffer,
          fileName: file.originalname || 'speaking.webm',
          mimeType: file.mimetype || 'application/octet-stream',
        },
        config
      )
      return { data: { transcript, provider: config.provider }, error: null }
    } catch (error: unknown) {
      this.logger.error('transcribe failed', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Transcription failed.',
      }
    }
  }
}
