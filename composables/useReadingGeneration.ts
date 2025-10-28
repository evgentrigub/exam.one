/**
 * Reading Generation Composable
 * Manages AI reading exercise generation state with localStorage persistence
 */

import { generateReadingA2 } from '~/data/reading/dataToGenerateReadingA2'
import { generateReadingC1 } from '~/data/reading/dataToGenerateReadingC1'
import type { GermanText, Difficulty } from '~/utils/types'

const STORAGE_KEY = 'exame-one-reading-generation-state'

interface GenerationState {
  isGenerating: boolean
  difficulty: Difficulty | null
  startedAt: string | null
  error: string | null
}

export const useReadingGeneration = () => {
  const state = ref<GenerationState>({
    isGenerating: false,
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
      console.error('Failed to load reading generation state:', error)
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
      console.error('Failed to save reading generation state:', error)
    }
  }

  /**
   * Clear generation state
   */
  const clearState = () => {
    state.value = {
      isGenerating: false,
      difficulty: null,
      startedAt: null,
      error: null
    }
    
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Generate reading exercises for specified difficulty
   */
  const generateReading = async (difficulty: Difficulty = 'A2'): Promise<GermanText[]> => {
    // Set generating state
    state.value = {
      isGenerating: true,
      difficulty,
      startedAt: new Date().toISOString(),
      error: null
    }
    saveState()

    try {
      // Get the appropriate prompt based on difficulty
      let prompt: string
      if (difficulty === 'A2') {
        prompt = generateReadingA2()
      } else if (difficulty === 'C1') {
        prompt = generateReadingC1()
      } else {
        throw new Error(`Unsupported difficulty level: ${difficulty}`)
      }

      // Call API endpoint - cast through unknown to bypass Nuxt's complex route type inference
      const response = (await $fetch('/api/generate-reading', {
        method: 'POST',
        body: {
          prompt,
          difficulty
        }
      }) as unknown) as { texts: GermanText[], error?: string }

      if (response.error || !response.texts || response.texts.length === 0) {
        throw new Error(response.error || 'No reading exercises generated')
      }

      // Success - clear state
      clearState()
      return response.texts

    } catch (error: unknown) {
      // Set error state
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate reading exercises'
      state.value = {
        isGenerating: false,
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
  const retryGeneration = async (): Promise<GermanText[]> => {
    if (!state.value.error || !state.value.difficulty) {
      throw new Error('No failed generation to retry')
    }

    const difficulty = state.value.difficulty
    clearState()
    return generateReading(difficulty)
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
    generatingDifficulty: computed(() => state.value.difficulty),
    generationError: computed(() => state.value.error),

    // Methods
    generateReading,
    retryGeneration,
    dismissError,
    clearState
  }
}

