<template>
  <div class="max-w-[1180px] mx-auto px-8 py-8">
    <!-- Header: gate on isClient so SSR/hydration match (exercises hydrate from the API) -->
    <div v-if="isClient && exercise" class="flex items-start justify-between gap-4 mb-6">
      <div class="flex items-start gap-3">
        <NuxtLink
          to="/exercises?skill=listening"
          class="mt-1 w-9 h-9 rounded-full border border-base-300 hover:bg-base-200 grid place-items-center text-base-content/70"
        >
          <ArrowLeft :size="14" />
        </NuxtLink>
        <div>
          <div
            class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-base-content/50"
          >
            <Headphones :size="11" /> Listening practice · Teil {{ exercise.testingPart }}
          </div>
          <h1 class="font-display text-[28px] font-bold leading-tight mt-1">
            {{ exercise.title }}
          </h1>
          <div class="text-sm text-base-content/60 mt-1">{{ subtitle }}</div>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-[11px] font-mono font-semibold px-2 py-1 rounded-full bg-base-200">{{
          exercise.difficulty
        }}</span>
      </div>
    </div>

    <ClientOnly>
      <ListeningSession v-if="exercise" :exercise="exercise" @finish="goBack" />
      <template #fallback>
        <div class="rounded-box h-72 skel" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Headphones } from 'lucide-vue-next'
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
