<template>
  <div class="group bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-[320px]">
    <!-- Header with badges -->
    <div class="px-4 pt-4">
      <div class="flex items-center justify-between mb-3">
        <!-- Time indicator always on left -->
        <div class="flex items-center text-xs text-gray-500">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ text.estimatedReadingTime }} Min
        </div>
        
        <!-- Completion or text type badge always on right -->
        <span 
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          :class="textCompleted ? 'bg-green-100 text-green-800' : textTypeStyles[text.textType]"
        >
          <!-- Completion check icon for completed texts -->
          <svg v-if="textCompleted" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ textCompleted ? 'Completed' : getTextTypeLabel(text.textType) }}
        </span>
      </div>
    </div>

    <!-- Content - flexible to fill space -->
    <div class="px-4 flex-1 flex flex-col">
      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {{ text.title }}
      </h3>

      <!-- Metadata -->
      <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div class="flex items-center space-x-3">
          <span>{{ text.wordCount }} words</span>
          <span>•</span>
          <span>{{ text.difficulty }}</span>
        </div>
        <div class="flex flex-wrap gap-1 ml-auto">
          <span 
            v-for="topic in displayTopics" 
            :key="topic"
            class="px-2 py-1 bg-gray-100 rounded text-xs whitespace-nowrap"
          >
            {{ topic }}
          </span>
        </div>
      </div>

      <!-- Progress Information -->
      <div v-if="textCompleted" class="mb-4 p-3 bg-green-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center text-green-700">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-medium">Best Score</span>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-green-700">{{ Math.round((bestScore / (text.questions?.length || 4)) * 100) }}%</div>
            <div class="text-xs text-green-600">
              {{ progress?.attemptCount || 1 }} {{ (progress?.attemptCount || 1) === 1 ? 'attempt' : 'attempts' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Spacer to push button to bottom -->
      <div class="flex-1"/>

      <!-- Action Button - fixed at bottom -->
      <div class="pb-4">
        <button
          class="w-full px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="textCompleted 
            ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'"
          @click="$emit('startReading', text.id)"
        >
          {{ textCompleted ? 'Read Again' : 'Start Reading' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GermanText } from '~/utils/types'
import { useProgress } from '~/composables/useProgress'
import { computed, ref, onMounted } from 'vue'

interface Props {
  text: GermanText
}

const props = defineProps<Props>()

const _emit = defineEmits<{
  startReading: [textId: string]
}>()

// Progress tracking
const { isTextCompleted, getBestScore, getTextProgress } = useProgress()

// Client-side hydration flag
const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})

// Computed properties for progress display (only check after client hydration)
const textCompleted = computed(() => isClient.value ? isTextCompleted(props.text.id) : false)
const bestScore = computed(() => isClient.value ? getBestScore(props.text.id) : 0)
const progress = computed(() => isClient.value ? getTextProgress(props.text.id) : null)

// Filter and process topics for display
const displayTopics = computed(() => {
  return props.text.topics
    .filter(topic => {
      // Remove overly long topics that break layout
      const longTopicsToRemove = ['Öffentliche Einrichtungen', 'Bewerbung']
      return !longTopicsToRemove.includes(topic)
    })
    .map(topic => {
      // Truncate topics longer than 12 characters
      return topic.length > 12 ? topic.substring(0, 10) + '...' : topic
    })
    .slice(0, 2) // Still only show max 2 topics
})

// Text type styling
const textTypeStyles = {
  email: 'bg-blue-100 text-blue-800',
  notice: 'bg-yellow-100 text-yellow-800', 
  article: 'bg-green-100 text-green-800',
  advertisement: 'bg-purple-100 text-purple-800',
  instructions: 'bg-orange-100 text-orange-800',
  announcement: 'bg-red-100 text-red-800'
}

// Text type labels in German
const textTypeLabels = {
  email: 'E-Mail',
  notice: 'Hinweis',
  article: 'Artikel', 
  advertisement: 'Anzeige',
  instructions: 'Anleitung',
  announcement: 'Ankündigung'
}

function getTextTypeLabel(type: string) {
  return textTypeLabels[type as keyof typeof textTypeLabels] || type
}

function _formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
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