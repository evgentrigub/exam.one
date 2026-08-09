/**
 * Speaking Exercises Composable
 * Offline-first: bundled seed topics merged with any user/AI-generated ones
 * stored in localStorage. Mirrors useReadingTexts (defaults ∪ stored non-defaults).
 */

import { allDefaultSpeakingTopics } from '~/data/speaking/exerciseSpeaking'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'

const STORAGE_KEY = 'exam-one:speaking:exercises'

// Keep the SSR and pre-hydration client render deterministic. Stored topics are
// merged after mount so localStorage cannot change the hydration tree.
const topics = ref<SpeakingA2Topic[]>([...allDefaultSpeakingTopics])
const isInitialized = ref(false)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFourStrings(value: unknown): value is [string, string, string, string] {
  return Array.isArray(value) && value.length === 4 && value.every(item => typeof item === 'string')
}

function normaliseStoredTopic(value: unknown): SpeakingA2Topic | null {
  if (!isRecord(value)) return null

  if (
    value['testingPart'] === 1 &&
    value['topicType'] === 'interview' &&
    typeof value['id'] === 'string' &&
    typeof value['theme'] === 'string' &&
    typeof value['createdAt'] === 'string'
  ) {
    const answerQuestions = isFourStrings(value['answerQuestions'])
      ? value['answerQuestions']
      : isFourStrings(value['cards'])
        ? (value['cards'].map(card => `Was kannst du über ${card} erzählen?`) as [
            string,
            string,
            string,
            string,
          ])
        : null
    const askQuestions = isFourStrings(value['askQuestions'])
      ? value['askQuestions']
      : isFourStrings(value['cards'])
        ? (value['cards'].map(card => `Was denkst du über ${card}?`) as [
            string,
            string,
            string,
            string,
          ])
        : null

    if (!answerQuestions || !askQuestions) return null
    return {
      id: value['id'],
      testingPart: 1,
      topicType: 'interview',
      difficulty: 'A2',
      theme: value['theme'],
      answerQuestions,
      askQuestions,
      createdAt: value['createdAt'],
    }
  }

  if (
    value['testingPart'] === 2 &&
    value['topicType'] === 'monologue' &&
    typeof value['id'] === 'string' &&
    typeof value['theme'] === 'string' &&
    typeof value['createdAt'] === 'string' &&
    isFourStrings(value['keywords'])
  ) {
    return {
      id: value['id'],
      testingPart: 2,
      topicType: 'monologue',
      difficulty: 'A2',
      theme: value['theme'],
      keywords: value['keywords'],
      createdAt: value['createdAt'],
    }
  }

  return null
}

export const useSpeakingExercises = () => {
  const initialize = () => {
    if (isInitialized.value || import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as unknown
        const defaultIds = new Set(allDefaultSpeakingTopics.map(t => t.id))
        const uniqueStored = (Array.isArray(parsed) ? parsed : [])
          .map(normaliseStoredTopic)
          .filter((topic): topic is SpeakingA2Topic => topic !== null)
          .filter(t => !defaultIds.has(t.id))
        topics.value = [...allDefaultSpeakingTopics, ...uniqueStored]
      } else {
        topics.value = [...allDefaultSpeakingTopics]
      }
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load speaking topics from localStorage:', error)
      topics.value = [...allDefaultSpeakingTopics]
      isInitialized.value = true
    }
  }

  const saveToStorage = () => {
    if (import.meta.server) return
    try {
      const defaultIds = new Set(allDefaultSpeakingTopics.map(t => t.id))
      const toSave = topics.value.filter(t => !defaultIds.has(t.id))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (error) {
      console.error('Failed to save speaking topics to localStorage:', error)
    }
  }

  const getTopics = (): SpeakingA2Topic[] => topics.value.filter(t => !t.examOnly)

  const getTopicById = (id: string): SpeakingA2Topic | undefined =>
    topics.value.find(t => t.id === id)

  const addTopics = (items: SpeakingA2Topic[]): void => {
    const unique = items.filter(item => !topics.value.some(t => t.id === item.id))
    topics.value.push(...unique)
    saveToStorage()
  }

  if (import.meta.client && !isInitialized.value) {
    onMounted(initialize)
  }

  return {
    // State
    topics: computed(() => topics.value.filter(t => !t.examOnly)),
    isInitialized: readonly(isInitialized),

    // Methods
    getTopics,
    getTopicById,
    addTopics,
  }
}
