<template>
  <div class="fixed inset-0 bg-base-200 overflow-hidden">
    <!-- Header -->
    <div class="bg-base-100 border-b border-base-300 px-6 py-4">
      <div class="flex items-center justify-between">
        <button 
          class="btn btn-ghost btn-sm gap-2"
          @click="goBack"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Back to Topics
        </button>
        <div class="flex items-center space-x-4">
          <span class="text-sm opacity-70">{{ topic?.topicType || 'Topic' }} • A2 Level</span>
          <div class="badge badge-success">
            Review
          </div>
        </div>
      </div>
    </div>

    <!-- Review Content -->
    <div class="h-full overflow-y-auto" style="height: calc(100vh - 73px)">
      <div class="container mx-auto px-4 py-6 max-w-4xl">
        <WritingReview :topic-id="topicId" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWritingTopics } from '~/composables/useWritingTopics'
import type { WritingTopic } from '~/utils/types'
import WritingReview from '~/components/writing/WritingReview.vue'

useHead({
  title: 'Writing Review',
})

const route = useRoute()
const { getTopicById } = useWritingTopics()
const topicId = computed(() => String(route.params['topicId'] || ''))
const topic = computed<WritingTopic | undefined>(() => getTopicById(topicId.value))

function goBack() {
  navigateTo('/writing')
}
</script>
