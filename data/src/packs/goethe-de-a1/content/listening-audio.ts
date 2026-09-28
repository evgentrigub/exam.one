import type { ListeningA1Exercise } from './types'

/** Where `pnpm generate:listening-audio` writes the bundled A1 WAVs; the pack's `audioPathPrefix`. */
export const A1_AUDIO_PATH_PREFIX = '/audio/listening/a1'

/** Point every item at its bundled seed WAV, so the exercise plays without a TTS service. */
export function withSeedAudio(exercise: ListeningA1Exercise): ListeningA1Exercise {
  return {
    ...exercise,
    audio: {
      items: Object.fromEntries(
        exercise.items.map(item => [
          item.id,
          `${A1_AUDIO_PATH_PREFIX}/${exercise.id}/${item.id}.wav`,
        ])
      ),
    },
  }
}
