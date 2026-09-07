/**
 * Speaking Generation Composable
 * Manages per-part AI speaking topic generation with API persistence.
 */

import {
  filterJobsByParts,
  type PartGenerationJob,
  type PartGenerationState,
} from '~/utils/generation/partJobs'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import type { Difficulty } from '~/utils/types'
import {
  clearGenerationJob,
  loadGenerationJob,
  saveGenerationJob,
} from '~/composables/useGenerationJobs'

const STALE_THRESHOLD_MS = 5 * 60 * 1000

export interface SpeakingGenerationOptions {
  parts?: number[] | undefined
  onPartComplete?: ((items: SpeakingA2Topic[]) => void) | undefined
}

export const useSpeakingGeneration = () => {
  const requestPackId = useSettingsStore().packId
  const { pack, assemble, generators } = usePackPrompt(requestPackId)
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

  const loadState = async () => {
    if (import.meta.server) return

    try {
      const parsed = (await loadGenerationJob('SPEAKING', requestPackId)) as PartGenerationState | null
      if (!parsed) return

      if (parsed.isGenerating && parsed.startedAt) {
        const startTime = new Date(parsed.startedAt).getTime()
        if (Date.now() - startTime > STALE_THRESHOLD_MS) {
          clearState()
          return
        }
      }

      const restoredJobs = parsed.jobs.map(job =>
        job.status === 'running' ? { ...job, status: 'queued' as const } : job
      )

      state.value = {
        ...parsed,
        isGenerating: false,
        jobs: restoredJobs,
      }
    } catch (error) {
      console.error('Failed to load speaking generation state:', error)
      clearState()
    }
  }

  const saveState = () => {
    if (import.meta.server) return
    void saveGenerationJob('SPEAKING', state.value, undefined, requestPackId).catch(error =>
      console.error('Failed to save speaking generation state:', error)
    )
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
      void clearGenerationJob('SPEAKING', requestPackId).catch(() => undefined)
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
    onPartComplete?: (items: SpeakingA2Topic[]) => void
  ): Promise<SpeakingA2Topic[]> => {
    const generatedTopics: SpeakingA2Topic[] = []
    let loopError: string | null = null

    const pendingJobs = state.value.jobs.filter(
      job => job.status === 'queued' || job.status === 'failed'
    )

    for (const job of pendingJobs) {
      const part = job.part
      const prompt = assemble('speaking', part, 'generator', { count: 1 })
      if (!prompt) {
        updateJobStatus(part, 'failed', `No prompt configured for part ${part}`)
        loopError = `No prompt configured for part ${part}`
        continue
      }

      updateJobStatus(part, 'running')

      try {
        const response = await aiFetch<SpeakingA2Topic[]>('/llm/generate-speaking', {
          packId: requestPackId,
          method: 'POST',
          body: { difficulty, prompts: [{ part, prompt }] },
        })

        if (response.error || !response.data || response.data.length === 0) {
          throw new Error(response.error || `No speaking topic generated for part ${part}`)
        }

        generatedTopics.push(...response.data)
        updateJobStatus(part, 'done')

        if (onPartComplete) {
          try {
            onPartComplete(response.data)
          } catch (callbackError) {
            console.error('onPartComplete callback failed for speaking part', part, callbackError)
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : `Failed to generate part ${part}`
        console.error(`Speaking generation failed for part ${part}:`, error)
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

    return generatedTopics
  }

  const generateSpeaking = async (
    difficulty: Difficulty = pack.value.cefr,
    options: SpeakingGenerationOptions = {}
  ): Promise<SpeakingA2Topic[]> => {
    const allParts = generators('speaking', 1)
    if (allParts.length === 0) {
      throw new Error('No speaking generator prompts are configured for the active exam pack')
    }
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
    onPartComplete?: (items: SpeakingA2Topic[]) => void
  ): Promise<SpeakingA2Topic[]> => {
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
    onPartComplete?: (items: SpeakingA2Topic[]) => void
  ): Promise<SpeakingA2Topic[]> => {
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
    void loadState()
  })

  return {
    isGenerating,
    generatingDifficulty,
    generationError,
    generationJobs,
    canResumeGeneration,

    generateSpeaking,
    resumeGeneration,
    retryGeneration,
    dismissError,
    clearState,
  }
}
