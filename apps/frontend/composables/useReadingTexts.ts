import { onPackReset, packEpoch } from '~/utils/packScope'
import type { ReadingExercise } from '~/utils/exercises/reading'
import {
  createSkillExercise,
  deleteSkillExercise,
  fetchSkillExercises,
} from '~/composables/usePracticeCatalog'

const texts = ref<ReadingExercise[]>([])
const isInitialized = ref(false)
let hydratePromise: Promise<void> | null = null
onPackReset(() => { texts.value = []; isInitialized.value = false; hydratePromise = null })

export const useReadingTexts = () => {
  const requestPackId = useSettingsStore().packId
  const requestEpoch = packEpoch()
  const hydrate = async (): Promise<void> => {
    if (import.meta.server) return
    if (isInitialized.value) return
    if (hydratePromise) return hydratePromise
    const epoch = packEpoch()
    hydratePromise = (async () => {
      try {
        const loaded = await fetchSkillExercises<ReadingExercise>('READING')
        if (epoch !== packEpoch()) return
        texts.value = loaded
        isInitialized.value = true
      } catch (error) {
        if (epoch !== packEpoch()) return
        console.error('Failed to load reading texts from API:', error)
        texts.value = []
        isInitialized.value = true
      } finally {
        if (epoch === packEpoch()) hydratePromise = null
      }
    })()
    return hydratePromise
  }

  const getTexts = (): ReadingExercise[] => texts.value.filter(text => !text.examOnly)

  const getTextById = (id: string): ReadingExercise | undefined =>
    texts.value.find(text => text.id === id)

  const deleteText = async (id: string): Promise<boolean> => {
    const current = texts.value.find(text => text.id === id)
    if (!current || current.examOnly) return false
    try {
      await deleteSkillExercise(id, requestPackId)
      if (requestEpoch === packEpoch()) texts.value = texts.value.filter(text => text.id !== id)
      return true
    } catch (error) {
      console.warn('Cannot delete reading text', error)
      return false
    }
  }

  const addText = async (text: ReadingExercise): Promise<void> => {
    if (texts.value.some(item => item.id === text.id)) return
    const saved = await createSkillExercise('READING', text, requestPackId)
    if (requestEpoch === packEpoch()) texts.value = [...texts.value, saved]
  }

  const addTexts = async (newTexts: ReadingExercise[]): Promise<void> => {
    const unique = newTexts.filter(item => !texts.value.some(text => text.id === item.id))
    for (const text of unique) {
      await addText(text)
    }
  }

  const resetToDefaults = async (): Promise<void> => {
    isInitialized.value = false
    await hydrate()
  }

  const getTextsCount = (): number => getTexts().length

  if (import.meta.client && !isInitialized.value) {
    void hydrate()
  }

  return {
    texts: computed(() => texts.value.filter(text => !text.examOnly)),
    isInitialized: readonly(isInitialized),
    getTexts,
    getTextById,
    deleteText,
    addText,
    addTexts,
    resetToDefaults,
    getTextsCount,
    hydrate,
  }
}
