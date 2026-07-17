/**
 * Writing Topics Composable
 * Manages writing topics in localStorage with CRUD operations
 * Prepares for future OpenAI topic generation
 */

import { defaultWritingTopics as defaultTopics } from '~/data/writing/exerciseWriting'
import type { WritingExercise } from '~/utils/types'

const STORAGE_KEY = 'exam-one:writing:topics'
const LEGACY_STORAGE_KEY = 'exame-one-writing-topics'

export const useWritingTopics = () => {
  const topics = ref<WritingExercise[]>([])
  const isInitialized = ref(false)

  /**
   * Initialize topics from localStorage or seed with defaults
   */
  const initializeTopics = () => {
    if (import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
      
      if (stored) {
        topics.value = JSON.parse(stored)
      } else {
        // First time: seed with default topics
        topics.value = [...defaultTopics]
        saveToStorage()
      }
      
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load topics from localStorage:', error)
      // Fallback to default topics
      topics.value = [...defaultTopics]
      isInitialized.value = true
    }
  }

  /**
   * Save topics to localStorage
   */
  const saveToStorage = () => {
    if (import.meta.server) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(topics.value))
    } catch (error) {
      console.error('Failed to save topics to localStorage:', error)
    }
  }

  /**
   * Get all topics
   */
  const getTopics = (): WritingExercise[] => {
    return topics.value
  }

  /**
   * Get topic by ID
   */
  const getTopicById = (id: string): WritingExercise | undefined => {
    return topics.value.find(topic => topic.id === id)
  }

  /**
   * Delete topic by ID
   */
  const deleteTopic = (id: string): boolean => {
    const exists = topics.value.some(topic => topic.id === id)
    
    if (!exists) {
      console.warn(`Topic with id ${id} not found`)
      return false
    }

    topics.value = topics.value.filter(topic => topic.id !== id)
    saveToStorage()
    return true
  }

  /**
   * Add new topic (for future OpenAI generation)
   */
  const addTopic = (topic: WritingExercise): void => {
    // Check for duplicate ID
    const exists = topics.value.some(t => t.id === topic.id)
    
    if (exists) {
      console.warn(`Topic with id ${topic.id} already exists`)
      return
    }

    topics.value = [...topics.value, topic]
    saveToStorage()
  }

  /**
   * Add multiple topics at once
   * Accepts ALL topics regardless of topicType to ensure nothing is filtered
   */
  const addTopics = (newTopics: WritingExercise[]): void => {
    const uniqueTopics = newTopics.filter(
      newTopic => !topics.value.some(t => t.id === newTopic.id)
    )

    if (uniqueTopics.length < newTopics.length) {
      console.warn(`Skipped ${newTopics.length - uniqueTopics.length} duplicate topic(s)`)
    }

    topics.value = [...topics.value, ...uniqueTopics]
    saveToStorage()
  }

  /**
   * Reset to default topics (useful for testing or reset feature)
   */
  const resetToDefaults = (): void => {
    topics.value = [...defaultTopics]
    saveToStorage()
  }

  /**
   * Get topics count
   */
  const getTopicsCount = (): number => {
    return topics.value.length
  }

  // Initialize on mount (client-side only)
  onMounted(() => {
    initializeTopics()
  })

  return {
    // State
    topics: readonly(topics),
    isInitialized: readonly(isInitialized),

    // Methods
    getTopics,
    getTopicById,
    deleteTopic,
    addTopic,
    addTopics,
    resetToDefaults,
    getTopicsCount
  }
}

