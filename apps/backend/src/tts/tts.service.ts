import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AiResponse, DeleteListeningAudioData, GenerateListeningAudioData, TtsHealthData } from '@exam-one/contracts'
import type { AppConfig } from '../config/app.config'
import { mapPool } from './mapPool'
import {
  buildGeneratedListeningAudioMap,
  collectListeningAudioSegments,
  GENERATED_EXERCISE_ID_RE,
  isListeningExercise,
} from './listening-audio'
import { checkTtsHealth, synthesizeListeningTranscript, type TtsConfig } from './tts.adapter'

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name)

  constructor(private readonly config: ConfigService) {}

  private ttsConfig(): TtsConfig {
    return {
      baseUrl: this.config.getOrThrow<string>('app.TTS_BASE_URL'),
      voice: this.config.get<string>('app.TTS_VOICE') ?? 'martin',
      speed: this.config.get<number>('app.TTS_SPEED') ?? 1.0,
      lang: this.config.get<string>('app.TTS_LANG') ?? 'de',
      turnPauseMs: this.config.get<number>('app.TTS_TURN_PAUSE_MS') ?? 350,
      concurrency: this.config.get<number>('app.TTS_CONCURRENCY') ?? 3,
    }
  }

  private audioRoot(): string {
    return this.config.getOrThrow<AppConfig['GENERATED_LISTENING_AUDIO_DIR']>(
      'app.GENERATED_LISTENING_AUDIO_DIR'
    )
  }

  async health(): Promise<AiResponse<TtsHealthData>> {
    try {
      const ok = await checkTtsHealth(this.ttsConfig())
      return { data: { ok }, error: null }
    } catch (error: unknown) {
      this.logger.error('TTS health check failed', error)
      return { data: { ok: false }, error: null }
    }
  }

  async generateListeningAudio(exerciseValue: unknown): Promise<AiResponse<GenerateListeningAudioData>> {
    if (!isListeningExercise(exerciseValue)) {
      return { data: null, error: 'Missing listening exercise payload' }
    }
    const exercise = exerciseValue
    if (!exercise.id) {
      return { data: null, error: 'Exercise is missing an id; cannot write audio files.' }
    }

    const config = this.ttsConfig()
    const healthy = await checkTtsHealth(config)
    if (!healthy) {
      return {
        data: null,
        error: 'TTS is offline. Start it with `pnpm tts:up`, then try Generate audio again.',
      }
    }

    const segments = collectListeningAudioSegments(exercise)
    if (segments.length === 0) {
      return { data: null, error: 'No transcripts found to synthesize for this exercise.' }
    }

    const audioMap = buildGeneratedListeningAudioMap(exercise)
    if (!audioMap) {
      return { data: null, error: 'Could not build audio path map for this exercise.' }
    }

    const root = this.audioRoot()
    try {
      await mapPool(segments, config.concurrency, async segment => {
        const bytes = await synthesizeListeningTranscript(segment.transcript, config)
        const absolute = path.join(root, segment.relativePath)
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

  async deleteListeningAudio(exerciseIds: string[]): Promise<AiResponse<DeleteListeningAudioData>> {
    const ids = exerciseIds.filter(id => GENERATED_EXERCISE_ID_RE.test(id))
    if (ids.length === 0) return { data: { deleted: 0 }, error: null }

    const root = this.audioRoot()
    let deleted = 0
    for (const exerciseId of ids) {
      try {
        await rm(path.join(root, exerciseId), { recursive: true, force: true })
        deleted += 1
      } catch (error) {
        this.logger.warn(`delete-listening-audio failed id=${exerciseId}`, error)
      }
    }
    return { data: { deleted }, error: null }
  }
}
