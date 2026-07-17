/**
 * Listening Exercises Composable
 * Offline-first: bundled seed exercises merged with any user/AI-generated ones
 * stored in localStorage. Mirrors useReadingTexts (defaults ∪ stored non-defaults).
 */

import { defaultListeningTopics } from '~/data/listening/exerciseListening'
import type { ListeningA2Exercise } from '~/utils/exercises/listening'

const STORAGE_KEY = 'exam-one:listening:exercises'

const exercises = ref<ListeningA2Exercise[]>([])
const isInitialized = ref(false)

export const useListeningExercises = () => {
  const initialize = () => {
    if (isInitialized.value || import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ListeningA2Exercise[]
        const defaultIds = new Set(defaultListeningTopics.map(e => e.id))
        const uniqueStored = parsed.filter(e => !defaultIds.has(e.id))
        exercises.value = [...defaultListeningTopics, ...uniqueStored]
      } else {
        exercises.value = [...defaultListeningTopics]
      }
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load listening exercises from localStorage:', error)
      exercises.value = [...defaultListeningTopics]
      isInitialized.value = true
    }
  }

  const saveToStorage = () => {
    if (import.meta.server) return
    try {
      const defaultIds = new Set(defaultListeningTopics.map(e => e.id))
      const toSave = exercises.value.filter(e => !defaultIds.has(e.id))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (error) {
      console.error('Failed to save listening exercises to localStorage:', error)
    }
  }

  const getExercises = (): ListeningA2Exercise[] => exercises.value

  const getExerciseById = (id: string): ListeningA2Exercise | undefined =>
    exercises.value.find(e => e.id === id)

  const addExercises = (items: ListeningA2Exercise[]): void => {
    const unique = items.filter(item => !exercises.value.some(e => e.id === item.id))
    exercises.value.push(...unique)
    saveToStorage()
  }

  if (import.meta.client && !isInitialized.value) {
    initialize()
  }

  return {
    // State
    exercises: readonly(exercises),
    isInitialized: readonly(isInitialized),

    // Methods
    getExercises,
    getExerciseById,
    addExercises,
  }
}
