import type { ListeningA2Exercise, ListeningExerciseAudioMap } from '~/utils/exercises/listening'

export const LISTENING_AUDIO_EXT = 'wav' as const

/** Deterministic public path for a shared-transcript seed exercise (Teil 2 / 4). */
export function sharedListeningAudioPath(exerciseId: string): string {
  return `/audio/listening/a2/${exerciseId}/shared.${LISTENING_AUDIO_EXT}`
}

/** Deterministic public path for a per-item seed segment (Teil 1 / 3). */
export function itemListeningAudioPath(exerciseId: string, itemId: string): string {
  return `/audio/listening/a2/${exerciseId}/${itemId}.${LISTENING_AUDIO_EXT}`
}

/** On-demand TTS output path for a shared transcript. */
export function generatedSharedListeningAudioPath(exerciseId: string): string {
  return `/audio/listening/generated/${exerciseId}/shared.${LISTENING_AUDIO_EXT}`
}

/** On-demand TTS output path for a per-item segment. */
export function generatedItemListeningAudioPath(exerciseId: string, itemId: string): string {
  return `/audio/listening/generated/${exerciseId}/${itemId}.${LISTENING_AUDIO_EXT}`
}

/**
 * Resolve the audio URL for a shared exercise player.
 * Prefers an explicit `audio.shared` map entry, else the derived seed path.
 */
export function resolveSharedListeningAudioSrc(exercise: ListeningA2Exercise): string | undefined {
  if (exercise.testingPart !== 2 && exercise.testingPart !== 4) return undefined
  const id = exercise.id
  if (!id) return undefined
  return exercise.audio?.shared ?? sharedListeningAudioPath(id)
}

/**
 * Resolve the audio URL for a per-item player.
 * Prefers `audio.items[itemId]`, else the derived seed path.
 */
export function resolveItemListeningAudioSrc(
  exercise: ListeningA2Exercise,
  itemId: string
): string | undefined {
  if (exercise.testingPart !== 1 && exercise.testingPart !== 3) return undefined
  const exerciseId = exercise.id
  if (!exerciseId) return undefined
  return exercise.audio?.items?.[itemId] ?? itemListeningAudioPath(exerciseId, itemId)
}

/** Collect every expected audio URL for an exercise (for availability probes). */
export function collectListeningAudioSrcs(exercise: ListeningA2Exercise): string[] {
  if (exercise.testingPart === 1 || exercise.testingPart === 3) {
    return exercise.items
      .map(item => {
        const itemId = item.id
        if (!itemId) return undefined
        return resolveItemListeningAudioSrc(exercise, itemId)
      })
      .filter((src): src is string => Boolean(src))
  }

  const shared = resolveSharedListeningAudioSrc(exercise)
  return shared ? [shared] : []
}

/** Build the full audio map for a seed exercise using derived public paths. */
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

/** Build audio map pointing at on-demand generated/ paths. */
export function buildGeneratedListeningAudioMap(
  exercise: ListeningA2Exercise
): ListeningExerciseAudioMap | undefined {
  const id = exercise.id
  if (!id) return undefined

  if (exercise.testingPart === 1 || exercise.testingPart === 3) {
    const items: Record<string, string> = {}
    for (const item of exercise.items) {
      const itemId = item.id
      if (!itemId) continue
      items[itemId] = generatedItemListeningAudioPath(id, itemId)
    }
    return { items }
  }

  return { shared: generatedSharedListeningAudioPath(id) }
}

export interface ListeningAudioSegment {
  relativePath: string
  publicUrl: string
  transcript: string
}

/** Segments to synthesize for an exercise (relative to public/). */
export function collectListeningAudioSegments(
  exercise: ListeningA2Exercise
): ListeningAudioSegment[] {
  const id = exercise.id
  if (!id) return []

  if (exercise.testingPart === 1 || exercise.testingPart === 3) {
    return exercise.items.flatMap(item => {
      const itemId = item.id
      if (!itemId || !item.transcript.trim()) return []
      const publicUrl = generatedItemListeningAudioPath(id, itemId)
      return [
        {
          relativePath: `audio/listening/generated/${id}/${itemId}.${LISTENING_AUDIO_EXT}`,
          publicUrl,
          transcript: item.transcript,
        },
      ]
    })
  }

  if (!exercise.transcript?.trim()) return []
  const publicUrl = generatedSharedListeningAudioPath(id)
  return [
    {
      relativePath: `audio/listening/generated/${id}/shared.${LISTENING_AUDIO_EXT}`,
      publicUrl,
      transcript: exercise.transcript,
    },
  ]
}
