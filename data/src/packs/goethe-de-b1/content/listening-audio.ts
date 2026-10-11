export const GOETHE_B1_AUDIO_PATH_PREFIX = '/audio/listening/goethe-de-b1'

export function buildSeedListeningAudioMap(exercise: { id: string }) {
  return { shared: `${GOETHE_B1_AUDIO_PATH_PREFIX}/${exercise.id}/shared.wav` }
}
