import type { ListeningA2Exercise, ListeningExerciseAudioMap } from '../types/listening'

export const LISTENING_AUDIO_EXT = 'wav' as const

export function sharedListeningAudioPath(exerciseId: string): string {
  return `/audio/listening/a2/${exerciseId}/shared.${LISTENING_AUDIO_EXT}`
}

export function itemListeningAudioPath(exerciseId: string, itemId: string): string {
  return `/audio/listening/a2/${exerciseId}/${itemId}.${LISTENING_AUDIO_EXT}`
}

export function buildSeedListeningAudioMap(
  exercise: ListeningA2Exercise
): ListeningExerciseAudioMap | undefined {
  const id = exercise.id
  if (!id) return undefined

  if (exercise.testingPart === 1 || exercise.testingPart === 3) {
    const items: Record<string, string> = {}
    for (const item of exercise.items) {
      const itemId = item.id
      if (!itemId) continue
      items[itemId] = itemListeningAudioPath(id, itemId)
    }
    return { items }
  }

  return { shared: sharedListeningAudioPath(id) }
}
