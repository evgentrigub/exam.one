import { defineStore } from 'pinia'

/**
 * Settings store
 * Holds globally shared UI preferences like exam level and target exam language.
 * Persists to localStorage via VueUse so it works fully offline.
 */
export const useSettingsStore = defineStore('settings', () => {
  const examLevel = useLocalStorage<'A2' | 'C1'>('examLevel', 'A2', {
    // Defer reading/writing until client mount to avoid SSR hydration
    // overwriting an existing localStorage value with the default.
    initOnMounted: true,
  })

  /**
   * Target language for exam preparation.
   * Currently only German is fully supported.
   */
  const targetLanguage = useLocalStorage<'de' | 'en' | 'es'>('targetLanguage', 'de', {
    initOnMounted: true,
  })

  return {
    examLevel,
    targetLanguage,
  }
})
