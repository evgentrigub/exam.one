import type { WritingExercise } from '~/utils/types'
import {
  createSkillExercise,
  deleteSkillExercise,
  fetchSkillExercises,
} from '~/composables/usePracticeCatalog'
import { whenPracticeReady } from '~/composables/usePracticeImport'

const topics = ref<WritingExercise[]>([])
const isInitialized = ref(false)
let hydratePromise: Promise<void> | null = null

export const useWritingTopics = () => {
  const hydrate = async (): Promise<void> => {
    if (import.meta.server) return
    if (isInitialized.value) return
    if (hydratePromise) return hydratePromise
    hydratePromise = (async () => {
      await whenPracticeReady()
      try {
        topics.value = await fetchSkillExercises<WritingExercise>('WRITING')
        isInitialized.value = true
      } catch (error) {
        console.error('Failed to load writing topics from API:', error)
        topics.value = []
        isInitialized.value = true
      } finally {
        hydratePromise = null
      }
    })()
    return hydratePromise
  }

  const getTopics = (): WritingExercise[] => topics.value.filter(topic => !topic.examOnly)

  const getTopicById = (id: string): WritingExercise | undefined =>
    topics.value.find(topic => topic.id === id)

  const deleteTopic = async (id: string): Promise<boolean> => {
    const current = topics.value.find(topic => topic.id === id)
    if (!current || current.examOnly) return false
    try {
      await deleteSkillExercise(id)
      topics.value = topics.value.filter(topic => topic.id !== id)
      return true
    } catch {
      return false
    }
  }

  const addTopic = async (topic: WritingExercise): Promise<void> => {
    if (topics.value.some(item => item.id === topic.id)) return
    const saved = await createSkillExercise('WRITING', topic)
    topics.value = [...topics.value, saved]
  }

  const addTopics = async (items: WritingExercise[]): Promise<void> => {
    const unique = items.filter(item => !topics.value.some(topic => topic.id === item.id))
    for (const topic of unique) {
      await addTopic(topic)
    }
  }

  const resetToDefaults = async (): Promise<void> => {
    isInitialized.value = false
    await hydrate()
  }

  const getTopicsCount = (): number => getTopics().length

  if (import.meta.client && !isInitialized.value) {
    onMounted(() => {
      void hydrate()
    })
  }

  return {
    topics: computed(() => topics.value.filter(topic => !topic.examOnly)),
    isInitialized: readonly(isInitialized),
    getTopics,
    getTopicById,
    deleteTopic,
    addTopic,
    addTopics,
    resetToDefaults,
    getTopicsCount,
    hydrate,
  }
}
