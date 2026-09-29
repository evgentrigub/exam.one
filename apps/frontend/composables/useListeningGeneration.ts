/**
 * Listening Generation Composable
 * Manages per-part AI listening exercise generation with API persistence.
 */

import {
  filterJobsByParts,
  type PartGenerationJob,
  type PartGenerationState,
} from '~/utils/generation/partJobs'
import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import type { Difficulty } from '~/utils/types'
import {
  clearGenerationJob,
  loadGenerationJob,
  saveGenerationJob,
} from '~/composables/useGenerationJobs'

const STALE_THRESHOLD_MS = 5 * 60 * 1000

export interface ListeningGenerationOptions {
  parts?: number[] | undefined
  onPartComplete?: ((items: ListeningA2Exercise[]) => void) | undefined
}

export const useListeningGeneration = () => {
  const { t } = useI18n()
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
      const parsed = (await loadGenerationJob('LISTENING', requestPackId)) as PartGenerationState | null
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
      console.error('Failed to load listening generation state:', error)
      clearState()
    }
  }

  const saveState = () => {
    if (import.meta.server) return
    void saveGenerationJob('LISTENING', state.value, undefined, requestPackId).catch(error =>
      console.error('Failed to save listening generation state:', error)
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
      void clearGenerationJob('LISTENING', requestPackId).catch(() => undefined)
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
    onPartComplete?: (items: ListeningA2Exercise[]) => void
  ): Promise<ListeningA2Exercise[]> => {
    const generatedExercises: ListeningA2Exercise[] = []
    let loopError: string | null = null

    const pendingJobs = state.value.jobs.filter(
      job => job.status === 'queued' || job.status === 'failed'
    )

    for (const job of pendingJobs) {
      const part = job.part
      const prompt = assemble('listening', part, 'generator', { count: 1 })
      if (!prompt) {
        const message = t('generation.noPromptForPart', { part })
        updateJobStatus(part, 'failed', message)
        loopError = message
        continue
      }

      updateJobStatus(part, 'running')

      try {
        const response = await aiFetch<ListeningA2Exercise[]>('/llm/generate-listening', {
          packId: requestPackId,
          method: 'POST',
          body: { difficulty, prompts: [{ part, prompt }] },
        })

        if (response.error || !response.data || response.data.length === 0) {
          throw new Error(
            response.error || t('generation.noExerciseForPart', { skill: t('skill.listening'), part })
          )
        }

        generatedExercises.push(...response.data)
        updateJobStatus(part, 'done')

        if (onPartComplete) {
          try {
            onPartComplete(response.data)
          } catch (callbackError) {
            console.error('onPartComplete callback failed for listening part', part, callbackError)
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : t('generation.partFailed', { part })
        console.error(`Listening generation failed for part ${part}:`, error)
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

  const generateListening = async (
    difficulty: Difficulty = pack.value.cefr,
    options: ListeningGenerationOptions = {}
  ): Promise<ListeningA2Exercise[]> => {
    const allParts = generators('listening', 1)
    if (allParts.length === 0) {
      throw new Error(t('generation.noGeneratorPrompts', { skill: t('skill.listening') }))
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
    onPartComplete?: (items: ListeningA2Exercise[]) => void
  ): Promise<ListeningA2Exercise[]> => {
    const difficulty = state.value.difficulty
    if (!difficulty) {
      throw new Error(t('generation.noStateToResume'))
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
    onPartComplete?: (items: ListeningA2Exercise[]) => void
  ): Promise<ListeningA2Exercise[]> => {
    if (!state.value.difficulty) {
      throw new Error(t('generation.noFailedToRetry'))
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

    generateListening,
    resumeGeneration,
    retryGeneration,
    dismissError,
    clearState,
  }
}
