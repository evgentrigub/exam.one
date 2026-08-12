import { allDefaultWritingTopics } from '~/data/writing/exerciseWriting'
import type { WritingExercise } from '~/utils/types'

const STORAGE_KEY = 'exam-one:writing:topics'
const LEGACY_STORAGE_KEY = 'exame-one-writing-topics'

const topics = ref<WritingExercise[]>([...allDefaultWritingTopics])
const isInitialized = ref(false)

export const useWritingTopics = () => {
  const initializeTopics = () => {
    if (isInitialized.value || import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
      const parsed = stored ? (JSON.parse(stored) as WritingExercise[]) : []
      const defaultIds = new Set(allDefaultWritingTopics.map(topic => topic.id))
      const extras = Array.isArray(parsed)
        ? parsed.filter(topic => topic?.id && !defaultIds.has(topic.id))
        : []
      topics.value = [...allDefaultWritingTopics, ...extras]
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load writing topics from localStorage:', error)
      topics.value = [...allDefaultWritingTopics]
      isInitialized.value = true
    }
  }

  const saveToStorage = () => {
    if (import.meta.server) return
    try {
      const defaultIds = new Set(allDefaultWritingTopics.map(topic => topic.id))
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(topics.value.filter(topic => !defaultIds.has(topic.id))),
      )
    } catch (error) {
      console.error('Failed to save writing topics to localStorage:', error)
    }
  }

  const getTopics = (): WritingExercise[] => topics.value.filter(topic => !topic.examOnly)

  const getTopicById = (id: string): WritingExercise | undefined =>
    topics.value.find(topic => topic.id === id)

  const deleteTopic = (id: string): boolean => {
    if (allDefaultWritingTopics.some(topic => topic.id === id)) return false
    const exists = topics.value.some(topic => topic.id === id)
    if (!exists) return false
    topics.value = topics.value.filter(topic => topic.id !== id)
    saveToStorage()
    return true
  }

  const addTopic = (topic: WritingExercise): void => {
    if (topics.value.some(item => item.id === topic.id)) return
    topics.value = [...topics.value, topic]
    saveToStorage()
  }

  const addTopics = (items: WritingExercise[]): void => {
    const unique = items.filter(item => !topics.value.some(topic => topic.id === item.id))
    topics.value = [...topics.value, ...unique]
    saveToStorage()
  }

  const resetToDefaults = (): void => {
    topics.value = [...allDefaultWritingTopics]
    saveToStorage()
  }

  const getTopicsCount = (): number => getTopics().length

  if (import.meta.client && !isInitialized.value) onMounted(initializeTopics)

  return {
    // State
    topics: computed(() => topics.value.filter(topic => !topic.examOnly)),
    isInitialized: readonly(isInitialized),

    // Methods
    getTopics,
    getTopicById,
    deleteTopic,
    addTopic,
    addTopics,
    resetToDefaults,
    getTopicsCount,
  }
}
