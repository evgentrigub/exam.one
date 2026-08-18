import { defineStore } from 'pinia'

/**
 * Settings store
 * Exam level and target language are loaded from NestJS /settings/me after login.
 * Theme stays client-side (useTheme).
 */
export const useSettingsStore = defineStore('settings', () => {
  const examLevel = ref<'A2' | 'C1'>('A2')
  const targetLanguage = ref<'de' | 'en' | 'es'>('de')
  const hydrated = ref(false)

  async function hydrateFromApi(): Promise<void> {
    if (!import.meta.client) return
    try {
      const { getSettings } = useAuth()
      const settings = await getSettings()
      examLevel.value = settings.examLevel === 'C1' ? 'C1' : 'A2'
      const lang = settings.targetLanguage
      targetLanguage.value = lang === 'en' || lang === 'es' ? lang : 'de'
      hydrated.value = true
    } catch {
      hydrated.value = true
    }
  }

  async function persist(): Promise<void> {
    if (!import.meta.client) return
    try {
      const { updateSettings } = useAuth()
      await updateSettings({
        examLevel: examLevel.value,
        targetLanguage: targetLanguage.value,
      })
    } catch {
      // Keep local values; caller can surface errors
    }
  }

  return {
    examLevel,
    targetLanguage,
    hydrated,
    hydrateFromApi,
    persist,
  }
})
