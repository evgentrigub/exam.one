<template>
  <div class="min-h-screen bg-base-200">
    <div v-if="!topic" class="container mx-auto px-4 py-12">
      <div class="card bg-base-100 shadow">
        <div class="card-body text-center">
          <h2 class="card-title mx-auto">Topic not found</h2>
          <p>The requested writing topic does not exist.</p>
          <div class="card-actions justify-center">
            <button class="btn btn-primary" @click="goBack">Back to Topics</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="fixed inset-0 bg-base-200 overflow-hidden">
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
            <span class="text-sm opacity-70">{{ topic.topicType }} • {{ topic.difficulty }}</span>
            <div class="badge badge-secondary">
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
import { useWritingTopics } from '~/composables/useWritingTopics'
import type { WritingTopic } from '~/utils/types'
import WritingSession from '~/components/writing/WritingSession.vue'
import { useWritingReview } from '~/composables/useWritingReview'

useHead({
  title: 'Writing Exam',
})

const route = useRoute()
const { getTopicById } = useWritingTopics()
const topicId = computed(() => String(route.params['topicId'] || ''))
const topic = computed<WritingTopic | undefined>(() => getTopicById(topicId.value))

const { requestReview } = useWritingReview()

function goBack() {
  navigateTo('/writing')
}

async function handleWritingComplete(
  content: string
) {
  if (!topic.value) return
  // Trigger AI review request (mocked)
  await requestReview(topic.value, content)
}
</script>
