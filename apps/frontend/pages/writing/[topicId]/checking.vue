<template>
  <div class="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div
      v-if="!isInitialized"
      class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center"
    >
      <span
        class="loading loading-spinner loading-md text-primary"
        aria-label="Loading writing review"
      />
      <p class="text-sm text-base-content/60 mt-3">Loading writing review...</p>
    </div>

    <template v-else>
      <ExerciseHeader
        skill="writing"
        :type="topic?.topicType || 'Topic'"
        :title="topic?.title || 'Writing Review'"
        subtitle="Review, submitted answer, and task reference"
        @back="goBack"
      >
        <template #aside>
          <div class="badge badge-success shrink-0">Review</div>
        </template>
      </ExerciseHeader>

      <WritingReview :topic-id="topicId" />
    </template>
  </div>
</template>

<script setup lang="ts">
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
