import { defineStore } from 'pinia'
import { DEFAULT_PACK_ID, getLivePack } from '@exam-one/exam-packs'
import type { Difficulty } from '~/utils/types'

/**
 * Settings store
 * Active pack and target language are loaded from NestJS /settings/me after login.
 * Theme stays client-side (useTheme).
 */
export const useSettingsStore = defineStore('settings', () => {
  const packId = ref(DEFAULT_PACK_ID)
  const targetLanguage = ref<string>('de')
  const hydrated = ref(false)

  const examLevel = computed<Difficulty>(() => {
    const cefr = getLivePack(packId.value).cefr
    return cefr
  })

  async function hydrateFromApi(): Promise<void> {
    if (!import.meta.client) return
    try {
      const { getSettings } = useAuth()
      const settings = await getSettings()
      packId.value = settings.packId || DEFAULT_PACK_ID
      const lang = settings.targetLanguage
      targetLanguage.value = lang
      hydrated.value = true
    } catch {
      hydrated.value = true
    }
  }

  async function selectPack(id: string): Promise<void> {
    const { updateSettings } = useAuth()
    const saved = await updateSettings({ packId: id })
    targetLanguage.value = saved.targetLanguage
    packId.value = saved.packId
  }

  async function persist(): Promise<void> {
    if (!import.meta.client) return
    const { updateSettings } = useAuth()
    await updateSettings({
      packId: packId.value,
      targetLanguage: targetLanguage.value,
    })
  }

  return {
    packId,
    examLevel,
    targetLanguage,
    hydrated,
    hydrateFromApi,
    persist,
    selectPack,
  }
})
