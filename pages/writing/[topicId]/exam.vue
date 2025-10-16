<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="!topic" class="container mx-auto px-4 py-12">
      <div class="bg-white rounded-xl border p-6 text-center">
        <h2 class="text-xl font-semibold mb-2">Topic not found</h2>
        <p class="text-gray-600 mb-4">The requested writing topic does not exist.</p>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" @click="goBack">Back to Topics</button>
      </div>
    </div>

    <div v-else class="fixed inset-0 bg-gray-50 overflow-hidden">
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
            <span class="text-sm text-gray-600">{{ topic.topicType }} • A2 Level</span>
            <div class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Writing Mode
            </div>
          </div>
        </div>
      </div>

      <!-- Writing Session Content -->
      <div class="h-full overflow-y-auto" style="height: calc(100vh - 73px)">
        <WritingSession 
          :topic="topic"
          @exit="goBack"
          @complete="handleWritingComplete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { writingTopics } from '~/data/writing/exerciseTopics'
import type { WritingTopic } from '~/utils/types'
import WritingSession from '~/components/writing/WritingSession.vue'
import { useWritingReview } from '~/composables/useWritingReview'

useHead({
  title: 'Writing Exam',
})

const route = useRoute()
const topicId = computed(() => String(route.params.topicId || ''))
const topic = computed<WritingTopic | undefined>(() => writingTopics.find(t => t.id === topicId.value))

const { requestReview } = useWritingReview()

function goBack() {
  navigateTo('/writing')
}

async function handleWritingComplete(
  completedTopicId: string,
  content: string,
  wordCount: number,
  timeSpent: number
) {
  if (!topic.value) return
  // Trigger AI review request (mocked)
  await requestReview(topic.value, content)
}
</script>
