<template>
  <div class="group bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-[360px]">
    <!-- Header with badges -->
    <div class="px-4 pt-4">
      <div class="flex items-center justify-between mb-3">
        <!-- Time indicator always on left -->
        <div class="flex items-center text-xs text-gray-500">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ topic.estimatedTime }} Min
        </div>
        
        <!-- Completion or topic type badge always on right -->
        <span 
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          :class="topicCompleted ? 'bg-green-100 text-green-800' : topicTypeStyles[topic.topicType]"
        >
          <!-- Completion check icon for completed topics -->
          <svg v-if="topicCompleted" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ topicCompleted ? 'Completed' : getTopicTypeLabel(topic.topicType) }}
        </span>
      </div>
    </div>

    <!-- Content - flexible to fill space -->
    <div class="px-4 flex-1 flex flex-col">
      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {{ topic.title }}
      </h3>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-3 line-clamp-2">
        {{ topic.description }}
      </p>

      <!-- Metadata -->
      <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div class="flex items-center space-x-3">
          <span>{{ topic.wordCount.min }}-{{ topic.wordCount.max }} Wörter</span>
          <span>•</span>
          <span>{{ topic.difficulty }}</span>
        </div>
        <div class="flex flex-wrap gap-1 ml-auto">
          <span 
            v-for="category in displayCategories" 
            :key="category"
            class="px-2 py-1 bg-gray-100 rounded text-xs whitespace-nowrap"
          >
            {{ category }}
          </span>
        </div>
      </div>

      <!-- Writing prompt preview -->
      <div class="mb-4 p-3 bg-blue-50 rounded-lg flex-1">
        <div class="flex items-start">
          <svg class="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
          <p class="text-sm text-blue-800 line-clamp-3">
            {{ topic.prompt }}
          </p>
        </div>
      </div>

      <!-- Progress Information -->
      <div v-if="topicCompleted" class="mb-4 p-3 bg-green-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center text-green-700">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-medium">Completed</span>
          </div>
          <div class="text-right">
            <!-- <div class="text-sm font-bold text-green-700">{{ progress?.attemptCount || 1 }} {{ (progress?.attemptCount || 1) === 1 ? 'attempt' : 'attempts' }}</div>
            <div class="text-xs text-green-600">
              {{ progress?.bestWordCount || 0 }} words best
            </div> -->
          </div>
        </div>
      </div>

      <!-- Spacer to push button to bottom -->
      <div class="flex-1"/>

      <!-- Action Button - fixed at bottom -->
      <div class="pb-4">
        <button
          class="w-full px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="topicCompleted 
            ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'"
          @click="$emit('startWriting', topic.id)"
        >
          {{ topicCompleted ? 'Write Again' : 'Start Writing' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WritingTopic } from '~/utils/types'
import { computed, ref, onMounted } from 'vue'

interface Props {
  topic: WritingTopic
}

const props = defineProps<Props>()

const _emit = defineEmits<{
  startWriting: [topicId: string]
}>()

// Mock progress tracking for now (will be implemented in Stage 11)
const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})

// Mock functions for progress tracking
const isTopicCompleted = (_topicId: string) => false
const getTopicProgress = (_topicId: string) => null

// Computed properties for progress display
const topicCompleted = computed(() => isClient.value ? isTopicCompleted(props.topic.id) : false)
const progress = computed(() => isClient.value ? getTopicProgress(props.topic.id) : null)

// Filter and process categories for display
const displayCategories = computed(() => {
  return props.topic.category
    .map(category => {
      // Truncate categories longer than 12 characters
      return category.length > 12 ? category.substring(0, 10) + '...' : category
    })
    .slice(0, 2) // Show max 2 categories
})

// Topic type styling
const topicTypeStyles = {
  email: 'bg-blue-100 text-blue-800',
  letter: 'bg-purple-100 text-purple-800',
  essay: 'bg-green-100 text-green-800',
  form: 'bg-orange-100 text-orange-800',
  postcard: 'bg-pink-100 text-pink-800',
  note: 'bg-yellow-100 text-yellow-800'
}

// Topic type labels in German
const topicTypeLabels = {
  email: 'E-Mail',
  letter: 'Brief',
  essay: 'Aufsatz',
  form: 'Formular',
  postcard: 'Postkarte',
  note: 'Notiz'
}

function getTopicTypeLabel(type: string) {
  return topicTypeLabels[type as keyof typeof topicTypeLabels] || type
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
