/**
 * Topic Generation Composable
 * Manages AI topic generation state with localStorage persistence
 */

import { generateTopicsC1Part1, generateTopicsC1Part2 } from '~/data/writing/dataToGenerateTopicsC1'
import type { WritingTopic } from '~/utils/types'

const STORAGE_KEY = 'exame-one-topic-generation-state'

interface GenerationState {
  isGenerating: boolean
  part: 1 | 2 | null
  startedAt: string | null
  error: string | null
}

export const useTopicGeneration = () => {
  const state = ref<GenerationState>({
    isGenerating: false,
    part: null,
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
      startedAt: null,
      error: null
    }
    
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Generate topics for specified part
   */
  const generateTopics = async (part: 1 | 2): Promise<WritingTopic[]> => {
    // Set generating state
    state.value = {
      isGenerating: true,
      part,
      startedAt: new Date().toISOString(),
      error: null
    }
    saveState()

    try {
      // Get the appropriate prompt
      const prompt = part === 1 ? generateTopicsC1Part1() : generateTopicsC1Part2()

      // Call API endpoint
      const response = await $fetch<{ topics: WritingTopic[], error?: string }>('/api/generate-topics', {
        method: 'POST',
        body: {
          prompt,
          part
        }
      })

      if (response.error || !response.topics || response.topics.length === 0) {
        throw new Error(response.error || 'No topics generated')
      }

      // Success - clear state
      clearState()
      return response.topics

    } catch (error: any) {
      // Set error state
      state.value = {
        isGenerating: false,
        part: null,
        startedAt: null,
        error: error?.message || 'Failed to generate topics'
      }
      saveState()

      throw error
    }
  }

  /**
   * Retry last failed generation
   */
  const retryGeneration = async (): Promise<WritingTopic[]> => {
    if (!state.value.error || !state.value.part) {
      throw new Error('No failed generation to retry')
    }

    const part = state.value.part
    clearState()
    return generateTopics(part)
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
    generationError: computed(() => state.value.error),

    // Methods
    generateTopics,
    retryGeneration,
    dismissError,
    clearState
  }
}

