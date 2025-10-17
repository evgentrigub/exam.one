<template>
  <div class="fixed inset-0 bg-gray-50 overflow-hidden">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <button 
          class="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium transition-colors"
          @click="goBack"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Back to Topics
        </button>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{ topic?.topicType || 'Topic' }} • A2 Level</span>
          <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
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
import { writingTopics } from '~/data/writing/exerciseTopics'
import type { WritingTopic } from '~/utils/types'
import WritingReview from '~/components/writing/WritingReview.vue'

useHead({
  title: 'Writing Review',
})

const route = useRoute()
const topicId = computed(() => String(route.params['topicId'] || ''))
const topic = computed<WritingTopic | undefined>(() => writingTopics.find(t => t.id === topicId.value))

function goBack() {
  navigateTo('/writing')
}
</script>
