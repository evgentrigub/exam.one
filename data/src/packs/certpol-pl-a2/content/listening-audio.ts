import type { ListeningPlExercise } from './types'

/** Where `pnpm generate:listening-audio` writes the bundled Polish WAVs; the pack's `audioPathPrefix`. */
export const CERTPOL_AUDIO_PATH_PREFIX = '/audio/listening/certpol-pl-a2'

/**
 * Point an exercise at its bundled seed WAVs, so it plays without a TTS service: one file per
 * item for Zadanie I, one shared file for the single recording of Zadania II–V.
 */
export function withSeedAudio<T extends ListeningPlExercise>(exercise: T): T {
  const base = `${CERTPOL_AUDIO_PATH_PREFIX}/${exercise.id}`
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
