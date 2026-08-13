<template>
  <div class="max-w-[1100px] mx-auto p-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-5 flex-wrap">
      <NuxtLink to="/exercises?skill=speaking" class="btn btn-ghost btn-sm gap-1.5">
        <ArrowLeft :size="14" />
        Back
      </NuxtLink>
      <h1 class="text-lg font-semibold truncate">{{ topic?.theme }}</h1>
      <span v-if="topic" class="level-pip">{{ topic.difficulty }}</span>
      <span v-if="topic" class="level-pip">Teil {{ topic.testingPart }}</span>
    </div>

    <ClientOnly>
      <SpeakingSession v-if="topic" :topic="topic" @finish="goBack" />
      <template #fallback>
        <div class="rounded-box h-72 skel" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import { useSpeakingExercises } from '~/composables/useSpeakingExercises'
import SpeakingSession from '~/components/speaking/SpeakingSession.vue'

usePageMeta('Speaking Exercise', 'Speaking')

const route = useRoute()
const router = useRouter()
const { getTopicById } = useSpeakingExercises()

const topicId = computed(() => String(route.params['topicId'] || ''))
const topic = computed<SpeakingA2Topic | null>(() => getTopicById(topicId.value) || null)

watchEffect(() => {
  if (topic.value) usePageMeta(topic.value.theme, 'Speaking')
})

function goBack() {
  router.push('/exercises?skill=speaking')
}

useHead({ title: computed(() => (topic.value ? `${topic.value.theme} – Speaking` : 'Speaking')) })
definePageMeta({ preload: false })
</script>
