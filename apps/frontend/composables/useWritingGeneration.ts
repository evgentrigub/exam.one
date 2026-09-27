/**
 * Writing Generation Composable
 * Manages per-part AI writing generation with API persistence
 */

import type { PartGenerationJob } from '~/utils/generation/partJobs'
import type { WritingExercise, Difficulty } from '~/utils/types'
import {
  clearGenerationJob,
  loadGenerationJob,
  saveGenerationJob,
} from '~/composables/useGenerationJobs'

interface GenerationState {
  isGenerating: boolean
  difficulty: Difficulty | null
  startedAt: string | null
  error: string | null
  jobs: PartGenerationJob[]
}

export interface WritingGenerationOptions {
  parts?: (1 | 2)[] | 1 | 2 | undefined
  onPartComplete?: ((items: WritingExercise[]) => void) | undefined
}

export const useWritingGeneration = () => {
  const requestPackId = useSettingsStore().packId
  const { pack, assemble, generators } = usePackPrompt(requestPackId)
  const state = ref<GenerationState>({
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
  const generatingPart = computed(() => {
    const runningJob = state.value.jobs.find(job => job.status === 'running')
    return runningJob ? (runningJob.part as 1 | 2) : null
  })
  const canResumeGeneration = computed(
    () =>
      !state.value.isGenerating &&
      state.value.jobs.some(job => job.status === 'queued' || job.status === 'failed')
  )

  /**
   * Load generation state from the API
   */
  const loadState = async () => {
    if (import.meta.server) return

    try {
      const parsed = (await loadGenerationJob('WRITING', requestPackId)) as
        (GenerationState & { part?: 1 | 2 }) | null
      if (!parsed) return

      // Check if generation was interrupted (older than 5 minutes)
      if (parsed.isGenerating && parsed.startedAt) {
        const startTime = new Date(parsed.startedAt).getTime()
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000

        if (now - startTime > fiveMinutes) {
          clearState()
          return
        }
      }

      // Migrate legacy single-part state to job-based state
      if (parsed.part && !parsed.jobs) {
        state.value = {
          isGenerating: false,
          difficulty: parsed.difficulty,
          startedAt: parsed.startedAt,
          error: parsed.error,
          jobs: [{ part: parsed.part, status: parsed.error ? 'failed' : 'queued' }],
        }
        return
      }

      // After reload, any running job was interrupted; reset it to queued
      const restoredJobs = (parsed.jobs || []).map((job: PartGenerationJob) =>
        job.status === 'running' ? { ...job, status: 'queued' as const } : job
      )

      state.value = {
        ...parsed,
        isGenerating: false,
        jobs: restoredJobs,
      }
    } catch (error) {
      console.error('Failed to load writing generation state:', error)
      clearState()
    }
  }

  /**
   * Save state to the API
   */
  const saveState = () => {
    if (import.meta.server) return
    void saveGenerationJob('WRITING', state.value, undefined, requestPackId).catch(error =>
      console.error('Failed to save writing generation state:', error)
    )
  }

  /**
   * Clear generation state
   */
  const clearState = () => {
    state.value = {
      isGenerating: false,
      difficulty: null,
      startedAt: null,
      error: null,
      jobs: [],
    }

    if (import.meta.client) {
      void clearGenerationJob('WRITING', requestPackId).catch(() => undefined)
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

  /** The writing screen has always offered a choice of three topics per part. */
  const TOPICS_PER_PART = 3

  const getPromptForPart = (part: 1 | 2, numberOfTopics = TOPICS_PER_PART): string => {
    const prompt = assemble('writing', part, 'generator', { count: numberOfTopics })
    if (!prompt) {
      throw new Error(`No writing generator prompt is configured for part ${part}`)
    }
    return prompt
  }

  /**
   * Run the generation loop over pending jobs
   */
  const runGenerationLoop = async (
    difficulty: Difficulty,
    onPartComplete?: (items: WritingExercise[]) => void
  ): Promise<WritingExercise[]> => {
    const generatedExercises: WritingExercise[] = []
    let loopError: string | null = null

    const pendingJobs = state.value.jobs.filter(
      job => job.status === 'queued' || job.status === 'failed'
    )

    for (const job of pendingJobs) {
      const part = job.part as 1 | 2

      updateJobStatus(part, 'running')

      try {
        const prompt = getPromptForPart(part)

        const response = await aiFetch<WritingExercise[]>('/llm/generate-topics', {
          packId: requestPackId,
          method: 'POST',
          body: {
            prompt,
            part,
            difficulty,
            count: TOPICS_PER_PART,
          },
        })

        const topics = response.data ?? []

        if (response.error || topics.length === 0) {
          throw new Error(response.error || `No exercises generated for part ${part}`)
        }

        generatedExercises.push(...topics)
        updateJobStatus(part, 'done')

        if (onPartComplete) {
          try {
            onPartComplete(topics)
          } catch (callbackError) {
            console.error('onPartComplete callback failed for writing part', part, callbackError)
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : `Failed to generate part ${part}`
        console.error(`Writing generation failed for part ${part}:`, error)
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

    return generatedExercises
  }

  /**
   * Generate writing exercises for specified part(s) and difficulty
   */
  const generateWriting = async (
    difficulty: Difficulty = pack.value.cefr,
    options: WritingGenerationOptions = {}
  ): Promise<WritingExercise[]> => {
    const availableParts = generators('writing', 3).map(item => item.part)
    const requestedParts =
      options.parts === undefined
        ? availableParts
        : Array.isArray(options.parts)
          ? options.parts
          : [options.parts]
    const partsToGenerate = requestedParts.filter((p): p is 1 | 2 =>
      availableParts.includes(p)
    )

    if (partsToGenerate.length === 0) {
      throw new Error('No valid writing parts to generate')
    }

    state.value = {
      isGenerating: true,
      difficulty,
      startedAt: new Date().toISOString(),
      error: null,
      jobs: partsToGenerate.map(part => ({ part, status: 'queued' })),
    }
    saveState()

    return runGenerationLoop(difficulty, options.onPartComplete)
  }

  /**
   * Resume interrupted generation
   */
  const resumeGeneration = async (
    onPartComplete?: (items: WritingExercise[]) => void
  ): Promise<WritingExercise[]> => {
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

  /**
   * Retry last failed generation
   */
  const retryGeneration = async (
    onPartComplete?: (items: WritingExercise[]) => void
  ): Promise<WritingExercise[]> => {
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

  /**
   * Dismiss error
   */
  const dismissError = () => {
    clearState()
  }

  // Load state on mount
  onMounted(() => {
    void loadState()
  })

  return {
    isGenerating,
    generatingDifficulty,
    generationError,
    generationJobs,
    generatingPart,
    canResumeGeneration,

    generateWriting,
    resumeGeneration,
    retryGeneration,
    dismissError,
    clearState,
  }
}
