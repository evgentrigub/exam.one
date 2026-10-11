export const DELE_B1_AUDIO_PATH_PREFIX = '/audio/listening/dele-es-b1'

export function buildSeedListeningAudioMap(exercise: { id: string; items?: { id: string }[] }) {
  const prefix = `${DELE_B1_AUDIO_PATH_PREFIX}/${exercise.id}`
  return exercise.items?.length
    ? {
        items: Object.fromEntries(
          exercise.items.map(item => [item.id, `${prefix}/${item.id}.wav`])
        ),
      }
    : { shared: `${prefix}/shared.wav` }
}
