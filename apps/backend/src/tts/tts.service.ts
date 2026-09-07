import { getLivePack, record, validateView } from '@exam-one/exam-packs'
import { createHash } from 'node:crypto'
import { packContext } from '../common/pack-context.interceptor'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type {
  AiResponse,
  DeleteListeningAudioData,
  GenerateListeningAudioData,
  TtsHealthData,
} from '@exam-one/contracts'
import type { AppConfig } from '../config/app.config'
import { mapPool } from './mapPool'
import {
  buildGeneratedListeningAudioMap,
  collectListeningAudioSegments,
  containedAudioPath,
  isListeningExercise,
  isSafeGeneratedExerciseId,
} from './listening-audio'
import { checkTtsHealth, synthesizeListeningTranscript, type TtsConfig } from './tts.adapter'

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name)

  constructor(private readonly config: ConfigService) {}

  private ttsConfig(): TtsConfig {
    const pack = getLivePack(packContext.getStore()?.packId)
    const installedLanguage = this.config.get<string>('app.TTS_LANG') ?? 'de'
    const voices = new Set(
      (this.config.get<string>('app.TTS_VOICES') ?? 'martin,bernd,victoria,eva')
        .split(',')
        .map(value => value.trim())
    )
    if (
      pack.speech.ttsLang !== installedLanguage ||
      !pack.speech.voices.length ||
      pack.speech.voices.some(v => !voices.has(v.id))
    )
      throw new Error('TTS language or voices are not available on this instance')
    return {
      baseUrl: this.config.getOrThrow<string>('app.TTS_BASE_URL'),
      voice: pack.speech.voices[0]?.id ?? this.config.get<string>('app.TTS_VOICE') ?? 'martin',
      speed: this.config.get<number>('app.TTS_SPEED') ?? 1.0,
      lang: pack.speech.ttsLang,
      turnPauseMs: this.config.get<number>('app.TTS_TURN_PAUSE_MS') ?? 350,
      concurrency: this.config.get<number>('app.TTS_CONCURRENCY') ?? 3,
    }
  }

  private audioRoot(): string {
    return this.config.getOrThrow<AppConfig['GENERATED_LISTENING_AUDIO_DIR']>(
      'app.GENERATED_LISTENING_AUDIO_DIR'
    )
  }

  private audioDirectory(exerciseId: string): string {
    const context = packContext.getStore()
    return createHash('sha256')
      .update(JSON.stringify([getLivePack(context?.packId).packId, context?.userId, exerciseId]))
      .digest('hex')
  }

  async health(): Promise<AiResponse<TtsHealthData>> {
    try {
      const ok = await checkTtsHealth(this.ttsConfig())
      return { data: { ok }, error: null }
    } catch (error: unknown) {
      this.logger.error('TTS health check failed', error)
      return {
        data: { ok: false },
        error: error instanceof Error ? error.message : 'TTS unavailable',
      }
    }
  }

  async generateListeningAudio(
    exerciseValue: unknown
  ): Promise<AiResponse<GenerateListeningAudioData>> {
    if (!getLivePack(packContext.getStore()?.packId).compatibility)
      return this.generatePackAudio(exerciseValue)
    if (!isListeningExercise(exerciseValue)) {
      return { data: null, error: 'Missing listening exercise payload' }
    }
    const exercise = exerciseValue
    if (!exercise.id || !isSafeGeneratedExerciseId(exercise.id)) {
      return { data: null, error: 'Exercise id is not a valid generated listening id.' }
    }

    let config: TtsConfig
    try {
      config = this.ttsConfig()
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'TTS unavailable' }
    }
    const healthy = await checkTtsHealth(config)
    if (!healthy) {
      return {
        data: null,
        error: 'TTS is offline. Start it with `pnpm tts:up`, then try Generate audio again.',
      }
    }

    const directory = this.audioDirectory(exercise.id)
    const segments = collectListeningAudioSegments(exercise).map(segment => ({
      ...segment,
      relativePath: `${directory}/${segment.relativePath}`,
    }))
    if (segments.length === 0) {
      return { data: null, error: 'No transcripts found to synthesize for this exercise.' }
    }

    const audioMap = buildGeneratedListeningAudioMap(exercise)
    if (!audioMap) {
      return { data: null, error: 'Could not build audio path map for this exercise.' }
    }
    const namespaceUrl = (url: string) =>
      url.replace('/audio/listening/generated/', `/audio/listening/generated/${directory}/`)
    if (audioMap.shared) audioMap.shared = namespaceUrl(audioMap.shared)
    if (audioMap.items)
      audioMap.items = Object.fromEntries(
        Object.entries(audioMap.items).map(([id, url]) => [id, namespaceUrl(url)])
      )

    const root = this.audioRoot()
    for (const segment of segments) {
      if (!containedAudioPath(root, segment.relativePath)) {
        return { data: null, error: 'Exercise id is not a valid generated listening id.' }
      }
    }

    try {
      await mapPool(segments, config.concurrency, async segment => {
        const bytes = await synthesizeListeningTranscript(segment.transcript, config)
        const absolute = containedAudioPath(root, segment.relativePath)
        if (!absolute) {
          throw new Error('Refusing to write audio outside the generated audio directory.')
        }
        await mkdir(path.dirname(absolute), { recursive: true })
        await writeFile(absolute, bytes)
      })
      return { data: { audio: audioMap, written: segments.length }, error: null }
    } catch (error: unknown) {
      this.logger.error('generate-listening-audio failed', error)
      const message = error instanceof Error ? error.message : 'Audio generation failed.'
      return { data: null, error: message }
    }
  }

  private async generatePackAudio(value: unknown): Promise<AiResponse<GenerateListeningAudioData>> {
    try {
      const pack = getLivePack(packContext.getStore()?.packId)
      const payload = record(value)
      const part = pack.structure
        .find(module => module.id === 'listening')
        ?.parts.find(part => part.n === payload['testingPart'] && part.available !== false)
      if (!part?.adapter || !part.runtime || typeof payload['id'] !== 'string')
        throw new Error('Invalid listening part or exercise identity')
      const view = part.adapter.project(payload)
      validateView(view, part.runtime)
      const config = this.ttsConfig()
      if (!(await checkTtsHealth(config)))
        throw new Error(
          'Audio generation is unavailable. Existing audio and manual practice remain available.'
        )
      const directory = this.audioDirectory(payload['id'])
      const segments = [
        ...(view.transcript ? [{ key: 'shared', transcript: view.transcript }] : []),
        ...(view.questions ?? []).flatMap((question, index) =>
          question.transcript
            ? [{ key: `item-${index}`, id: question.id, transcript: question.transcript }]
            : []
        ),
      ]
      if (!segments.length) throw new Error('No transcripts found for audio generation')
      const audio: GenerateListeningAudioData['audio'] = { items: {} }
      await mapPool(segments, config.concurrency, async segment => {
        const relative = `${directory}/${segment.key}.wav`
        const absolute = containedAudioPath(this.audioRoot(), relative)
        if (!absolute) throw new Error('Invalid audio path')
        const bytes = await synthesizeListeningTranscript(segment.transcript, config)
        await mkdir(path.dirname(absolute), { recursive: true })
        await writeFile(absolute, bytes)
        const url = `/audio/listening/generated/${relative}`
        if ('id' in segment) audio.items![String(segment.id)] = url
        else audio.shared = url
      })
      return { data: { audio, written: segments.length }, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Audio generation unavailable',
      }
    }
  }

  async deleteListeningAudio(exerciseIds: string[]): Promise<AiResponse<DeleteListeningAudioData>> {
    const pack = getLivePack(packContext.getStore()?.packId)
    const ids = [
      ...new Set(
        exerciseIds.filter(
          id =>
            typeof id === 'string' &&
            (pack.compatibility ? isSafeGeneratedExerciseId(id) : id.length > 0)
        )
      ),
    ]
    if (ids.length === 0) return { data: { deleted: 0 }, error: null }

    const root = this.audioRoot()
    let deleted = 0
    for (const exerciseId of ids) {
      // Historical unnamespaced files may be referenced by other users; retain them.
      const absolute = containedAudioPath(root, this.audioDirectory(exerciseId))
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
