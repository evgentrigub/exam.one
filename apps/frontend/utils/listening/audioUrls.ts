import type {
  ListeningA2Exercise,
  ListeningA2Part,
} from '~/utils/exercises/listening'

export const LISTENING_AUDIO_EXT = 'wav' as const

/** Deterministic public path for a shared-transcript exercise (Teil 2 / 4). */
export function sharedListeningAudioPath(exerciseId: string): string {
  return `/audio/listening/a2/${exerciseId}/shared.${LISTENING_AUDIO_EXT}`
}

/** Deterministic public path for a per-item exercise segment (Teil 1 / 3). */
export function itemListeningAudioPath(exerciseId: string, itemId: string): string {
  return `/audio/listening/a2/${exerciseId}/${itemId}.${LISTENING_AUDIO_EXT}`
}

/** Goethe A2 replay limits: Teile 1 & 4 twice, Teile 2 & 3 once. */
export function listeningReplayLimit(testingPart: ListeningA2Part): 1 | 2 {
  return testingPart === 1 || testingPart === 4 ? 2 : 1
}

/**
 * Resolve the audio URL for a shared exercise player.
 * Prefers an explicit `audio.shared` map entry, else the derived path.
 */
export function resolveSharedListeningAudioSrc(exercise: ListeningA2Exercise): string | undefined {
  if (exercise.testingPart !== 2 && exercise.testingPart !== 4) return undefined
  const id = exercise.id
  if (!id) return undefined
  return exercise.audio?.shared ?? sharedListeningAudioPath(id)
}

/**
 * Resolve the audio URL for a per-item player.
 * Prefers `audio.items[itemId]`, else the derived path.
 */
export function resolveItemListeningAudioSrc(
  exercise: ListeningA2Exercise,
  itemId: string,
): string | undefined {
  if (exercise.testingPart !== 1 && exercise.testingPart !== 3) return undefined
  const exerciseId = exercise.id
  if (!exerciseId) return undefined
  return exercise.audio?.items?.[itemId] ?? itemListeningAudioPath(exerciseId, itemId)
}

/** Build the full audio map for a seed exercise using derived public paths. */
export function buildSeedListeningAudioMap(exercise: ListeningA2Exercise): ListeningA2Exercise['audio'] {
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
