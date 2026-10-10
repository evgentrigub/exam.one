export const CAMBRIDGE_B1_AUDIO_PATH_PREFIX = '/audio/listening/cambridge-en-b1'

/** The owning pack builds maps; consumers never infer seed paths from task numbers. */
export function buildSeedListeningAudioMap(exercise: { id: string; items?: { id: string }[] }) {
  const base = `${CAMBRIDGE_B1_AUDIO_PATH_PREFIX}/${exercise.id}`
  return exercise.items
    ? { items: Object.fromEntries(exercise.items.map(item => [item.id, `${base}/${item.id}.wav`])) }
    : { shared: `${base}/shared.wav` }
}
