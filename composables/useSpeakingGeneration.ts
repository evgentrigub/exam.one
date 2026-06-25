/**
 * Speaking Generation Composable
 * Manages AI speaking topic generation state with localStorage persistence.
 * Mirrors useReadingGeneration: one prompt per Sprechen Teil, so a single click
 * yields one topic for each supported part (Teil 1–2).
 */

import { speakingA2Parts } from '~/data/speaking/a2/exerciseGeneratorSpeakingA2'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import type { Difficulty } from '~/utils/types'

const STORAGE_KEY = 'exam-one:speaking:generation-state'

interface GenerationState {
  isGenerating: boolean
  difficulty: Difficulty | null
  startedAt: string | null
  error: string | null
}

export const useSpeakingGeneration = () => {
  const state = ref<GenerationState>({
    isGenerating: false,
    difficulty: null,
    startedAt: null,
    error: null
  })

  /**
   * Load generation state from localStorage, resetting stale interrupted runs.
   */
  const loadState = () => {
    if (import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedState = JSON.parse(stored)

        if (parsedState.isGenerating && parsedState.startedAt) {
          const startTime = new Date(parsedState.startedAt).getTime()
          const fiveMinutes = 5 * 60 * 1000
          if (Date.now() - startTime > fiveMinutes) {
            clearState()
            return
          }
        }

        state.value = parsedState
      }
    } catch (error) {
      console.error('Failed to load speaking generation state:', error)
      clearState()
    }
  }

  const saveState = () => {
    if (import.meta.server) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    } catch (error) {
      console.error('Failed to save speaking generation state:', error)
    }
  }

  const clearState = () => {
    state.value = { isGenerating: false, difficulty: null, startedAt: null, error: null }
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Generate one speaking topic per Teil for the specified difficulty.
   */
  const generateSpeaking = async (difficulty: Difficulty = 'A2'): Promise<SpeakingA2Topic[]> => {
    state.value = {
      isGenerating: true,
      difficulty,
      startedAt: new Date().toISOString(),
      error: null
    }
    saveState()

    try {
      if (difficulty !== 'A2') {
        throw new Error(`Unsupported difficulty level: ${difficulty}`)
      }

      const body = { difficulty, prompts: speakingA2Parts(1) }

      const response = (await $fetch('/api/generate-speaking', {
        method: 'POST',
        body
      }) as unknown) as { topics: SpeakingA2Topic[]; error?: string }

      if (response.error || !response.topics || response.topics.length === 0) {
        throw new Error(response.error || 'No speaking topics generated')
      }

      clearState()
      return response.topics
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate speaking topics'
      state.value = { isGenerating: false, difficulty: null, startedAt: null, error: errorMessage }
      saveState()
      throw error
    }
  }

  const retryGeneration = async (): Promise<SpeakingA2Topic[]> => {
    if (!state.value.error || !state.value.difficulty) {
      throw new Error('No failed generation to retry')
    }
    const difficulty = state.value.difficulty
    clearState()
    return generateSpeaking(difficulty)
  }

  const dismissError = () => {
    clearState()
  }

  onMounted(() => {
    loadState()
  })

  return {
    // State
    isGenerating: computed(() => state.value.isGenerating),
    generatingDifficulty: computed(() => state.value.difficulty),
    generationError: computed(() => state.value.error),

    // Methods
    generateSpeaking,
    retryGeneration,
    dismissError,
    clearState
  }
}
