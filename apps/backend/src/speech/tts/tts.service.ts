import { getLivePack, record, validateView } from '@exam-one/exam-packs'
import { createHash, randomUUID } from 'node:crypto'
import { packContext } from '../../core/interceptors/pack-context.interceptor'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@exam-one/nestjs-libraries'
import type {
  AiResponse,
  DeleteListeningAudioData,
  GenerateListeningAudioData,
  TtsHealthData,
} from '@exam-one/contracts'
import type { AppConfig } from '../../config/app.config'
import { mapPool } from './mapPool'
import { containedAudioPath } from './listening-audio'
import {
  synthesizeListeningTranscript,
  listeningTranscriptHashKey,
  ttsHealthStatus,
  type TtsConfig,
} from './tts.adapter'

/** Thrown when the instance does not list the pack's language or voices. */
class TtsUnsupportedError extends Error {}

type PackVoice = { id: string; gender: 'male' | 'female' }

/** The pack's voices with the user's default voice first, when it is one of them. */
export function preferVoice(
  voices: readonly PackVoice[],
  preferred: string | undefined
): PackVoice[] {
  const index = preferred ? voices.findIndex(voice => voice.id === preferred) : -1
  if (index <= 0) return [...voices]
  return [voices[index]!, ...voices.slice(0, index), ...voices.slice(index + 1)]
}

