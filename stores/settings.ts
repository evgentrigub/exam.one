import { defineStore } from 'pinia'

/**
 * Settings store
 * Holds globally shared UI preferences like exam level.
 * Persists to localStorage via VueUse so it works fully offline.
 */
export const useSettingsStore = defineStore('settings', () => {
  const examLevel = useLocalStorage<Difficulty>('examLevel', 'A2')

  return {
    examLevel,
  }
})


