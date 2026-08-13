/**
 * Reading Generation Composable
 * Manages per-part AI reading exercise generation with localStorage persistence.
 */

import { readingA2Parts } from '~/data/reading/a2/exerciseGeneratorReadingA2'
import {
  filterJobsByParts,
  parseSkillPartKeys,
  type PartGenerationJob,
  type PartGenerationState,
} from '~/utils/generation/partJobs'
import type { ReadingExercise } from '~/utils/exercises/reading'
import type { Difficulty } from '~/utils/types'

const STORAGE_KEY = 'exam-one:reading:generation-state'
const STALE_THRESHOLD_MS = 5 * 60 * 1000

export interface ReadingGenerationOptions {
  parts?: number[] | undefined
  onPartComplete?: ((items: ReadingExercise[]) => void) | undefined
}

export const useReadingGeneration = () => {
  const state = ref<PartGenerationState>({
    isGenerating: false,
    difficulty: null,
    startedAt: null,
    error: null,
    jobs: [],
  })

  const isGenerating = computed(() => state.value.isGenerating)
  const generatingDifficulty = computed(() => state.value.difficulty)
  const generationError = computed(() => state.value.error)
  const generationJobs = computed<PartGenerationJob[]>(() => state.value.jobs)
  const canResumeGeneration = computed(
    () =>
      !state.value.isGenerating &&
      state.value.jobs.some(job => job.status === 'queued' || job.status === 'failed')
  )

  const loadState = () => {
    if (import.meta.server) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored) as PartGenerationState

      // Treat stale in-progress states as abandoned and clear them.
      if (parsed.isGenerating && parsed.startedAt) {
        const startTime = new Date(parsed.startedAt).getTime()
        if (Date.now() - startTime > STALE_THRESHOLD_MS) {
          clearState()
          return
        }
      }

      // After a reload, any running job was interrupted; reset it to queued.
      const restoredJobs = parsed.jobs.map(job =>
        job.status === 'running' ? { ...job, status: 'queued' as const } : job
      )

      state.value = {
        ...parsed,
        isGenerating: false,
        jobs: restoredJobs,
      }
    } catch (error) {
      console.error('Failed to load reading generation state:', error)
      clearState()
    }
  }

  const saveState = () => {
    if (import.meta.server) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    } catch (error) {
      console.error('Failed to save reading generation state:', error)
    }
  }

  const clearState = () => {
    state.value = {
      isGenerating: false,
      difficulty: null,
      startedAt: null,
      error: null,
      jobs: [],
    }

    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const updateJobStatus = (part: number, status: PartGenerationJob['status'], error?: string) => {
    state.value = {
      ...state.value,
      jobs: state.value.jobs.map(job => {
        if (job.part !== part) return job
        return error === undefined ? { ...job, status } : { ...job, status, error }
      }),
    }
    saveState()
  }

  const runGenerationLoop = async (
    difficulty: Difficulty,
    onPartComplete?: (items: ReadingExercise[]) => void
  ): Promise<ReadingExercise[]> => {
    const generatedTexts: ReadingExercise[] = []
    let loopError: string | null = null

    const pendingJobs = state.value.jobs.filter(
      job => job.status === 'queued' || job.status === 'failed'
    )

    for (const job of pendingJobs) {
      const part = job.part
      const partPrompt = readingA2Parts(1).find(p => p.part === part)
      if (!partPrompt) {
        updateJobStatus(part, 'failed', `No prompt configured for part ${part}`)
        loopError = `No prompt configured for part ${part}`
        continue
      }

      updateJobStatus(part, 'running')

      try {
        const response = (await $fetch('/api/generate-reading', {
          method: 'POST',
          body: { difficulty, prompts: [partPrompt] },
        })) as unknown as { texts: ReadingExercise[]; error?: string }

        if (response.error || !response.texts || response.texts.length === 0) {
          throw new Error(response.error || `No reading exercise generated for part ${part}`)
        }

        generatedTexts.push(...response.texts)
        updateJobStatus(part, 'done')

        if (onPartComplete) {
          try {
            onPartComplete(response.texts)
          } catch (callbackError) {
            console.error('onPartComplete callback failed for reading part', part, callbackError)
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : `Failed to generate part ${part}`
        console.error(`Reading generation failed for part ${part}:`, error)
        updateJobStatus(part, 'failed', errorMessage)
        loopError = errorMessage
      }
    }

    const allDone = state.value.jobs.every(job => job.status === 'done')

    if (allDone) {
      clearState()
    } else {
      state.value = {
        ...state.value,
        isGenerating: false,
        error: loopError,
      }
      saveState()
    }

    return generatedTexts
  }

  const generateReading = async (
    difficulty: Difficulty = 'A2',
    options: ReadingGenerationOptions = {}
  ): Promise<ReadingExercise[]> => {
    if (difficulty !== 'A2') {
      throw new Error(`Unsupported difficulty level: ${difficulty}`)
    }

    const allParts = readingA2Parts(1)
    const selectedParts = filterJobsByParts(allParts, options.parts)
    const partsToGenerate = selectedParts.length > 0 ? selectedParts : allParts

    state.value = {
      isGenerating: true,
      difficulty,
      startedAt: new Date().toISOString(),
      error: null,
      jobs: partsToGenerate.map(part => ({ part: part.part, status: 'queued' })),
    }
    saveState()

    return runGenerationLoop(difficulty, options.onPartComplete)
  }

  const resumeGeneration = async (
    onPartComplete?: (items: ReadingExercise[]) => void
  ): Promise<ReadingExercise[]> => {
    const difficulty = state.value.difficulty
    if (!difficulty) {
      throw new Error('No generation state to resume')
    }

    state.value = {
      ...state.value,
      isGenerating: true,
      error: null,
    }
    saveState()

    return runGenerationLoop(difficulty, onPartComplete)
  }

  const retryGeneration = async (
    onPartComplete?: (items: ReadingExercise[]) => void
  ): Promise<ReadingExercise[]> => {
    if (!state.value.difficulty) {
      throw new Error('No failed generation to retry')
    }

    const difficulty = state.value.difficulty
    state.value = {
      ...state.value,
      isGenerating: true,
      error: null,
      jobs: state.value.jobs.map(job =>
        job.status === 'failed' ? { ...job, status: 'queued' } : job
      ),
    }
    saveState()

    return runGenerationLoop(difficulty, onPartComplete)
  }

  const dismissError = () => {
    clearState()
  }

  onMounted(() => {
    loadState()
  })

  return {
    isGenerating,
    generatingDifficulty,
    generationError,
    generationJobs,
    canResumeGeneration,

    generateReading,
    resumeGeneration,
    retryGeneration,
    dismissError,
    clearState,
  }
}

export { parseSkillPartKeys }
