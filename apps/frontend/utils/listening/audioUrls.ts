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

/** One shared recording whose questions carry their own options (Cambridge A2 Key Part 3). */
export interface SharedChoiceListening {
  id?: string
  transcript: string
  questions: Array<{
    id?: string
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
  }>
}

/** One shared recording and a page of notes with typed gaps (Cambridge A2 Key Part 2). */
export interface NotesListening {
  id?: string
  transcript: string
  content: string
  questions: Array<{ id?: string; question: string; accepted: string[]; explanation?: string }>
}

/**
 * A shared transcript with ordinary choice questions and no top-level option bank, which
 * would make it a matching task instead.
 */
export function isSharedChoiceListening(exercise: ListeningA2Exercise): boolean {
  const raw = exercise as unknown as Record<string, unknown>
  return (
    !('items' in raw) &&
    !('options' in raw) &&
    typeof raw['transcript'] === 'string' &&
    Array.isArray(raw['questions']) &&
    raw['questions'].some(
      question =>
        typeof question === 'object' && question !== null && Array.isArray((question as { options?: unknown }).options)
    )
  )
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
/**
 * Resolve the audio URL for a shared exercise player.
 *
 * Prefers an explicit `audio.shared` map entry, else the derived seed path. For a *generated*
 * exercise that derived path cannot exist - generated audio lives under a sha256 directory the
 * client cannot compute - and that is deliberate: the availability probe 404s, which is what
 * raises the missing-audio banner and the Generate audio button. Returning undefined instead
 * would leave no expected sources, so nothing would look missing and nothing would offer to
 * generate it.
 */
export function resolveSharedListeningAudioSrc(exercise: ListeningA2Exercise): string | undefined {
  if (usesItemAudio(exercise)) return undefined
  const id = exercise.id
  if (!id) return undefined
  return exercise.audio?.shared ?? sharedListeningAudioPath(id)
}

/** Resolve the audio URL for a per-item player. Same fallback rationale as the shared case. */
export function resolveItemListeningAudioSrc(
  exercise: ListeningA2Exercise,
  itemId: string
): string | undefined {
  if (!usesItemAudio(exercise)) return undefined
  const exerciseId = exercise.id
  if (!exerciseId) return undefined
  return exercise.audio?.items?.[itemId] ?? itemListeningAudioPath(exerciseId, itemId)
}

/**
 * Collect every expected audio URL for an exercise, for the availability probe.
 *
 * `usesItemAudio` is true when *some* item carries an id, so an item without one still gets a
 * player - built on the same synthesised id the session uses. Skipping those here would make
 * the exercise report fewer sources than it renders, leaving a silent player with no source
 * and no missing-audio banner.
 */
export function collectListeningAudioSrcs(exercise: ListeningA2Exercise): string[] {
  if (usesItemAudio(exercise)) {
    return exercise.items
      .map((item, index) => resolveItemListeningAudioSrc(exercise, item.id ?? `${exercise.id}-i${index}`))
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
