import { onPackReset, packEpoch } from '~/utils/packScope'
import type { ListeningA2Exercise, ListeningExerciseAudioMap } from '~/utils/exercises/listening'
import type { ExerciseDto } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'
import { createSkillExercise, fetchSkillExercises } from '~/composables/usePracticeCatalog'

const exercises = ref<ListeningA2Exercise[]>([])
const isInitialized = ref(false)
let hydratePromise: Promise<void> | null = null
/** Set once a screen on the client has asked for this catalog, so a pack switch refills it. */
let requested = false

const hydrate = async (): Promise<void> => {
  if (import.meta.server) return
  if (isInitialized.value) return
  if (hydratePromise) return hydratePromise
  const epoch = packEpoch()
  hydratePromise = (async () => {
    try {
      const loaded = await fetchSkillExercises<ListeningA2Exercise>('LISTENING')
      if (epoch !== packEpoch()) return
      exercises.value = loaded
      isInitialized.value = true
    } catch (error) {
      if (epoch !== packEpoch()) return
      console.error('Failed to load listening exercises from API:', error)
      exercises.value = []
      isInitialized.value = true
    } finally {
      if (epoch === packEpoch()) hydratePromise = null
    }
  })()
  return hydratePromise
}

// Settings hydrate after the first screens mount, so a user whose pack is not the default
// switches packs on every page load. Refetch for the screens already showing this catalog.
onPackReset(() => {
  exercises.value = []
  isInitialized.value = false
  hydratePromise = null
  if (import.meta.client && requested) void hydrate()
})

export const useListeningExercises = () => {
  const requestPackId = useSettingsStore().packId
  const requestEpoch = packEpoch()

  const getExercises = (): ListeningA2Exercise[] => exercises.value.filter(item => !item.examOnly)

  const getExerciseById = (id: string): ListeningA2Exercise | undefined =>
    exercises.value.find(item => item.id === id)

  const addExercises = async (items: ListeningA2Exercise[]): Promise<void> => {
    const unique = items.filter(item => !exercises.value.some(existing => existing.id === item.id))
    for (const item of unique) {
      if (!item.id) continue
      const saved = await createSkillExercise('LISTENING', { ...item, id: item.id }, requestPackId)
      if (requestEpoch === packEpoch()) exercises.value = [...exercises.value, saved]
    }
  }

  const updateExerciseAudio = async (
    id: string,
    audio: ListeningExerciseAudioMap
  ): Promise<ListeningA2Exercise | undefined> => {
    const current = exercises.value.find(item => item.id === id)
    if (!current) return undefined
    try {
      const row = await apiFetch<ExerciseDto>(`/exercises/${encodeURIComponent(id)}/audio`, {
        packId: requestPackId,
        method: 'PUT',
        body: { audio },
      })
      const payload = (row.payload ?? { ...current, audio }) as ListeningA2Exercise
      const updated = { ...payload, id: payload.id ?? id, audio }
      if (requestEpoch === packEpoch()) exercises.value = exercises.value.map(item => (item.id === id ? updated : item))
      return updated
    } catch (error) {
      console.error('Failed to update listening audio:', error)
      return undefined
    }
  }

  if (import.meta.client) requested = true
  if (import.meta.client && !isInitialized.value) {
    void hydrate()
  }

  return {
    exercises: computed(() => exercises.value.filter(item => !item.examOnly)),
    isInitialized: readonly(isInitialized),
    getExercises,
    getExerciseById,
    addExercises,
    updateExerciseAudio,
    hydrate,
  }
}
