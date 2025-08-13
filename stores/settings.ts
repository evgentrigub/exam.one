import { defineStore } from 'pinia'

/**
 * Settings store
 * Holds globally shared UI preferences like exam level.
 * Persists to localStorage via VueUse so it works fully offline.
 */
export const useSettingsStore = defineStore('settings', () => {
  const examLevel = useLocalStorage<'A2' | 'C1'>(
    'examLevel',
    'A2',
    {
      // Defer reading/writing until client mount to avoid SSR hydration
      // overwriting an existing localStorage value with the default.
      initOnMounted: true,
    },
  )

  return {
    examLevel,
  }
})


