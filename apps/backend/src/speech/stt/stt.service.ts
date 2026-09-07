import { getLivePack } from '@exam-one/exam-packs'
import { packContext } from '../../core/interceptors/pack-context.interceptor'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AiResponse, SttHealthData, TranscriptionData } from '@exam-one/contracts'
import type { AppConfig } from '../../config/app.config'
import { checkSttHealth, getSttConfig, transcribeAudio, type SttConfig } from './stt.adapter'

const MAX_AUDIO_BYTES = 25 * 1024 * 1024
const ALLOWED_STT_MIME_TYPES = new Set([
  'audio/webm',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
])
const ALLOWED_STT_EXTENSIONS = new Set(['.webm', '.wav', '.mp3', '.mpeg', '.ogg', '.m4a', '.mp4', '.aac'])

export function normalizeSttMimeType(raw?: string): string {
  const [base] = (raw ?? '').split(';')
  return (base ?? '').trim().toLowerCase()
}

export function isAllowedSttUpload(file: { originalname?: string; mimetype?: string }): boolean {
  const mime = normalizeSttMimeType(file.mimetype)
  if (ALLOWED_STT_MIME_TYPES.has(mime)) return true
  const name = (file.originalname ?? '').toLowerCase()
  const dot = name.lastIndexOf('.')
  if (dot < 0) return false
  return ALLOWED_STT_EXTENSIONS.has(name.slice(dot))
}

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name)

  constructor(private readonly config: ConfigService) {}

  private sttConfig(): SttConfig {
    const language = getLivePack(packContext.getStore()?.packId).speech.sttLang
    const installedLanguages = (this.config.get<string>('app.STT_LANGUAGES') ?? 'de').split(',').map(value => value.trim())
    if (!installedLanguages.includes(language)) {
      throw new Error(`Speech recognition for ${language} is unavailable on this instance. You can enter a transcript manually.`)
    }
    return {
      ...getSttConfig({
        provider: this.config.get<AppConfig['STT_PROVIDER']>('app.STT_PROVIDER'),
        baseUrl: this.config.get<string>('app.STT_BASE_URL'),
        model: this.config.get<string>('app.STT_MODEL'),
        openaiModel: this.config.get<string>('app.STT_OPENAI_MODEL'),
        openaiApiKey: this.config.get<string>('app.OPENAI_API_KEY'),
      }),
      language,
    }
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
    if (!isAllowedSttUpload(file)) {
      return {
        data: null,
        error: 'Unsupported audio type. Use webm, wav, mp3, ogg, or m4a.',
      }
    }

    try {
      const config = this.sttConfig()
      const transcript = await transcribeAudio(
        {
          data: Uint8Array.from(file.buffer).buffer,
          fileName: file.originalname || 'speaking.webm',
          mimeType: normalizeSttMimeType(file.mimetype) || 'audio/webm',
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
