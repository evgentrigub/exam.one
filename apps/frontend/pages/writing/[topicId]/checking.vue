<template>
  <div class="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div v-if="!isInitialized" class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center">
      <span class="loading loading-spinner loading-md text-primary" aria-label="Loading writing review" />
      <p class="text-sm text-base-content/60 mt-3">Loading writing review...</p>
    </div>

    <template v-else>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <button
            class="mt-1 w-9 h-9 rounded-full border border-base-300 hover:bg-base-200 grid place-items-center text-base-content/70 shrink-0"
            type="button"
            aria-label="Back to writing exercises"
            @click="goBack"
          >
            <ArrowLeft :size="14" aria-hidden="true" />
          </button>
          <div class="min-w-0">
            <div class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-base-content/50">
              <PenLine :size="11" aria-hidden="true" />
              Writing review · {{ topic?.topicType || 'Topic' }}
            </div>
            <h1 class="font-display text-[28px] font-bold leading-tight mt-1 truncate">{{ topic?.title || 'Writing Review' }}</h1>
            <div class="text-sm text-base-content/60 mt-1">Review, submitted answer, and task reference</div>
          </div>
        </div>
        <div class="badge badge-success shrink-0">Review</div>
      </div>

      <WritingReview :topic-id="topicId" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, PenLine } from 'lucide-vue-next'
import { useWritingTopics } from '~/composables/useWritingTopics'
import type { WritingExercise } from '~/utils/types'
import WritingReview from '~/components/writing/WritingReview.vue'

useHead({
  title: 'Writing Review',
})

const route = useRoute()
const { getTopicById, isInitialized } = useWritingTopics()
const topicId = computed(() => String(route.params['topicId'] || ''))
const topic = computed<WritingExercise | undefined>(() => getTopicById(topicId.value))

function goBack() {
  navigateTo('/exercises?skill=writing')
}
</script>
