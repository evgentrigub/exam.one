import { DEFAULT_PACK_ID, getLivePack } from '@exam-one/exam-packs'
import type {
  ListeningA2Exercise,
  ListeningExerciseA2Teil1,
  ListeningExerciseA2Teil2,
  ListeningExerciseA2Teil3,
  ListeningExerciseA2Teil4,
  ListeningExerciseAudioMap,
} from '~/utils/exercises/listening'

export const LISTENING_AUDIO_EXT = 'wav' as const

function seedPrefix(): string {
  try {
    const id = useSettingsStore().packId
    return getLivePack(id || DEFAULT_PACK_ID).speech.audioPathPrefix.replace(/\/$/, '')
  } catch {
    return getLivePack(DEFAULT_PACK_ID).speech.audioPathPrefix.replace(/\/$/, '')
  }
}

export function usesItemAudio(
  exercise: ListeningA2Exercise
): exercise is ListeningExerciseA2Teil1 | ListeningExerciseA2Teil3 {
  return 'items' in exercise && exercise.items.some(item => Boolean(item.id))
}

export function isSharedMatchingListening(
  exercise: ListeningA2Exercise
): exercise is ListeningExerciseA2Teil2 {
  return 'options' in exercise && exercise.questions.some(question => 'person' in question)
}

export function isStatementListening(
  exercise: ListeningA2Exercise
): exercise is ListeningExerciseA2Teil4 {
  return 'questions' in exercise && exercise.questions.some(question => 'statement' in question)
}

/** Deterministic public path for a shared-transcript seed exercise. */
export function sharedListeningAudioPath(exerciseId: string, prefix = seedPrefix()): string {
  return `${prefix}/${exerciseId}/shared.${LISTENING_AUDIO_EXT}`
}

/** Deterministic public path for a per-item seed segment. */
export function itemListeningAudioPath(exerciseId: string, itemId: string, prefix = seedPrefix()): string {
  return `${prefix}/${exerciseId}/${itemId}.${LISTENING_AUDIO_EXT}`
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
  if (usesItemAudio(exercise)) return undefined
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
  if (!usesItemAudio(exercise)) return undefined
  const exerciseId = exercise.id
  if (!exerciseId) return undefined
  return exercise.audio?.items?.[itemId] ?? itemListeningAudioPath(exerciseId, itemId)
}

/** Collect every expected audio URL for an exercise (for availability probes). */
export function collectListeningAudioSrcs(exercise: ListeningA2Exercise): string[] {
  if (usesItemAudio(exercise)) {
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

  if (usesItemAudio(exercise)) {
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

  if (usesItemAudio(exercise)) {
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

  if (usesItemAudio(exercise)) {
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
