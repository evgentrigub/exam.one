import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type {
  VoiceDownloadProgressDto,
  VoiceModelDto,
  VoiceModelsDto,
  VoiceQuality,
} from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { asJson } from '../common/json'
import { clearTtsVoicesCache } from '../speech/tts/tts.adapter'

const TTS_TIMEOUT_MS = 10_000
const VOICE_ID = /^[a-z][a-z0-9_]{1,40}$/

/** One voice as the TTS service's GET /v1/models/voices reports it. */
interface TtsVoice {
  id: string
  lang: string
  name: string
  gender: 'male' | 'female'
  accent: string | null
  quality: VoiceQuality
  installed: boolean
  sizeBytes: number
  progress: VoiceDownloadProgressDto | null
}

interface TtsCatalog {
  voices: TtsVoice[]
  installedBytes: number
}

type DefaultVoices = Record<string, string>

function readDefaults(value: unknown): DefaultVoices {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  )
}

/**
 * The default voice per language: the user's pick while it is installed, otherwise the first
 * installed voice of that language in registry order (so deleting the default moves it on).
 */
export function resolveDefaults(voices: readonly TtsVoice[], stored: DefaultVoices): DefaultVoices {
  const resolved: DefaultVoices = {}
  for (const voice of voices) {
    if (!voice.installed) continue
    const pick = stored[voice.lang]
    const pickInstalled = voices.some(
      other => other.id === pick && other.installed && other.lang === voice.lang
    )
    if (pickInstalled) resolved[voice.lang] = pick!
    else resolved[voice.lang] ??= voice.id
  }
  return resolved
}

@Injectable()
export class VoiceModelsService {
  private readonly logger = new Logger(VoiceModelsService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  private baseUrl(): string {
    return this.config.getOrThrow<string>('app.TTS_BASE_URL').replace(/\/+$/, '')
  }

  private async tts(method: 'GET' | 'POST' | 'DELETE', pathname: string): Promise<Response> {
    try {
      return await fetch(`${this.baseUrl()}${pathname}`, {
        method,
        signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
      })
    } catch (error) {
      this.logger.warn(
        `TTS ${method} ${pathname} failed: ${error instanceof Error ? error.message : String(error)}`
      )
      throw new ServiceUnavailableException({
        code: 'TTS_OFFLINE',
        message: 'The text-to-speech service is not running',
      })
    }
  }

  private async catalog(): Promise<TtsCatalog | null> {
    try {
      const response = await this.tts('GET', '/v1/models/voices')
      if (!response.ok) return null
      const body = (await response.json()) as Partial<TtsCatalog>
      return {
        voices: Array.isArray(body.voices) ? body.voices : [],
        installedBytes: Number(body.installedBytes) || 0,
      }
    } catch {
      return null
    }
  }

  private async storedDefaults(user: User): Promise<DefaultVoices> {
    const setting = await this.prisma.setting.findUnique({
      where: { userId: user.id },
      select: { defaultVoices: true },
    })
    return readDefaults(setting?.defaultVoices)
  }

  private async saveDefaults(user: User, defaults: DefaultVoices): Promise<void> {
    await this.prisma.setting.upsert({
      where: { userId: user.id },
      update: { defaultVoices: asJson(defaults) },
      create: { userId: user.id, defaultVoices: asJson(defaults) },
    })
  }

  private assertVoiceId(voiceId: string): void {
    if (!VOICE_ID.test(voiceId))
      throw new BadRequestException({ code: 'INVALID_VOICE', message: 'Unknown voice' })
  }

  async list(user: User): Promise<VoiceModelsDto> {
    const catalog = await this.catalog()
    if (!catalog) return { online: false, installedBytes: 0, voices: [] }
    const defaults = resolveDefaults(catalog.voices, await this.storedDefaults(user))
    const voices: VoiceModelDto[] = catalog.voices.map(voice => ({
      id: voice.id,
      lang: voice.lang,
      name: voice.name,
      gender: voice.gender,
      accent: voice.accent ?? null,
      quality: voice.quality,
      installed: Boolean(voice.installed),
      sizeBytes: Number(voice.sizeBytes) || 0,
      isDefault: defaults[voice.lang] === voice.id,
      progress: voice.progress ?? null,
    }))
    return { online: true, installedBytes: catalog.installedBytes, voices }
  }

  async installedBytes(): Promise<number> {
    return (await this.catalog())?.installedBytes ?? 0
  }

  async download(voiceId: string): Promise<void> {
    this.assertVoiceId(voiceId)
    const response = await this.tts('POST', `/v1/models/voices/${voiceId}/download`)
    if (response.status === 404)
      throw new NotFoundException({ code: 'VOICE_NOT_FOUND', message: 'Unknown voice' })
    if (!response.ok)
      throw new ServiceUnavailableException({
        code: 'TTS_ERROR',
        message: 'The download could not start',
      })
    clearTtsVoicesCache()
  }

  async cancelDownload(voiceId: string): Promise<void> {
    this.assertVoiceId(voiceId)
    const response = await this.tts('DELETE', `/v1/models/voices/${voiceId}/download`)
    if (response.status === 404)
      throw new NotFoundException({ code: 'VOICE_NOT_FOUND', message: 'Unknown voice' })
  }

  /** Remove a voice; a default that pointed at it moves to another installed voice. */
  async remove(user: User, voiceId: string): Promise<{ freedBytes: number }> {
    this.assertVoiceId(voiceId)
    const response = await this.tts('DELETE', `/v1/models/voices/${voiceId}`)
    if (response.status === 404)
      throw new NotFoundException({ code: 'VOICE_NOT_FOUND', message: 'Unknown voice' })
    if (response.status === 409)
      throw new ConflictException({
        code: 'VOICE_DOWNLOADING',
        message: 'Cancel the download first',
      })
    if (!response.ok)
      throw new ServiceUnavailableException({
        code: 'TTS_ERROR',
        message: 'The voice could not be removed',
      })
    clearTtsVoicesCache()
    const body = (await response.json().catch(() => ({}))) as { freedBytes?: number }

    const stored = await this.storedDefaults(user)
    const lang = Object.keys(stored).find(key => stored[key] === voiceId)
    if (lang) {
      const catalog = await this.catalog()
      const next = catalog?.voices.find(
        voice => voice.lang === lang && voice.installed && voice.id !== voiceId
      )
      const { [lang]: _removed, ...rest } = stored
      await this.saveDefaults(user, next ? { ...rest, [lang]: next.id } : rest)
    }
    return { freedBytes: Number(body.freedBytes) || 0 }
  }

  async setDefault(user: User, lang: string, voiceId: string): Promise<void> {
    this.assertVoiceId(voiceId)
    const catalog = await this.catalog()
    if (!catalog)
      throw new ServiceUnavailableException({
        code: 'TTS_OFFLINE',
        message: 'The text-to-speech service is not running',
      })
    const voice = catalog.voices.find(entry => entry.id === voiceId)
    if (!voice || voice.lang !== lang)
      throw new BadRequestException({
        code: 'INVALID_VOICE',
        message: 'Choose a voice of this language',
      })
    if (!voice.installed)
      throw new BadRequestException({
        code: 'VOICE_NOT_INSTALLED',
        message: 'Download the voice first',
      })
    await this.saveDefaults(user, { ...(await this.storedDefaults(user)), [lang]: voiceId })
  }
}
