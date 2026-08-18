import type { ListeningA2Exercise, ListeningExerciseAudioMap } from '~/utils/exercises/listening'
import type { ExerciseDto } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'
import { createSkillExercise, fetchSkillExercises } from '~/composables/usePracticeCatalog'
import { whenPracticeReady } from '~/composables/usePracticeImport'

const exercises = ref<ListeningA2Exercise[]>([])
const isInitialized = ref(false)
let hydratePromise: Promise<void> | null = null

export const useListeningExercises = () => {
  const hydrate = async (): Promise<void> => {
    if (import.meta.server) return
    if (isInitialized.value) return
    if (hydratePromise) return hydratePromise
    hydratePromise = (async () => {
      await whenPracticeReady()
      try {
        exercises.value = await fetchSkillExercises<ListeningA2Exercise>('LISTENING')
        isInitialized.value = true
      } catch (error) {
        console.error('Failed to load listening exercises from API:', error)
        exercises.value = []
        isInitialized.value = true
      } finally {
        hydratePromise = null
      }
    })()
    return hydratePromise
  }

  const getExercises = (): ListeningA2Exercise[] => exercises.value.filter(item => !item.examOnly)

  const getExerciseById = (id: string): ListeningA2Exercise | undefined =>
    exercises.value.find(item => item.id === id)

  const addExercises = async (items: ListeningA2Exercise[]): Promise<void> => {
    const unique = items.filter(item => !exercises.value.some(existing => existing.id === item.id))
    for (const item of unique) {
      if (!item.id) continue
      const saved = await createSkillExercise('LISTENING', { ...item, id: item.id })
      exercises.value = [...exercises.value, saved]
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
        method: 'PUT',
        body: { audio },
      })
      const payload = (row.payload ?? { ...current, audio }) as ListeningA2Exercise
      const updated = { ...payload, id: payload.id ?? id, audio }
      exercises.value = exercises.value.map(item => (item.id === id ? updated : item))
      return updated
    } catch (error) {
      console.error('Failed to update listening audio:', error)
      return undefined
    }
  }

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
