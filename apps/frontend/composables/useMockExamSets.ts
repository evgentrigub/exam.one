import type { MockExamSet } from '~/data/mockExam/goetheA2'
import type { MockExamSetDto, MockExamSetSummaryDto } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'
import { whenPracticeReady } from '~/composables/usePracticeImport'

const generatedSets = useState<MockExamSet[]>('mock-exam-generated-sets', () => [])
const seedSet = useState<MockExamSet | null>('mock-exam-seed-set', () => null)
const isInitialized = useState<boolean>('mock-exam-sets-initialized', () => false)
let hydratePromise: Promise<void> | null = null

function toSet(dto: MockExamSetDto): MockExamSet {
  return {
    id: dto.externalId,
    examId: dto.examId,
    level: dto.level,
    title: dto.title,
    generated: dto.generated,
    createdAt: dto.createdAt,
    modules: dto.modules as MockExamSet['modules'],
    content: dto.content as MockExamSet['content'],
  }
}

export const useMockExamSets = () => {
  const sets = computed(() => {
    const bundled = seedSet.value ? [seedSet.value] : []
    return [...bundled, ...generatedSets.value]
  })
  const nextSetNumber = computed(() => {
    const numbers = sets.value
      .map(set => Number(set.id.match(/-set-(\d+)$/)?.[1] ?? 0))
      .filter(Number.isFinite)
    return Math.max(1, ...numbers) + 1
  })

  const hydrate = async (): Promise<void> => {
    if (import.meta.server || isInitialized.value) return
    if (hydratePromise) return hydratePromise
    hydratePromise = (async () => {
      await whenPracticeReady()
      try {
        const summaries = await apiFetch<MockExamSetSummaryDto[]>('/mock-exam/sets')
        const full = await Promise.all(
          summaries.map(item =>
            apiFetch<MockExamSetDto>(`/mock-exam/sets/${encodeURIComponent(item.externalId)}`)
          )
        )
        const mapped = full.map(toSet)
        seedSet.value = mapped.find(set => !set.generated) ?? null
        generatedSets.value = mapped
          .filter(set => set.generated)
          .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
        isInitialized.value = true
      } catch (error) {
        console.error('Failed to load mock exam sets', error)
        isInitialized.value = true
      } finally {
        hydratePromise = null
      }
    })()
    return hydratePromise
  }

  const getSet = (id: string): MockExamSet | undefined => sets.value.find(set => set.id === id)

  const addSet = async (set: MockExamSet): Promise<void> => {
    const saved = await apiFetch<MockExamSetDto>('/mock-exam/sets', {
      method: 'POST',
      body: { set },
    })
    const mapped = toSet(saved)
    generatedSets.value = [
      ...generatedSets.value.filter(existing => existing.id !== mapped.id),
      mapped,
    ].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
  }

  const deleteSet = async (id: string): Promise<void> => {
    const data = await apiFetch<{ deleted: true; listeningExerciseIds: string[] }>(
      `/mock-exam/sets/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    )
    generatedSets.value = generatedSets.value.filter(candidate => candidate.id !== id)
    try {
      await apiFetch(`/mock-exam/sets/${encodeURIComponent(id)}/attempt`, { method: 'DELETE' })
    } catch {
      // Attempt cleanup is best-effort.
    }
    if (data.listeningExerciseIds.length > 0) {
      try {
        await $fetch('/api/tts/delete-listening-audio', {
          method: 'POST',
          body: { exerciseIds: data.listeningExerciseIds },
        })
      } catch (error) {
        console.warn('Generated listening audio cleanup failed', error)
      }
    }
  }

  onMounted(() => {
    void hydrate()
  })

  return {
    sets,
    generatedSets: computed(() => generatedSets.value),
    isInitialized: readonly(isInitialized),
    nextSetNumber,
    initialize: hydrate,
    hydrate,
    getSet,
    addSet,
    deleteSet,
  }
}
