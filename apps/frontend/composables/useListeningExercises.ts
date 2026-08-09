/**
 * Listening Exercises Composable
 * Offline-first: bundled seed exercises merged with any user/AI-generated ones
 * stored in localStorage. Mirrors useReadingTexts (defaults ∪ stored non-defaults).
 */

import { allDefaultListeningTopics } from '~/data/listening/exerciseListening'
import type {
  ListeningA2Exercise,
  ListeningExerciseAudioMap,
} from '~/utils/exercises/listening'

const STORAGE_KEY = 'exam-one:listening:exercises'
const AUDIO_OVERRIDES_KEY = 'exam-one:listening:audio-overrides'

const exercises = ref<ListeningA2Exercise[]>([])
const isInitialized = ref(false)

type AudioOverrides = Record<string, ListeningExerciseAudioMap>

function readAudioOverrides(): AudioOverrides {
  if (!import.meta.client) return {}
  try {
    const raw = localStorage.getItem(AUDIO_OVERRIDES_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as AudioOverrides
  } catch {
    return {}
  }
}

function writeAudioOverrides(overrides: AudioOverrides): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(AUDIO_OVERRIDES_KEY, JSON.stringify(overrides))
  } catch (error) {
    console.error('Failed to save listening audio overrides:', error)
  }
}

function applyAudioOverrides(
  list: ListeningA2Exercise[],
  overrides: AudioOverrides,
): ListeningA2Exercise[] {
  return list.map((exercise) => {
    const id = exercise.id
    if (!id || !overrides[id]) return exercise
    return { ...exercise, audio: overrides[id] }
  })
}

export const useListeningExercises = () => {
  const initialize = () => {
    if (isInitialized.value || import.meta.server) return

    try {
      const overrides = readAudioOverrides()
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ListeningA2Exercise[]
        const defaultIds = new Set(allDefaultListeningTopics.map(e => e.id))
        const uniqueStored = parsed.filter(e => !defaultIds.has(e.id))
        exercises.value = applyAudioOverrides(
          [...allDefaultListeningTopics, ...uniqueStored],
          overrides,
        )
      } else {
        exercises.value = applyAudioOverrides([...allDefaultListeningTopics], overrides)
      }
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load listening exercises from localStorage:', error)
      exercises.value = [...allDefaultListeningTopics]
      isInitialized.value = true
    }
  }

  const saveToStorage = () => {
    if (import.meta.server) return
    try {
      const defaultIds = new Set(allDefaultListeningTopics.map(e => e.id))
      const toSave = exercises.value.filter(e => e.id && !defaultIds.has(e.id))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))

      const overrides: AudioOverrides = {}
      for (const exercise of exercises.value) {
        const id = exercise.id
        if (!id || !defaultIds.has(id) || !exercise.audio) continue
        overrides[id] = exercise.audio
      }
      writeAudioOverrides(overrides)
    } catch (error) {
      console.error('Failed to save listening exercises to localStorage:', error)
    }
  }

  const getExercises = (): ListeningA2Exercise[] => exercises.value.filter(e => !e.examOnly)

  const getExerciseById = (id: string): ListeningA2Exercise | undefined =>
    exercises.value.find(e => e.id === id)

  const addExercises = (items: ListeningA2Exercise[]): void => {
    const unique = items.filter(item => !exercises.value.some(e => e.id === item.id))
    exercises.value = [...exercises.value, ...unique]
    saveToStorage()
  }

  const updateExerciseAudio = (
    id: string,
    audio: ListeningExerciseAudioMap,
  ): ListeningA2Exercise | undefined => {
    const index = exercises.value.findIndex(e => e.id === id)
    if (index < 0) return undefined

    const current = exercises.value[index]
    if (!current) return undefined

    const updated: ListeningA2Exercise = { ...current, audio }
    exercises.value = [
      ...exercises.value.slice(0, index),
      updated,
      ...exercises.value.slice(index + 1),
    ]
    saveToStorage()
    return updated
  }

  if (import.meta.client && !isInitialized.value) {
    initialize()
  }

  return {
    // State
    exercises: computed(() => exercises.value.filter(e => !e.examOnly)),
    isInitialized: readonly(isInitialized),

    // Methods
    getExercises,
    getExerciseById,
    addExercises,
    updateExerciseAudio,
  }
}
