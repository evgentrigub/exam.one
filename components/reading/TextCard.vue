<template>
  <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 h-[320px] group">
    <div class="card-body p-4 flex flex-col relative">
      <!-- Delete button - top right corner -->
      <button
        class="btn btn-circle btn-error btn-sm absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Delete text"
        @click.stop="$emit('deleteText', text.id)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Header with badges -->
      <div class="flex items-center justify-between mb-3">
        <!-- Time indicator always on left -->
        <div class="flex items-center text-xs opacity-60">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ text.estimatedReadingTime }} Min
        </div>
        
        <!-- Completion or text type badge always on right -->
        <span 
          class="badge gap-1"
          :class="textCompleted ? 'badge-success' : getBadgeClass(text.textType)"
        >
          <!-- Completion check icon for completed texts -->
          <svg v-if="textCompleted" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ textCompleted ? 'Completed' : getTextTypeLabel(text.textType) }}
        </span>
      </div>

      <!-- Card Title -->
      <h3 class="card-title text-lg mb-2 line-clamp-2">
        {{ text.title }}
      </h3>

      <!-- Metadata -->
      <div class="flex items-center justify-between text-xs text-base-content/60 mb-4">
        <div class="flex items-center space-x-3">
          <span>{{ text.wordCount }} words</span>
          <span>•</span>
          <span>{{ text.difficulty }}</span>
        </div>
        <div class="flex flex-wrap gap-1 ml-auto">
          <span 
            v-for="topic in displayTopics" 
            :key="topic"
            class="badge badge-ghost badge-sm"
          >
            {{ topic }}
          </span>
        </div>
      </div>

      <!-- Progress Information -->
      <div v-if="textCompleted" class="mb-4 p-3 bg-success/10 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center text-success">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-medium">Best Score</span>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-success">{{ Math.round((bestScore / (text.questions?.length || 4)) * 100) }}%</div>
            <div class="text-xs text-success/80">
              {{ progress?.attemptCount || 1 }} {{ (progress?.attemptCount || 1) === 1 ? 'attempt' : 'attempts' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Spacer to push button to bottom -->
      <div class="flex-1"/>

      <!-- Action Button - fixed at bottom -->
      <div class="card-actions">
        <button
          class="btn w-full"
          :class="textCompleted ? 'btn-success' : 'btn-primary'"
          @click="$emit('startReading', text.id)"
        >
          {{ textCompleted ? $t('practice.textCard.readAgain') : $t('practice.textCard.startReading') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReadingExercise } from '~/utils/types'
import { useProgress } from '~/composables/useProgress'
import { computed, ref, onMounted } from 'vue'

interface Props {
  text: ReadingExercise
}

const props = defineProps<Props>()

const _emit = defineEmits<{
  startReading: [textId: string]
  deleteText: [textId: string]
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

// Text type badge styling (daisyUI)
const badgeClasses: Record<string, string> = {
  email: 'badge-info',
  notice: 'badge-warning', 
  article: 'badge-success',
  advertisement: 'badge-secondary',
  instructions: 'badge-accent',
  announcement: 'badge-error'
}

function getBadgeClass(type: string): string {
  return badgeClasses[type] || 'badge-ghost'
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