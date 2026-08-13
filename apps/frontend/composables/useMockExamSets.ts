import { goetheA2MockExamSet1, type MockExamSet } from '~/data/mockExam/goetheA2'

const STORAGE_KEY = 'exam-one:mock-exam:sets'

export const useMockExamSets = () => {
  const generatedSets = useState<MockExamSet[]>('mock-exam-generated-sets', () => [])
  const isInitialized = useState<boolean>('mock-exam-sets-initialized', () => false)

  const sets = computed(() => [goetheA2MockExamSet1, ...generatedSets.value])
  const nextSetNumber = computed(() => {
    const numbers = sets.value
      .map(set => Number(set.id.match(/-set-(\d+)$/)?.[1] ?? 0))
      .filter(Number.isFinite)
    return Math.max(1, ...numbers) + 1
  })

  const persist = (): void => {
    if (import.meta.server) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generatedSets.value))
    } catch (error) {
      console.error(`[${STORAGE_KEY}] write failed`, error)
    }
  }

  const initialize = (): void => {
    if (isInitialized.value || import.meta.server) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      generatedSets.value = raw ? (JSON.parse(raw) as MockExamSet[]) : []
    } catch (error) {
      console.warn(`[${STORAGE_KEY}] read failed`, error)
      generatedSets.value = []
    }
    isInitialized.value = true
  }

  const getSet = (id: string): MockExamSet | undefined => sets.value.find(set => set.id === id)

  const addSet = (set: MockExamSet): void => {
    generatedSets.value = [
      ...generatedSets.value.filter(existing => existing.id !== set.id),
      set,
    ].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    persist()
  }

  const deleteSet = async (id: string): Promise<void> => {
    const set = generatedSets.value.find(candidate => candidate.id === id)
    if (!set) return

    generatedSets.value = generatedSets.value.filter(candidate => candidate.id !== id)
    persist()

    if (import.meta.client) {
      try {
        localStorage.removeItem(`exam-one:mock-exam:${id}`)
      } catch {
        // Removing the generated set itself still succeeds when attempt cleanup fails.
      }

      const exerciseIds = set.content.listening
        .map(exercise => exercise.id)
        .filter((exerciseId): exerciseId is string => Boolean(exerciseId))
      if (exerciseIds.length > 0) {
        try {
          await $fetch('/api/tts/delete-listening-audio', {
            method: 'POST',
            body: { exerciseIds },
          })
        } catch (error) {
          console.warn('Generated listening audio cleanup failed', error)
        }
      }
    }
  }

  onMounted(initialize)

  return {
    // State
    sets,
    generatedSets: computed(() => generatedSets.value),
    isInitialized: readonly(isInitialized),
    nextSetNumber,

    // Methods
    initialize,
    getSet,
    addSet,
    deleteSet,
  }
}
