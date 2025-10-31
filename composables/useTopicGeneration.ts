/**
 * Topic Generation Composable
 * Manages AI topic generation state with localStorage persistence
 */

import { generateTopicsC1Part1, generateTopicsC1Part2 } from '~/data/writing/topicGeneratorC1Prompt'
import { generateTopicsA2Part1, generateTopicsA2Part2 } from '~/data/writing/topicGeneratorA2Prompt'
import type { WritingTopic, Difficulty } from '~/utils/types'

const STORAGE_KEY = 'exame-one-topic-generation-state'

interface GenerationState {
  isGenerating: boolean
  part: 1 | 2 | null
  difficulty: Difficulty | null
  startedAt: string | null
  error: string | null
}

export const useTopicGeneration = () => {
  const state = ref<GenerationState>({
    isGenerating: false,
    part: null,
    difficulty: null,
    startedAt: null,
    error: null
  })

  /**
   * Load generation state from localStorage
   */
  const loadState = () => {
    if (import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedState = JSON.parse(stored)
        
        // Check if generation was interrupted (older than 5 minutes)
        if (parsedState.isGenerating && parsedState.startedAt) {
          const startTime = new Date(parsedState.startedAt).getTime()
          const now = Date.now()
          const fiveMinutes = 5 * 60 * 1000
          
          if (now - startTime > fiveMinutes) {
            // Generation likely failed, reset state
            clearState()
            return
          }
        }
        
        state.value = parsedState
      }
    } catch (error) {
      console.error('Failed to load generation state:', error)
      clearState()
    }
  }

  /**
   * Save state to localStorage
   */
  const saveState = () => {
    if (import.meta.server) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    } catch (error) {
      console.error('Failed to save generation state:', error)
    }
  }

  /**
   * Clear generation state
   */
  const clearState = () => {
    state.value = {
      isGenerating: false,
      part: null,
      difficulty: null,
      startedAt: null,
      error: null
    }
    
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Generate topics for specified part and difficulty
   */
  const generateTopics = async (part: 1 | 2, difficulty: Difficulty = 'C1'): Promise<WritingTopic[]> => {
    // Set generating state
    state.value = {
      isGenerating: true,
      part,
      difficulty,
      startedAt: new Date().toISOString(),
      error: null
    }
    saveState()

    try {
      // Get the appropriate prompt based on difficulty and part
      let prompt: string
      const numberOfTopics = 3 // Default number of topics to generate
      if (difficulty === 'C1') {
        prompt = part === 1 ? generateTopicsC1Part1() : generateTopicsC1Part2()
      } else if (difficulty === 'A2') {
        prompt = part === 1 ? generateTopicsA2Part1(numberOfTopics) : generateTopicsA2Part2(numberOfTopics)
      } else {
        throw new Error(`Unsupported difficulty level: ${difficulty}`)
      }

      // Call API endpoint - cast through unknown to bypass Nuxt's complex route type inference
      const response = (await $fetch('/api/generate-topics', {
        method: 'POST',
        body: {
          prompt,
          part,
          difficulty
        }
      }) as unknown) as { topics: WritingTopic[], error?: string }

      if (response.error || !response.topics || response.topics.length === 0) {
        throw new Error(response.error || 'No topics generated')
      }

      // Success - clear state
      clearState()
      return response.topics

    } catch (error: unknown) {
      // Set error state
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate topics'
      state.value = {
        isGenerating: false,
        part: null,
        difficulty: null,
        startedAt: null,
        error: errorMessage
      }
      saveState()

      throw error
    }
  }

  /**
   * Retry last failed generation
   */
  const retryGeneration = async (): Promise<WritingTopic[]> => {
    if (!state.value.error || !state.value.part || !state.value.difficulty) {
      throw new Error('No failed generation to retry')
    }

    const part = state.value.part
    const difficulty = state.value.difficulty
    clearState()
    return generateTopics(part, difficulty)
  }

  /**
   * Dismiss error
   */
  const dismissError = () => {
    clearState()
  }

  // Load state on mount
  onMounted(() => {
    loadState()
  })

  return {
    // State
    isGenerating: computed(() => state.value.isGenerating),
    generatingPart: computed(() => state.value.part),
    generatingDifficulty: computed(() => state.value.difficulty),
    generationError: computed(() => state.value.error),

    // Methods
    generateTopics,
    retryGeneration,
    dismissError,
    clearState
  }
}

