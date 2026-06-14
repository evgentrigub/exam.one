<template>
  <div class="max-w-[920px] mx-auto p-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-5 flex-wrap">
      <NuxtLink to="/exercises?skill=listening" class="btn btn-ghost btn-sm gap-1.5">
        <ArrowLeft :size="14" />
        Back
      </NuxtLink>
      <h1 class="text-lg font-semibold truncate">{{ exercise?.title }}</h1>
      <span v-if="exercise" class="level-pip">{{ exercise.difficulty }}</span>
      <span v-if="exercise" class="level-pip">Teil {{ exercise.testingPart }}</span>
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
import { ArrowLeft } from 'lucide-vue-next'
import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import { useListeningExercises } from '~/composables/useListeningExercises'
import ListeningSession from '~/components/listening/ListeningSession.vue'

usePageMeta('Listening Exercise', 'Listening')

const route = useRoute()
const router = useRouter()
const { getExerciseById } = useListeningExercises()

const exerciseId = computed(() => String(route.params['exerciseId'] || ''))
const exercise = computed<ListeningA2Exercise | null>(() => getExerciseById(exerciseId.value) || null)

watchEffect(() => {
  if (exercise.value) usePageMeta(exercise.value.title, 'Listening')
})

function goBack() {
  router.push('/exercises?skill=listening')
}

useHead({ title: computed(() => exercise.value ? `${exercise.value.title} – Listening` : 'Listening') })
definePageMeta({ preload: false })
</script>
