<template>
  <div class="max-w-[1180px] mx-auto px-8 py-8">
    <ExerciseHeader
      v-if="isClient && exercise"
      skill="listening"
      :type="`Teil ${exercise.testingPart}`"
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

usePageMeta('Listening Exercise', 'Listening')

const route = useRoute()
const router = useRouter()
const { getExerciseById } = useListeningExercises()

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
    e.testingPart === 1 || e.testingPart === 3 ? (e.items?.length ?? 0) : (e.questions?.length ?? 0)
  const partType: Record<number, string> = {
    1: 'Short messages',
    2: 'Matching conversation',
    3: 'Short dialogues',
    4: 'Interview · Ja/Nein',
  }
  return `${partType[e.testingPart] ?? 'Listening'} · ${qCount} questions`
})

watchEffect(() => {
  if (exercise.value) usePageMeta(exercise.value.title, 'Listening')
})

function goBack() {
  router.push('/exercises?skill=listening')
}

useHead({
  title: computed(() => (exercise.value ? `${exercise.value.title} – Listening` : 'Listening')),
})
definePageMeta({ preload: false })
</script>
