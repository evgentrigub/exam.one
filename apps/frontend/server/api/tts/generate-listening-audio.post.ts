import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { ListeningA2Exercise, ListeningExerciseAudioMap } from '~/utils/exercises/listening'
import {
  buildGeneratedListeningAudioMap,
  collectListeningAudioSegments,
} from '~/utils/listening/audioUrls'
import { mapPool } from '~/server/utils/tts/mapPool'
import {
  checkTtsHealth,
  getTtsConfigFromEnv,
  synthesizeListeningTranscript,
} from '~/server/utils/tts/ttsAdapter'

interface AiResponse<T> {
  data: T | null
  error: string | null
}

interface GenerateListeningAudioBody {
  exercise?: ListeningA2Exercise
}

function isListeningExercise(value: unknown): value is ListeningA2Exercise {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record['title'] === 'string' &&
    typeof record['testingPart'] === 'number' &&
    typeof record['difficulty'] === 'string'
  )
}

function publicRoot(): string {
  return path.join(process.cwd(), 'public')
}

export default defineEventHandler(
  async (event): Promise<AiResponse<{ audio: ListeningExerciseAudioMap; written: number }>> => {
    const body = await readBody<GenerateListeningAudioBody>(event)
    if (!isListeningExercise(body?.exercise)) {
      throw createError({ statusCode: 400, statusMessage: 'Missing listening exercise payload' })
    }

    const exercise = body.exercise
    if (!exercise.id) {
      return { data: null, error: 'Exercise is missing an id; cannot write audio files.' }
    }

    const healthy = await checkTtsHealth()
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

    const config = getTtsConfigFromEnv()
    const root = publicRoot()

    try {
      await mapPool(segments, config.concurrency, async segment => {
        const bytes = await synthesizeListeningTranscript(segment.transcript, config)
        const absolute = path.join(root, segment.relativePath)
        await mkdir(path.dirname(absolute), { recursive: true })
        await writeFile(absolute, bytes)
      })

      return {
        data: { audio: audioMap, written: segments.length },
        error: null,
      }
    } catch (error: unknown) {
      console.error('[tts/generate-listening-audio] failed', error)
      const message = error instanceof Error ? error.message : 'Audio generation failed.'
      return { data: null, error: message }
    }
  }
)
