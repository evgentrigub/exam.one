import type { MockExamSet } from '~/data/mockExam/goetheA2'
import type { MockExamSetDto, MockExamSetSummaryDto } from '@exam-one/contracts'
import { packEpoch, onPackReset } from '~/utils/packScope'
import { apiFetch } from '~/composables/useApi'

const generatedSets = useState<MockExamSet[]>('mock-exam-generated-sets', () => [])
const seedSet = useState<MockExamSet | null>('mock-exam-seed-set', () => null)
const isInitialized = useState<boolean>('mock-exam-sets-initialized', () => false)
let hydratePromise: Promise<void> | null = null

onPackReset(() => {
  generatedSets.value = []
  seedSet.value = null
  isInitialized.value = false
  hydratePromise = null
})

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
    ...(dto.rules ? { rules: dto.rules as NonNullable<MockExamSet['rules']> } : {}),
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
    const epoch = packEpoch()
    const packId = useSettingsStore().packId
    hydratePromise = (async () => {
      try {
        const summaries = await apiFetch<MockExamSetSummaryDto[]>('/mock-exam/sets', { packId })
        const full = await Promise.all(
          summaries.map(item =>
            apiFetch<MockExamSetDto>(`/mock-exam/sets/${encodeURIComponent(item.externalId)}`, {
              packId,
            })
          )
        )
        if (epoch !== packEpoch()) return
        const mapped = full.map(toSet)
        seedSet.value = mapped.find(set => !set.generated) ?? null
        generatedSets.value = mapped
          .filter(set => set.generated)
          .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
        isInitialized.value = true
      } catch (error) {
        if (epoch !== packEpoch()) return
        console.error('Failed to load mock exam sets', error)
        isInitialized.value = true
      } finally {
        if (epoch === packEpoch()) hydratePromise = null
      }
    })()
    return hydratePromise
  }

  const reload = async (): Promise<void> => {
    isInitialized.value = false
    await hydrate()
  }

  const getSet = (id: string): MockExamSet | undefined => sets.value.find(set => set.id === id)

  const addSet = async (set: MockExamSet, packId = useSettingsStore().packId): Promise<void> => {
    const epoch = packEpoch()
    const saved = await apiFetch<MockExamSetDto>('/mock-exam/sets', {
      method: 'POST',
      packId,
      body: { set },
    })
    if (epoch !== packEpoch() || packId !== useSettingsStore().packId) return
    const mapped = toSet(saved)
    generatedSets.value = [
      ...generatedSets.value.filter(existing => existing.id !== mapped.id),
      mapped,
    ].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
  }

  const deleteSet = async (id: string): Promise<void> => {
    const epoch = packEpoch()
    const packId = useSettingsStore().packId
    const data = await apiFetch<{ deleted: true; listeningExerciseIds: string[] }>(
      `/mock-exam/sets/${encodeURIComponent(id)}`,
      { method: 'DELETE', packId }
    )
    if (epoch === packEpoch())
      generatedSets.value = generatedSets.value.filter(candidate => candidate.id !== id)
    try {
      await apiFetch(`/mock-exam/sets/${encodeURIComponent(id)}/attempt`, {
        method: 'DELETE',
        packId,
      })
    } catch {
      // Attempt cleanup is best-effort.
    }
    if (data.listeningExerciseIds.length > 0) {
      try {
        await aiFetch('/tts/delete-listening-audio', {
          packId,
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
    reload,
    getSet,
    addSet,
    deleteSet,
  }
}
