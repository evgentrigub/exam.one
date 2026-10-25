<template>
  <div class="max-w-[1180px] mx-auto px-8 py-8">
    <ExerciseHeader
      v-if="isClient && exercise"
      skill="listening"
      :type="labelFor('listening', exercise.testingPart)"
      :title="exercise.title"
      :subtitle="subtitle"
      :level="exercise.difficulty"
      to="/exercises?skill=listening"
      :back-label="$t('exercisesUi.skillPractice', { skill: $t('skill.listening') })"
    />

    <ClientOnly>
      <ListeningSession v-if="exercise" :exercise="exercise" @finish="goBack" />
      <template #fallback>
        <div class="rounded-box h-72 skel" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import { useListeningExercises } from '~/composables/useListeningExercises'
import ListeningSession from '~/components/listening/ListeningSession.vue'

usePageMeta('pageMeta.listeningExerciseTitle', 'skill.listening')

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getExerciseById } = useListeningExercises()
const { labelFor, partsFor } = useActivePack()

const isClient = ref(false)
onMounted(() => {
  isClient.value = true
})

const exerciseId = computed(() => String(route.params['exerciseId'] || ''))
const exercise = computed<ListeningA2Exercise | null>(
  () => getExerciseById(exerciseId.value) || null
)

const subtitle = computed(() => {
  if (!exercise.value) return ''
  const e = exercise.value
  const qCount =
    'items' in e ? (e.items?.length ?? 0) : 'questions' in e ? (e.questions?.length ?? 0) : 0
  const part = partsFor('listening').find(item => item.n === e.testingPart)
  return `${part?.practiceSubtitle ?? t('skill.listening')} · ${t('pages.common.questionCount', qCount)}`
})

watchEffect(() => {
  if (exercise.value) usePageMeta(exercise.value.title, 'skill.listening')
})

function goBack() {
  router.push('/exercises?skill=listening')
}

useHead({
  title: () =>
    exercise.value
      ? `${exercise.value.title} – ${t('skill.listening')}`
      : t('pageMeta.listeningExerciseTitle'),
})
definePageMeta({ preload: false })
</script>
