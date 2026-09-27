import { onPackReset, packEpoch } from '~/utils/packScope'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import { createSkillExercise, fetchSkillExercises } from '~/composables/usePracticeCatalog'

const topics = ref<SpeakingA2Topic[]>([])
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
      const loaded = await fetchSkillExercises<SpeakingA2Topic>('SPEAKING')
      if (epoch !== packEpoch()) return
      topics.value = loaded
      isInitialized.value = true
    } catch (error) {
      if (epoch !== packEpoch()) return
      console.error('Failed to load speaking topics from API:', error)
      topics.value = []
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
  topics.value = []
  isInitialized.value = false
  hydratePromise = null
  if (import.meta.client && requested) void hydrate()
})

export const useSpeakingExercises = () => {
  const requestPackId = useSettingsStore().packId
  const requestEpoch = packEpoch()

  const getTopics = (): SpeakingA2Topic[] => topics.value.filter(topic => !topic.examOnly)

  const getTopicById = (id: string): SpeakingA2Topic | undefined =>
    topics.value.find(topic => topic.id === id)

  const addTopics = async (items: SpeakingA2Topic[]): Promise<void> => {
    const unique = items.filter(item => !topics.value.some(topic => topic.id === item.id))
    for (const topic of unique) {
      const saved = await createSkillExercise('SPEAKING', topic, requestPackId)
      if (requestEpoch === packEpoch()) topics.value = [...topics.value, saved]
    }
  }

  if (import.meta.client) requested = true
  if (import.meta.client && !isInitialized.value) {
    onMounted(() => {
      void hydrate()
    })
  }

  return {
    topics: computed(() => topics.value.filter(topic => !topic.examOnly)),
    isInitialized: readonly(isInitialized),
    getTopics,
    getTopicById,
    addTopics,
    hydrate,
  }
}
