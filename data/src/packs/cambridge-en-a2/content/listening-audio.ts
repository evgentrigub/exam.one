import type { ListeningKeyExercise } from './types'

/** Where `pnpm generate:listening-audio` writes the bundled A2 Key WAVs; the pack's `audioPathPrefix`. */
export const CAMBRIDGE_AUDIO_PATH_PREFIX = '/audio/listening/cambridge-en-a2'

/**
 * Point an exercise at its bundled seed WAVs, so it plays without a TTS service: one file per
 * item for Parts 1 and 4, one shared file for the single recording of Parts 2, 3 and 5.
 */
export function withSeedAudio<T extends ListeningKeyExercise>(exercise: T): T {
  const base = `${CAMBRIDGE_AUDIO_PATH_PREFIX}/${exercise.id}`
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
