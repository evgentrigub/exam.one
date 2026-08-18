import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import { createSkillExercise, fetchSkillExercises } from '~/composables/usePracticeCatalog'

const topics = ref<SpeakingA2Topic[]>([])
const isInitialized = ref(false)
let hydratePromise: Promise<void> | null = null

export const useSpeakingExercises = () => {
  const hydrate = async (): Promise<void> => {
    if (import.meta.server) return
    if (isInitialized.value) return
    if (hydratePromise) return hydratePromise
    hydratePromise = (async () => {
      try {
        topics.value = await fetchSkillExercises<SpeakingA2Topic>('SPEAKING')
        isInitialized.value = true
      } catch (error) {
        console.error('Failed to load speaking topics from API:', error)
        topics.value = []
        isInitialized.value = true
      } finally {
        hydratePromise = null
      }
    })()
    return hydratePromise
  }

  const getTopics = (): SpeakingA2Topic[] => topics.value.filter(topic => !topic.examOnly)

  const getTopicById = (id: string): SpeakingA2Topic | undefined =>
    topics.value.find(topic => topic.id === id)

  const addTopics = async (items: SpeakingA2Topic[]): Promise<void> => {
    const unique = items.filter(item => !topics.value.some(topic => topic.id === item.id))
    for (const topic of unique) {
      const saved = await createSkillExercise('SPEAKING', topic)
      topics.value = [...topics.value, saved]
    }
  }

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
    addTopics,
    hydrate,
  }
}