function list(value: string | undefined): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map(item => item.trim().toLowerCase())
      .filter(Boolean)
  )
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  /** The current user's default voice for a language (Settings → Voice models), if any. */
  private async defaultVoiceFor(lang: string): Promise<string | undefined> {
    const userId = packContext.getStore()?.userId
    if (!userId) return undefined
    const setting = await this.prisma.setting.findUnique({
      where: { userId },
      select: { defaultVoices: true },
    })
    const value = record(setting?.defaultVoices)[lang]
    return typeof value === 'string' ? value : undefined
  }

  private async ttsConfig(): Promise<TtsConfig> {
    const pack = getLivePack(packContext.getStore()?.packId)
    // `TTS_LANGUAGES` lists every installed language; `TTS_LANG` is the single-language form.
    const languages = list(
      this.config.get<string>('app.TTS_LANGUAGES') ??
        this.config.get<string>('app.TTS_LANG') ??
        'de'
    )
    const voices = list(this.config.get<string>('app.TTS_VOICES') ?? 'martin,bernd,victoria,eva')
    if (
      !languages.has(pack.speech.ttsLang.toLowerCase()) ||
      !pack.speech.voices.length ||
      pack.speech.voices.some(v => !voices.has(v.id.toLowerCase()))
    )
      throw new TtsUnsupportedError('TTS language or voices are not available on this instance')
    const preferred = await this.defaultVoiceFor(pack.speech.ttsLang)
    const packVoices = preferVoice(pack.speech.voices, preferred)
    const narrator =
      pack.speech.ttsLang === 'de' && packVoices[0]?.id === preferred ? preferred : undefined
    return {
      baseUrl: this.config.getOrThrow<string>('app.TTS_BASE_URL'),
      voice: packVoices[0]?.id ?? this.config.get<string>('app.TTS_VOICE') ?? 'martin',
      speed: this.config.get<number>('app.TTS_SPEED') ?? 1.0,
      lang: pack.speech.ttsLang,
      turnPauseMs: this.config.get<number>('app.TTS_TURN_PAUSE_MS') ?? 350,
      concurrency: this.config.get<number>('app.TTS_CONCURRENCY') ?? 3,
      voices: packVoices,
      ...(pack.speech.maxChunkCharacters
        ? { maxChunkCharacters: pack.speech.maxChunkCharacters }
        : {}),
      ...(narrator ? { narrator } : {}),
    }
  }

  /** Where per-user generated listening audio lives (one folder per user, pack and exercise). */
  audioRoot(): string {
    return this.config.getOrThrow<AppConfig['GENERATED_LISTENING_AUDIO_DIR']>(
      'app.GENERATED_LISTENING_AUDIO_DIR'
    )
  }

  /** The generated-audio folder of an exercise for the current pack and user (`packContext`). */
  audioDirectoryFor(exerciseId: string): string {
    const context = packContext.getStore()
    return createHash('sha256')
      .update(JSON.stringify([getLivePack(context?.packId).packId, context?.userId, exerciseId]))
      .digest('hex')
  }

  async health(): Promise<AiResponse<TtsHealthData>> {
    try {
      const status = await ttsHealthStatus(await this.ttsConfig())
      if (status === 'ok') return { data: { ok: true }, error: null }
      if (status === 'offline') return { data: { ok: false, reason: 'offline' }, error: null }
      return {
        data: { ok: false, reason: 'unsupported' },
        error:
          'No voice for this exam pack is installed (Settings → Generated files → Voice models)',
      }
    } catch (error: unknown) {
      if (error instanceof TtsUnsupportedError)
        return { data: { ok: false, reason: 'unsupported' }, error: error.message }
      this.logger.error('TTS health check failed', error)
      return {
        data: { ok: false, reason: 'offline' },
        error: error instanceof Error ? error.message : 'TTS unavailable',
      }
    }
  }

  async generateListeningAudio(
    exerciseValue: unknown
  ): Promise<AiResponse<GenerateListeningAudioData>> {
    // Every pack synthesises through the projected view; the legacy per-payload path went
    // with the Goethe A2 compatibility flag.
    return this.generatePackAudio(exerciseValue)
  }

  async generatePackAudio(
    value: unknown,
    onProgress?: (done: number, total: number) => Promise<void> | void,
    signal?: AbortSignal
  ): Promise<AiResponse<GenerateListeningAudioData>> {
    try {
      signal?.throwIfAborted()
      const pack = getLivePack(packContext.getStore()?.packId)
      const payload = record(value)
      const part = pack.structure
        .find(module => module.id === 'listening')
        ?.parts.find(part => part.n === payload['testingPart'] && part.available !== false)
      if (!part?.adapter || !part.runtime || typeof payload['id'] !== 'string')
        throw new Error('Invalid listening part or exercise identity')
      const view = part.adapter.project(payload)
      validateView(view, part.runtime)
      const config = await this.ttsConfig()
      // Keep the actionable wording the legacy path used; it tells the user how to fix it.
      const status = await ttsHealthStatus(config)
      if (status === 'unsupported')
        throw new Error(
          'No voice for this language is installed. Download one in Settings → Generated files → Voice models, then try Generate audio again.'
        )
      if (status !== 'ok')
        throw new Error(
          'TTS is offline. Start it with `pnpm tts:up`, then try Generate audio again.'
        )
      const directory = this.audioDirectoryFor(payload['id'])
      const segments = [
        ...(view.sections ?? []).map((section, index) => ({
          key: `section-${index}`,
          sectionId: section.id,
          transcript: section.transcript,
        })),
        ...(view.transcript ? [{ key: 'shared', transcript: view.transcript }] : []),
        ...(view.questions ?? []).flatMap((question, index) =>
          question.transcript
            ? [{ key: `item-${index}`, id: question.id, transcript: question.transcript }]
            : []
        ),
      ]
      if (!segments.length) throw new Error('No transcripts found for audio generation')
      const audio: GenerateListeningAudioData['audio'] = { items: {}, sections: {} }
      let done = 0
      await mapPool(segments, config.concurrency, async segment => {
        signal?.throwIfAborted()
        const relative = `${directory}/${segment.key}.wav`
        const absolute = containedAudioPath(this.audioRoot(), relative)
        if (!absolute) throw new Error('Invalid audio path')
        const fingerprint = createHash('sha256')
          .update(
            JSON.stringify([
              listeningTranscriptHashKey(segment.transcript, config),
              config.speed,
              config.turnPauseMs,
            ])
          )
          .digest('hex')
        const cached = await Promise.all([
          readFile(`${absolute}.hash`, 'utf8').catch(() => ''),
          stat(absolute).catch(() => null),
        ])
        if (cached[0] !== fingerprint || !cached[1]?.size) {
          const bytes = await synthesizeListeningTranscript(segment.transcript, config, signal)
          signal?.throwIfAborted()
          await mkdir(path.dirname(absolute), { recursive: true })
          const temporary = `${absolute}.${randomUUID()}.tmp`
          try {
            await writeFile(temporary, bytes)
            await rename(temporary, absolute)
            await writeFile(`${absolute}.hash`, fingerprint)
          } finally {
            await rm(temporary, { force: true })
          }
        }
        const url = `/audio/listening/generated/${relative}`
        if ('sectionId' in segment) audio.sections![String(segment.sectionId)] = url
        else if ('id' in segment) audio.items![String(segment.id)] = url
        else audio.shared = url
        done += 1
        await onProgress?.(done, segments.length)
      })
      signal?.throwIfAborted()
      return { data: { audio, written: segments.length }, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Audio generation unavailable',
      }
    }
  }

  async deleteListeningAudio(exerciseIds: string[]): Promise<AiResponse<DeleteListeningAudioData>> {
    const ids = [...new Set(exerciseIds.filter(id => typeof id === 'string' && id.length > 0))]
    if (ids.length === 0) return { data: { deleted: 0 }, error: null }

    const root = this.audioRoot()
    let deleted = 0
    for (const exerciseId of ids) {
      // Historical unnamespaced files may be referenced by other users; retain them.
      const absolute = containedAudioPath(root, this.audioDirectoryFor(exerciseId))
      if (!absolute) continue
      try {
        await rm(absolute, { recursive: true, force: true })
        deleted += 1
      } catch (error) {
        this.logger.warn(`delete-listening-audio failed id=${exerciseId}`, error)
      }
    }
    return { data: { deleted }, error: null }
  }
}
