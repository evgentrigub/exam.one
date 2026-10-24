export const CERTPOL_B1_AUDIO_PATH_PREFIX = '/audio/listening/certpol-pl-b1'
export function buildSeedListeningAudioMap(exercise: { id: string; items?: { id: string }[] }) {
  const root = `${CERTPOL_B1_AUDIO_PATH_PREFIX}/${exercise.id}`
  return exercise.items?.length
    ? { items: Object.fromEntries(exercise.items.map(item => [item.id, `${root}/${item.id}.wav`])) }
    : { shared: `${root}/shared.wav` }
}
