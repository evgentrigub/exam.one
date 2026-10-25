import type { ListeningEsExercise } from './types'

/** Where `pnpm generate:listening-audio` writes the bundled DELE WAVs; the pack's `audioPathPrefix`. */
export const DELE_AUDIO_PATH_PREFIX = '/audio/listening/dele-es-a2'

/**
 * Point an exercise at its bundled seed WAVs, so it plays without a TTS service: one file per
 * item for Tareas 1–2, one shared file for the single recording of Tareas 3–4.
 */
export function withSeedAudio<T extends ListeningEsExercise>(exercise: T): T {
  const base = `${DELE_AUDIO_PATH_PREFIX}/${exercise.id}`
  if ('items' in exercise) {
    return {
      ...exercise,
      audio: {
        items: Object.fromEntries(exercise.items.map(item => [item.id, `${base}/${item.id}.wav`])),
      },
    }
  }
  return { ...exercise, audio: { shared: `${base}/shared.wav` } }
}
