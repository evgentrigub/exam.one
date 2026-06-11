<template>
  <div class="max-w-[1240px] mx-auto p-6 space-y-4">

    <div v-if="!topic" class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center">
      <p class="text-sm text-base-content/60 mb-3">Topic not found.</p>
      <NuxtLink to="/exercises?skill=writing" class="btn btn-primary btn-sm">Back to exercises</NuxtLink>
    </div>

    <template v-else>
      <!-- Page header -->
      <div class="flex items-center gap-3 flex-wrap">
        <NuxtLink to="/exercises?skill=writing" class="btn btn-ghost btn-sm gap-1.5">
          <ArrowLeft :size="14" />
          Back
        </NuxtLink>
        <h1 class="text-lg font-semibold truncate">{{ topic.title }}</h1>
        <span class="level-pip">{{ topic.difficulty }}</span>
        <span class="level-pip capitalize">{{ topic.topicType }}</span>
      </div>

      <WritingSession :topic="topic" @complete="handleWritingComplete" />
    </template>

  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useWritingReview } from '~/composables/useWritingReview'
import type { WritingExercise } from '~/utils/types'
import WritingSession from '~/components/writing/WritingSession.vue'

const route = useRoute()
const { getTopicById } = useWritingTopics()
const topicId = computed(() => String(route.params['topicId'] || ''))
const topic = computed<WritingExercise | undefined>(() => getTopicById(topicId.value))

usePageMeta('Writing Exercise', 'Writing')
watchEffect(() => {
  if (topic.value) usePageMeta(topic.value.title, 'Writing')
})

useHead({ title: computed(() => topic.value ? `${topic.value.title} – Writing` : 'Writing Exercise') })

const { requestReview } = useWritingReview()

async function handleWritingComplete(content: string) {
  if (!topic.value) return
  await requestReview(topic.value, content)
}
</script>
