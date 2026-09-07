import path from 'node:path'
import type { ListeningExerciseAudioMap } from '@exam-one/contracts'
import { isRecord } from '../../ai/json'

const LISTENING_AUDIO_EXT = 'wav'

export interface ListeningAudioSegment {
  relativePath: string
  publicUrl: string
  transcript: string
}

export interface LooseListeningExercise {
  id?: string
  title: string
  testingPart: number
  difficulty: string
  transcript?: string
  items?: { id?: string; transcript?: string }[]
}

export function isListeningExercise(value: unknown): value is LooseListeningExercise {
  if (!isRecord(value)) return false
  return (
    typeof value['title'] === 'string' &&
    typeof value['testingPart'] === 'number' &&
    typeof value['difficulty'] === 'string'
  )
}

export function generatedSharedListeningAudioPath(exerciseId: string): string {
  return `/audio/listening/generated/${exerciseId}/shared.${LISTENING_AUDIO_EXT}`
}

export function generatedItemListeningAudioPath(exerciseId: string, itemId: string): string {
  return `/audio/listening/generated/${exerciseId}/${itemId}.${LISTENING_AUDIO_EXT}`
}

export function buildGeneratedListeningAudioMap(
  exercise: LooseListeningExercise
): ListeningExerciseAudioMap | undefined {
  const id = exercise.id
  if (!id || !isSafeGeneratedExerciseId(id)) return undefined

  if (exercise.testingPart === 1 || exercise.testingPart === 3) {
    const items: Record<string, string> = {}
    for (const item of exercise.items ?? []) {
      const itemId = item.id
      if (!itemId || !isSafeGeneratedItemId(itemId)) continue
      items[itemId] = generatedItemListeningAudioPath(id, itemId)
    }
    return { items }
  }

  return { shared: generatedSharedListeningAudioPath(id) }
}

export function collectListeningAudioSegments(
  exercise: LooseListeningExercise
): ListeningAudioSegment[] {
  const id = exercise.id
  if (!id || !isSafeGeneratedExerciseId(id)) return []

  if (exercise.testingPart === 1 || exercise.testingPart === 3) {
    return (exercise.items ?? []).flatMap(item => {
      const itemId = item.id
      const transcript = item.transcript?.trim() ?? ''
      if (!itemId || !isSafeGeneratedItemId(itemId) || !transcript) return []
      return [
        {
          relativePath: `${id}/${itemId}.${LISTENING_AUDIO_EXT}`,
          publicUrl: generatedItemListeningAudioPath(id, itemId),
          transcript,
        },
      ]
    })
  }

  const transcript = exercise.transcript?.trim() ?? ''
  if (!transcript) return []
  return [
    {
      relativePath: `${id}/shared.${LISTENING_AUDIO_EXT}`,
      publicUrl: generatedSharedListeningAudioPath(id),
      transcript,
    },
  ]
}

export const GENERATED_EXERCISE_ID_RE = /^listening-a2-part[1-4]-[a-z0-9-]+$/i
export const GENERATED_ITEM_ID_RE = /^[a-z0-9][a-z0-9-]{0,78}$/i

export function isSafeGeneratedExerciseId(id: string): boolean {
  return GENERATED_EXERCISE_ID_RE.test(id)
}

export function isSafeGeneratedItemId(id: string): boolean {
  return GENERATED_ITEM_ID_RE.test(id) && !id.includes('..')
}

export function containedAudioPath(root: string, relativePath: string): string | null {
  if (path.isAbsolute(relativePath)) return null
  const parts = relativePath.split(/[/\\]/)
  if (parts.some(part => part === '' || part === '.' || part === '..')) return null
  const resolvedRoot = path.resolve(root)
  const absolute = path.resolve(resolvedRoot, relativePath)
  const prefix = resolvedRoot.endsWith(path.sep) ? resolvedRoot : resolvedRoot + path.sep
  if (!absolute.startsWith(prefix)) return null
  return absolute
}
