/**
 * Speaking Exercises Composable
 * Offline-first: bundled seed topics merged with any user/AI-generated ones
 * stored in localStorage. Mirrors useReadingTexts (defaults ∪ stored non-defaults).
 */

import { defaultSpeakingTopics } from '~/data/speaking/exerciseSpeaking'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'

const STORAGE_KEY = 'exam-one:speaking:exercises'

const topics = ref<SpeakingA2Topic[]>([])
const isInitialized = ref(false)

export const useSpeakingExercises = () => {
  const initialize = () => {
    if (isInitialized.value || import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SpeakingA2Topic[]
        const defaultIds = new Set(defaultSpeakingTopics.map(t => t.id))
        const uniqueStored = parsed.filter(t => !defaultIds.has(t.id))
        topics.value = [...defaultSpeakingTopics, ...uniqueStored]
      } else {
        topics.value = [...defaultSpeakingTopics]
      }
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load speaking topics from localStorage:', error)
      topics.value = [...defaultSpeakingTopics]
      isInitialized.value = true
    }
  }

  const saveToStorage = () => {
    if (import.meta.server) return
    try {
      const defaultIds = new Set(defaultSpeakingTopics.map(t => t.id))
      const toSave = topics.value.filter(t => !defaultIds.has(t.id))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (error) {
      console.error('Failed to save speaking topics to localStorage:', error)
    }
  }

  const getTopics = (): SpeakingA2Topic[] => topics.value

  const getTopicById = (id: string): SpeakingA2Topic | undefined =>
    topics.value.find(t => t.id === id)

  const addTopics = (items: SpeakingA2Topic[]): void => {
    const unique = items.filter(item => !topics.value.some(t => t.id === item.id))
    topics.value.push(...unique)
    saveToStorage()
  }

  if (import.meta.client && !isInitialized.value) {
    initialize()
  }

  return {
    // State
    topics: readonly(topics),
    isInitialized: readonly(isInitialized),

    // Methods
    getTopics,
    getTopicById,
    addTopics,
  }
}
