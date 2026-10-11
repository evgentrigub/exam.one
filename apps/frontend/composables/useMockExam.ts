import type { MockExamSet } from '~/data/mockExam/goetheA2'
import type { MockExamOverview, CriterionReview } from '@exam-one/exam-packs'
import { mockModuleId, objectiveExercisePoints } from '@exam-one/exam-packs'
import type { SpeakingTranscripts } from '~/utils/exercises/speaking'
import type { DeepReadonly } from 'vue'
import type { MockExamAttemptDto } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'
import type { ObjectiveAnswers } from '~/utils/gapFill'

export type MockGradingStatus = 'auto' | 'pending' | 'done' | 'unavailable'

export interface MockExerciseResult {
  exerciseId: string
  answers?: ObjectiveAnswers
  score?: number
  total?: number
  content?: string
  wordCount?: number
  transcripts?: SpeakingTranscripts
  rawScore?: number | null
  grading?: MockGradingStatus
  error?: string | null
  writingReview?: DeepReadonly<CriterionReview>
  speakingReview?: DeepReadonly<CriterionReview>
}

export interface MockModuleState {
  done: boolean[]
  locked: boolean
  endsAt: string | null
  scoreRaw: number | null
  scoreFinal: number | null
  grading: MockGradingStatus
  responses: Record<string, MockExerciseResult>
}

export type MockOverviewStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface MockOverviewState {
  status: MockOverviewStatus
  data: MockExamOverview | null
  error: string | null
  requestedAt: string | null
  completedAt: string | null
}

export interface MockExamState {
  modules: Record<string, MockModuleState>
  finished: boolean
  startedAt: string | null
  finishedAt: string | null
  aiOverview: MockOverviewState
}

function blankModule(count: number, grading: MockGradingStatus): MockModuleState {
  return {
    done: Array.from({ length: count }, () => false),
    locked: false,
    endsAt: null,
    scoreRaw: null,
    scoreFinal: null,
    grading,
    responses: {},
  }
}

