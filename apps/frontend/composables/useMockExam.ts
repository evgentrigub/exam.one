import type { MockExamSet } from '~/data/mockExam/goetheA2'
import type { SpeakingTranscripts } from '~/utils/exercises/speaking'
import type { SkillId } from '~/utils/labels'

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

export interface MockExamState {
  modules: Record<SkillId, MockModuleState>
  finished: boolean
  startedAt: string | null
  finishedAt: string | null
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
    const grading = definition.skill === 'reading' || definition.skill === 'listening'
      ? 'auto'
      : 'pending'
    modules[definition.skill] = blankModule(definition.exercises.length, grading)
  }
  return { modules, finished: false, startedAt: null, finishedAt: null }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export const useMockExam = (set: MockExamSet) => {
  const STORAGE_KEY = `exam-one:mock-exam:${set.id}`
  const state = ref<MockExamState>(createBlankMockExamState(set))
  const isInitialized = ref(false)

  const persist = (): void => {
    if (import.meta.server) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    } catch (error) {
      console.error(`[${STORAGE_KEY}] write failed`, error)
    }
  }

  const calculateModuleScore = (skill: SkillId): void => {
    const definition = set.modules.find(module => module.skill === skill)
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

  const initialize = (): void => {
    if (isInitialized.value || import.meta.server) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw) as MockExamState
        const blank = createBlankMockExamState(set)
        state.value = {
          ...blank,
          ...stored,
          modules: Object.fromEntries(set.modules.map(definition => {
            const saved = stored.modules?.[definition.skill]
            return [definition.skill, {
              ...blank.modules[definition.skill],
              ...saved,
              done: Array.from(
                { length: definition.exercises.length },
                (_, index) => Boolean(saved?.done?.[index]),
              ),
              responses: saved?.responses ?? {},
            }]
          })) as Record<SkillId, MockModuleState>,
        }
      }
    } catch (error) {
      console.warn(`[${STORAGE_KEY}] read failed`, error)
      state.value = createBlankMockExamState(set)
    }
    isInitialized.value = true

    for (const definition of set.modules) {
      const moduleState = state.value.modules[definition.skill]
      if (!moduleState.locked && moduleState.endsAt && Date.parse(moduleState.endsAt) <= Date.now()) {
        expireModule(definition.skill)
      }
    }
  }

  const startExam = (): void => {
    if (!state.value.startedAt) state.value.startedAt = new Date().toISOString()
    persist()
  }

  const startModule = (skill: SkillId): void => {
    const definition = set.modules.find(module => module.skill === skill)
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
    result: Omit<MockExerciseResult, 'exerciseId'>,
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

  const completeExercise = (
    skill: SkillId,
    index: number,
    result: MockExerciseResult,
  ): void => {
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
  ): void => {
    const moduleState = state.value.modules[skill]
    const current = moduleState.responses[exerciseId]
    if (!current) return
    moduleState.responses[exerciseId] = {
      ...current,
      rawScore,
      grading: rawScore === null ? 'pending' : 'done',
      error,
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
    if (!set.modules.every(module => state.value.modules[module.skill].locked)) return
    state.value.finished = true
    state.value.finishedAt = new Date().toISOString()
    persist()
  }

  const resetExam = (): void => {
    state.value = createBlankMockExamState(set)
    if (import.meta.client) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // The in-memory reset still succeeds when browser storage is unavailable.
      }
    }
  }

  const remainingSeconds = (skill: SkillId): number => {
    const moduleState = state.value.modules[skill]
    if (moduleState.locked) return 0
    if (!moduleState.endsAt) {
      return (set.modules.find(module => module.skill === skill)?.minutes ?? 0) * 60
    }
    return Math.max(0, Math.ceil((Date.parse(moduleState.endsAt) - Date.now()) / 1000))
  }

  const allLocked = computed(() =>
    set.modules.every(module => state.value.modules[module.skill].locked),
  )
  const doneExerciseCount = computed(() =>
    set.modules.reduce(
      (sum, module) => sum + state.value.modules[module.skill].done.filter(Boolean).length,
      0,
    ),
  )
  const totalExerciseCount = computed(() =>
    set.modules.reduce((sum, module) => sum + module.exercises.length, 0),
  )
  const overallPoints = computed(() =>
    set.modules.reduce(
      (sum, module) => sum + (state.value.modules[module.skill].scoreFinal ?? 0),
      0,
    ),
  )

  if (import.meta.client && !isInitialized.value) onMounted(initialize)

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
  }
}
