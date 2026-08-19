<template>
  <div class="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div
      v-if="!isInitialized"
      class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center"
    >
      <span
        class="loading loading-spinner loading-md text-primary"
        aria-label="Loading writing topic"
      />
      <p class="text-sm text-base-content/60 mt-3">Loading writing topic...</p>
    </div>

    <div
      v-else-if="!topic"
      class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center"
    >
      <p class="text-sm text-base-content/60 mb-3">Topic not found.</p>
      <NuxtLink to="/exercises?skill=writing" class="btn btn-primary btn-sm"
        >Back to exercises</NuxtLink
      >
    </div>

    <template v-else>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <NuxtLink
            to="/exercises?skill=writing"
            class="mt-1 w-9 h-9 rounded-full border border-base-300 hover:bg-base-200 grid place-items-center text-base-content/70 shrink-0"
            aria-label="Back to writing exercises"
          >
            <ArrowLeft :size="14" aria-hidden="true" />
          </NuxtLink>
          <div class="min-w-0">
            <div
              class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-base-content/50"
            >
              <PenLine :size="11" aria-hidden="true" />
              Writing practice · {{ topic.topicType }}
            </div>
            <h1 class="font-display text-[28px] font-bold leading-tight mt-1 truncate">
              {{ topic.title }}
            </h1>
            <div class="text-sm text-base-content/60 mt-1">
              Goethe {{ topic.difficulty }} · Teil {{ topic.testingPart || 2 }} ·
              {{ topic.wordCount.min }}–{{ topic.wordCount.max }} words
            </div>
          </div>
        </div>
        <span
          class="text-[11px] font-mono font-semibold px-2 py-1 rounded-full bg-base-200 shrink-0"
          >{{ topic.difficulty }}</span
        >
      </div>

      <WritingSession :topic="topic" @complete="handleWritingComplete" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, PenLine } from 'lucide-vue-next'
import { useWritingTopics } from '~/composables/useWritingTopics'
import type { WritingExercise } from '~/utils/types'
import WritingSession from '~/components/writing/WritingSession.vue'

const route = useRoute()
const { getTopicById, isInitialized } = useWritingTopics()
const topicId = computed(() => String(route.params['topicId'] || ''))
const topic = computed<WritingExercise | undefined>(() => getTopicById(topicId.value))

usePageMeta('Writing Exercise', 'Writing')
watchEffect(() => {
  if (topic.value) usePageMeta(topic.value.title, 'Writing')
})

useHead({
  title: computed(() => (topic.value ? `${topic.value.title} – Writing` : 'Writing Exercise')),
})

function handleWritingComplete(
  _topicId: string,
  _content: string,
  _wordCount: number,
  _timeSpent: number
) {
  // Progress is saved and the AI review is requested inside WritingSession.
}
</script>