export function createBlankMockExamState(set: MockExamSet): MockExamState {
  const modules = {} as Record<string, MockModuleState>
  for (const definition of set.modules) {
    const grading =
      definition.skill === 'reading' || definition.skill === 'listening' ? 'auto' : 'pending'
    modules[mockModuleId(definition)] = blankModule(definition.exercises.length, grading)
  }
  return {
    modules,
    finished: false,
    startedAt: null,
    finishedAt: null,
    aiOverview: {
      status: 'idle',
      data: null,
      error: null,
      requestedAt: null,
      completedAt: null,
    },
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export const useMockExam = (setSource: MaybeRefOrGetter<MockExamSet>) => {
  const settings = useSettingsStore()
  const requestPackId = computed(() => settings.packId)
  const currentSet = computed(() => toValue(setSource))
  const state = ref<MockExamState>(createBlankMockExamState(currentSet.value))
  const isInitialized = ref(false)
  const initializedSetId = ref<string | null>(null)
  let persistInFlight = false
  let persistPending = false

  const persist = (): void => {
    if (import.meta.server) return
    if (persistInFlight) {
      persistPending = true
      return
    }
    persistInFlight = true
    void (async () => {
      try {
        do {
          persistPending = false
          await apiFetch(`/mock-exam/sets/${encodeURIComponent(currentSet.value.id)}/attempt`, {
            packId: requestPackId.value,
            method: 'PUT',
            body: { state: state.value },
          })
        } while (persistPending)
      } catch (error) {
        console.error('[mock-exam] persist failed', error)
      } finally {
        persistInFlight = false
        if (persistPending) persist()
      }
    })()
  }

  const calculateModuleScore = (skill: string): void => {
    const definition = currentSet.value.modules.find(module => mockModuleId(module) === skill)
    if (!definition) return
    const moduleState = state.value.modules[skill]!
    const responses = Object.values(moduleState.responses)

    if (definition.skill === 'reading' || definition.skill === 'listening') {
      // Correct answers become points per exercise, so half-point parts are not over-credited.
      const raw = definition.exercises.reduce((sum, exercise) => {
        const response = moduleState.responses[exercise.id]
        return response
          ? sum +
              objectiveExercisePoints(response.score ?? 0, response.total, exercise.maxRawPoints)
          : sum
      }, 0)
      moduleState.scoreRaw = clamp(raw, 0, definition.maxRawPoints)
      moduleState.scoreFinal = clamp(raw * definition.multiplier, 0, definition.maxFinalPoints)
      moduleState.grading = 'auto'
      return
    }

    const graded = responses.filter(response => typeof response.rawScore === 'number')
    const raw = graded.reduce((sum, response) => sum + (response.rawScore ?? 0), 0)
    const hasPending = definition.exercises.some(exercise => {
      const response = moduleState.responses[exercise.id]
      return !response || typeof response.rawScore !== 'number'
    })
    moduleState.scoreRaw = clamp(raw, 0, definition.maxRawPoints)
    moduleState.scoreFinal = clamp(raw * definition.multiplier, 0, definition.maxFinalPoints)
    const hasError = responses.some(
      response => response.error && typeof response.rawScore !== 'number'
    )
    moduleState.grading = hasError ? 'unavailable' : hasPending ? 'pending' : 'done'
  }

  const initialize = async (force = false): Promise<void> => {
    if (
      (!force && isInitialized.value && initializedSetId.value === currentSet.value.id) ||
      import.meta.server
    )
      return
    const setId = currentSet.value.id
    const packId = requestPackId.value
    const stillCurrent = () => setId === currentSet.value.id && packId === requestPackId.value
    try {
      const saved = await apiFetch<MockExamAttemptDto | null>(
        `/mock-exam/sets/${encodeURIComponent(currentSet.value.id)}/attempt`,
        { packId }
      )
      if (!stillCurrent()) return
      const raw = saved?.state
      if (raw && typeof raw === 'object') {
        const stored = raw as MockExamState
        const blank = createBlankMockExamState(currentSet.value)
        state.value = {
          ...blank,
          ...stored,
          modules: Object.fromEntries(
            currentSet.value.modules.map(definition => {
              const saved = stored.modules?.[mockModuleId(definition)]
              const done = Array.from({ length: definition.exercises.length }, (_, index) =>
                Boolean(saved?.done?.[index])
              )
              return [
                mockModuleId(definition),
                {
                  ...blank.modules[mockModuleId(definition)],
                  ...saved,
                  done,
                  // Timer expiry used to lock unfinished modules. Keep a lock only after
                  // every exercise in the module was actually submitted.
                  locked: Boolean(saved?.locked) && done.every(Boolean),
                  responses: saved?.responses ?? {},
                },
              ]
            })
          ) as Record<string, MockModuleState>,
          aiOverview: {
            ...blank.aiOverview,
            ...stored.aiOverview,
            ...(stored.aiOverview?.status === 'loading'
              ? { status: 'error' as const, error: 'AI overview generation was interrupted.' }
              : {}),
          },
        }
        const restoredIncompleteLock = currentSet.value.modules.some(definition => {
          const saved = stored.modules?.[mockModuleId(definition)]
          const moduleState = state.value.modules[mockModuleId(definition)]!
          return Boolean(saved?.locked) && !moduleState.locked
        })
        if (restoredIncompleteLock) persist()
      }
    } catch (error) {
      if (!stillCurrent()) return
      console.warn('[mock-exam] read failed', error)
      state.value = createBlankMockExamState(currentSet.value)
    }
    isInitialized.value = true
    initializedSetId.value = setId
  }

  const startExam = (): void => {
    if (!state.value.startedAt) state.value.startedAt = new Date().toISOString()
  }

  const startModule = (skill: string): void => {
    const definition = currentSet.value.modules.find(module => mockModuleId(module) === skill)
    const moduleState = state.value.modules[skill]!
    if (!definition || moduleState.locked) return
    startExam()
    if (!moduleState.endsAt) {
      moduleState.endsAt = new Date(Date.now() + definition.minutes * 60_000).toISOString()
    }
    persist()
  }

  const saveExerciseProgress = (
    skill: string,
    exerciseId: string,
    result: Omit<MockExerciseResult, 'exerciseId'>
  ): void => {
    const moduleState = state.value.modules[skill]!
    if (moduleState.locked) return
    moduleState.responses[exerciseId] = {
      ...moduleState.responses[exerciseId],
      ...result,
      exerciseId,
    }
    persist()
  }

  const completeExercise = (skill: string, index: number, result: MockExerciseResult): void => {
    const moduleState = state.value.modules[skill]!
    if (moduleState.locked || index < 0 || index >= moduleState.done.length) return
    moduleState.responses[result.exerciseId] = result
    moduleState.done[index] = true
    calculateModuleScore(skill)
    persist()
  }

  const updateExerciseGrade = (
    skill: 'writing' | 'speaking',
    exerciseId: string,
    rawScore: number | null,
    error: string | null = null,
    review: CriterionReview | null = null
  ): void => {
    const moduleState = state.value.modules[skill]!
    const current = moduleState.responses[exerciseId]
    if (!current) return
    moduleState.responses[exerciseId] = {
      ...current,
      rawScore,
      grading: rawScore === null ? (error ? 'unavailable' : 'pending') : 'done',
      error,
      ...(skill === 'writing' && review ? { writingReview: review as CriterionReview } : {}),
      ...(skill === 'speaking' && review ? { speakingReview: review } : {}),
    }
    calculateModuleScore(skill)
    persist()
  }

  const lockModule = (skill: string): void => {
    const moduleState = state.value.modules[skill]!
    if (moduleState.locked) return
    moduleState.locked = true
    moduleState.endsAt = null
    calculateModuleScore(skill)
    persist()
  }

  const setGrading = (skill: string, grading: MockGradingStatus): void => {
    state.value.modules[skill]!.grading = grading
    persist()
  }

  const finishExam = (): void => {
    if (
      !currentSet.value.modules.every(module => state.value.modules[mockModuleId(module)]!.locked)
    )
      return
    state.value.finished = true
    state.value.finishedAt = new Date().toISOString()
    persist()
  }

  const resetExam = (): void => {
    state.value = createBlankMockExamState(currentSet.value)
    if (import.meta.client) {
      void apiFetch(`/mock-exam/sets/${encodeURIComponent(currentSet.value.id)}/attempt`, {
        packId: requestPackId.value,
        method: 'DELETE',
      }).catch(() => undefined)
    }
  }

  const remainingSeconds = (skill: string): number => {
    const moduleState = state.value.modules[skill]!
    if (moduleState.locked) return 0
    if (!moduleState.endsAt) {
      return (
        (currentSet.value.modules.find(module => mockModuleId(module) === skill)?.minutes ?? 0) * 60
      )
    }
    return Math.max(0, Math.ceil((Date.parse(moduleState.endsAt) - Date.now()) / 1000))
  }

  const startOverview = (): void => {
    state.value.aiOverview = {
      status: 'loading',
      data: null,
      error: null,
      requestedAt: new Date().toISOString(),
      completedAt: null,
    }
    persist()
  }

  const completeOverview = (data: MockExamOverview): void => {
    state.value.aiOverview = {
      ...state.value.aiOverview,
      status: 'ready',
      data,
      error: null,
      completedAt: new Date().toISOString(),
    }
    persist()
  }

  const failOverview = (error: string): void => {
    state.value.aiOverview = {
      ...state.value.aiOverview,
      status: 'error',
      data: null,
      error,
      completedAt: null,
    }
    persist()
  }

  const allLocked = computed(() =>
    currentSet.value.modules.every(module => state.value.modules[mockModuleId(module)]!.locked)
  )
  const doneExerciseCount = computed(() =>
    currentSet.value.modules.reduce(
      (sum, module) => sum + state.value.modules[mockModuleId(module)]!.done.filter(Boolean).length,
      0
    )
  )
  const totalExerciseCount = computed(() =>
    currentSet.value.modules.reduce((sum, module) => sum + module.exercises.length, 0)
  )
  const overallPoints = computed(() =>
    currentSet.value.modules.reduce(
      (sum, module) => sum + (state.value.modules[mockModuleId(module)]!.scoreFinal ?? 0),
      0
    )
  )

  if (import.meta.client && !isInitialized.value) {
    onMounted(() => {
      void initialize()
    })
    watch([() => currentSet.value.id, () => requestPackId.value], () => {
      isInitialized.value = false
      initializedSetId.value = null
      state.value = createBlankMockExamState(currentSet.value)
      void initialize(true)
    })
  }

  return {
    // State
    state: readonly(state),
    isInitialized: readonly(isInitialized),
    allLocked,
    doneExerciseCount,
    totalExerciseCount,
    overallPoints,

    // Methods
    initialize,
    startExam,
    startModule,
    saveExerciseProgress,
    completeExercise,
    updateExerciseGrade,
    lockModule,
    setGrading,
    finishExam,
    resetExam,
    remainingSeconds,
    startOverview,
    completeOverview,
    failOverview,
  }
}
