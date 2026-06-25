/**
 * Listening Generation Composable
 * Manages AI listening exercise generation state with localStorage persistence.
 * Mirrors useReadingGeneration: one prompt per Hören Teil, so a single click
 * yields one exercise for each part (Teil 1–4).
 */

import { listeningA2Parts } from '~/data/listening/a2/exerciseGeneratorListeningA2'
import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import type { Difficulty } from '~/utils/types'

const STORAGE_KEY = 'exam-one:listening:generation-state'

interface GenerationState {
  isGenerating: boolean
  difficulty: Difficulty | null
  startedAt: string | null
  error: string | null
}

export const useListeningGeneration = () => {
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
      console.error('Failed to load listening generation state:', error)
      clearState()
    }
  }

  const saveState = () => {
    if (import.meta.server) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    } catch (error) {
      console.error('Failed to save listening generation state:', error)
    }
  }

  const clearState = () => {
    state.value = { isGenerating: false, difficulty: null, startedAt: null, error: null }
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Generate one listening exercise per Teil for the specified difficulty.
   */
  const generateListening = async (difficulty: Difficulty = 'A2'): Promise<ListeningA2Exercise[]> => {
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

      const body = { difficulty, prompts: listeningA2Parts(1) }

      const response = (await $fetch('/api/generate-listening', {
        method: 'POST',
        body
      }) as unknown) as { exercises: ListeningA2Exercise[]; error?: string }

      if (response.error || !response.exercises || response.exercises.length === 0) {
        throw new Error(response.error || 'No listening exercises generated')
      }

      clearState()
      return response.exercises
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate listening exercises'
      state.value = { isGenerating: false, difficulty: null, startedAt: null, error: errorMessage }
      saveState()
      throw error
    }
  }

  const retryGeneration = async (): Promise<ListeningA2Exercise[]> => {
    if (!state.value.error || !state.value.difficulty) {
      throw new Error('No failed generation to retry')
    }
    const difficulty = state.value.difficulty
    clearState()
    return generateListening(difficulty)
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
    generateListening,
    retryGeneration,
    dismissError,
    clearState
  }
}
