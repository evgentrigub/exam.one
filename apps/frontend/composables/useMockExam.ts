import type { MockExamSet } from '~/data/mockExam/goetheA2'
import type { MockExamOverview } from '~/data/mockExam/reviewMockExamA2'
import type { SpeakingReviewData, SpeakingTranscripts } from '~/utils/exercises/speaking'
import type { SkillId } from '~/utils/labels'
import type { AiReviewDataA2 } from '~/utils/types'

export type MockGradingStatus = 'auto' | 'pending' | 'done' | 'unavailable'

export interface MockExerciseResult {
  exerciseId: string
  answers?: Record<string, number | undefined>
  score?: number
  total?: number
  content?: string
  wordCount?: number
  transcripts?: SpeakingTranscripts
  rawScore?: number | null
  grading?: MockGradingStatus
  error?: string | null
  writingReview?: AiReviewDataA2
  speakingReview?: SpeakingReviewData
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
  modules: Record<SkillId, MockModuleState>
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
  const modules = {} as Record<SkillId, MockModuleState>
  for (const definition of set.modules) {
    const grading =
      definition.skill === 'reading' || definition.skill === 'listening' ? 'auto' : 'pending'
    modules[definition.skill] = blankModule(definition.exercises.length, grading)
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
  const currentSet = computed(() => toValue(setSource))
  const storageKey = computed(() => `exam-one:mock-exam:${currentSet.value.id}`)
  const state = ref<MockExamState>(createBlankMockExamState(currentSet.value))
  const isInitialized = ref(false)
  const initializedSetId = ref<string | null>(null)

  const persist = (): void => {
    if (import.meta.server) return
    try {
      localStorage.setItem(storageKey.value, JSON.stringify(state.value))
    } catch (error) {
      console.error(`[${storageKey.value}] write failed`, error)
    }
  }

  const calculateModuleScore = (skill: SkillId): void => {
    const definition = currentSet.value.modules.find(module => module.skill === skill)
    if (!definition) return
    const moduleState = state.value.modules[skill]
    const responses = Object.values(moduleState.responses)

    if (skill === 'reading' || skill === 'listening') {
      const raw = responses.reduce((sum, response) => sum + (response.score ?? 0), 0)
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
    moduleState.grading = hasPending ? 'pending' : 'done'
  }

  const expireModule = (skill: SkillId): void => {
    const moduleState = state.value.modules[skill]
    if (moduleState.locked) return
    moduleState.locked = true
    moduleState.endsAt = null
    calculateModuleScore(skill)
    persist()
  }

  const initialize = (force = false): void => {
    if (
      (!force && isInitialized.value && initializedSetId.value === currentSet.value.id) ||
      import.meta.server
    )
      return
    try {
      const raw = localStorage.getItem(storageKey.value)
      if (raw) {
        const stored = JSON.parse(raw) as MockExamState
        const blank = createBlankMockExamState(currentSet.value)
        state.value = {
          ...blank,
          ...stored,
          modules: Object.fromEntries(
            currentSet.value.modules.map(definition => {
              const saved = stored.modules?.[definition.skill]
              return [
                definition.skill,
                {
                  ...blank.modules[definition.skill],
                  ...saved,
                  done: Array.from({ length: definition.exercises.length }, (_, index) =>
                    Boolean(saved?.done?.[index])
                  ),
                  responses: saved?.responses ?? {},
                },
              ]
            })
          ) as Record<SkillId, MockModuleState>,
          aiOverview: {
            ...blank.aiOverview,
            ...stored.aiOverview,
            ...(stored.aiOverview?.status === 'loading'
              ? { status: 'error' as const, error: 'AI overview generation was interrupted.' }
              : {}),
          },
        }
      }
    } catch (error) {
      console.warn(`[${storageKey.value}] read failed`, error)
      state.value = createBlankMockExamState(currentSet.value)
    }
    isInitialized.value = true
    initializedSetId.value = currentSet.value.id

    for (const definition of currentSet.value.modules) {
      const moduleState = state.value.modules[definition.skill]
      if (
        !moduleState.locked &&
        moduleState.endsAt &&
        Date.parse(moduleState.endsAt) <= Date.now()
      ) {
        expireModule(definition.skill)
      }
    }
  }

  const startExam = (): void => {
    if (!state.value.startedAt) state.value.startedAt = new Date().toISOString()
    persist()
  }

  const startModule = (skill: SkillId): void => {
    const definition = currentSet.value.modules.find(module => module.skill === skill)
    const moduleState = state.value.modules[skill]
    if (!definition || moduleState.locked) return
    startExam()
    if (!moduleState.endsAt) {
      moduleState.endsAt = new Date(Date.now() + definition.minutes * 60_000).toISOString()
    }
    persist()
  }

  const saveExerciseProgress = (
    skill: SkillId,
    exerciseId: string,
    result: Omit<MockExerciseResult, 'exerciseId'>
  ): void => {
    const moduleState = state.value.modules[skill]
    if (moduleState.locked) return
    moduleState.responses[exerciseId] = {
      ...moduleState.responses[exerciseId],
      ...result,
      exerciseId,
    }
    persist()
  }

  const completeExercise = (skill: SkillId, index: number, result: MockExerciseResult): void => {
    const moduleState = state.value.modules[skill]
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
    review: AiReviewDataA2 | SpeakingReviewData | null = null
  ): void => {
    const moduleState = state.value.modules[skill]
    const current = moduleState.responses[exerciseId]
    if (!current) return
    moduleState.responses[exerciseId] = {
      ...current,
      rawScore,
      grading: rawScore === null ? 'pending' : 'done',
      error,
      ...(skill === 'writing' && review ? { writingReview: review as AiReviewDataA2 } : {}),
      ...(skill === 'speaking' && review ? { speakingReview: review as SpeakingReviewData } : {}),
    }
    calculateModuleScore(skill)
    persist()
  }

  const lockModule = (skill: SkillId): void => {
    const moduleState = state.value.modules[skill]
    if (moduleState.locked) return
    moduleState.locked = true
    moduleState.endsAt = null
    calculateModuleScore(skill)
    persist()
  }

  const setGrading = (skill: SkillId, grading: MockGradingStatus): void => {
    state.value.modules[skill].grading = grading
    persist()
  }

  const finishExam = (): void => {
    if (!currentSet.value.modules.every(module => state.value.modules[module.skill].locked)) return
    state.value.finished = true
    state.value.finishedAt = new Date().toISOString()
    persist()
  }

  const resetExam = (): void => {
    state.value = createBlankMockExamState(currentSet.value)
    if (import.meta.client) {
      try {
        localStorage.removeItem(storageKey.value)
      } catch {
        // The in-memory reset still succeeds when browser storage is unavailable.
      }
    }
  }

  const remainingSeconds = (skill: SkillId): number => {
    const moduleState = state.value.modules[skill]
    if (moduleState.locked) return 0
    if (!moduleState.endsAt) {
      return (currentSet.value.modules.find(module => module.skill === skill)?.minutes ?? 0) * 60
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
    currentSet.value.modules.every(module => state.value.modules[module.skill].locked)
  )
  const doneExerciseCount = computed(() =>
    currentSet.value.modules.reduce(
      (sum, module) => sum + state.value.modules[module.skill].done.filter(Boolean).length,
      0
    )
  )
  const totalExerciseCount = computed(() =>
    currentSet.value.modules.reduce((sum, module) => sum + module.exercises.length, 0)
  )
  const overallPoints = computed(() =>
    currentSet.value.modules.reduce(
      (sum, module) => sum + (state.value.modules[module.skill].scoreFinal ?? 0),
      0
    )
  )

  if (import.meta.client && !isInitialized.value) {
    onMounted(() => initialize())
    watch(
      () => currentSet.value.id,
      () => {
        state.value = createBlankMockExamState(currentSet.value)
        initialize(true)
      }
    )
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
    expireModule,
    setGrading,
    finishExam,
    resetExam,
    remainingSeconds,
    startOverview,
    completeOverview,
    failOverview,
  }
}
