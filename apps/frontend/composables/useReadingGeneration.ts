/**
 * Reading Generation Composable
 * Manages per-part AI reading exercise generation with API persistence.
 */

import {
  filterJobsByParts,
  parseSkillPartKeys,
  type PartGenerationJob,
  type PartGenerationState,
} from '~/utils/generation/partJobs'
import type { ReadingExercise } from '~/utils/exercises/reading'
import type { Difficulty } from '~/utils/types'
import {
  clearGenerationJob,
  loadGenerationJob,
  saveGenerationJob,
} from '~/composables/useGenerationJobs'
const STALE_THRESHOLD_MS = 5 * 60 * 1000

export interface ReadingGenerationOptions {
  parts?: number[] | undefined
  onPartComplete?: ((items: ReadingExercise[]) => void) | undefined
}

export const useReadingGeneration = () => {
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
      const parsed = (await loadGenerationJob('READING', requestPackId)) as PartGenerationState | null
      if (!parsed) return

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
    void saveGenerationJob('READING', state.value, undefined, requestPackId).catch(error =>
      console.error('Failed to save reading generation state:', error)
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
      void clearGenerationJob('READING', requestPackId).catch(() => undefined)
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
      const prompt = assemble('reading', part, 'generator', { count: 1 })
      if (!prompt) {
        const message = t('generation.noPromptForPart', { part })
        updateJobStatus(part, 'failed', message)
        loopError = message
        continue
      }

      updateJobStatus(part, 'running')

      try {
        const response = await aiFetch<ReadingExercise[]>('/llm/generate-reading', {
          packId: requestPackId,
          method: 'POST',
          body: { difficulty, prompts: [{ part, prompt }] },
        })

        if (response.error || !response.data || response.data.length === 0) {
          throw new Error(
            response.error || t('generation.noExerciseForPart', { skill: t('skill.reading'), part })
          )
        }

        generatedTexts.push(...response.data)
        updateJobStatus(part, 'done')

        if (onPartComplete) {
          try {
            onPartComplete(response.data)
          } catch (callbackError) {
            console.error('onPartComplete callback failed for reading part', part, callbackError)
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : t('generation.partFailed', { part })
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
    difficulty: Difficulty = pack.value.cefr,
    options: ReadingGenerationOptions = {}
  ): Promise<ReadingExercise[]> => {
    const allParts = generators('reading', 1)
    if (allParts.length === 0) {
      throw new Error(t('generation.noGeneratorPrompts', { skill: t('skill.reading') }))
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
    onPartComplete?: (items: ReadingExercise[]) => void
  ): Promise<ReadingExercise[]> => {
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
    onPartComplete?: (items: ReadingExercise[]) => void
  ): Promise<ReadingExercise[]> => {
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

    generateReading,
    resumeGeneration,
    retryGeneration,
    dismissError,
    clearState,
  }
}

export { parseSkillPartKeys }
