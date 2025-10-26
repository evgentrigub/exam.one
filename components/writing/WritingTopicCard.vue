<template>
  <div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 h-[380px] group">
    <div class="card-body p-4 flex flex-col relative">
      <!-- Delete button - top right corner -->
      <button
        class="btn btn-circle btn-error btn-sm absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Delete topic"
        @click.stop="$emit('deleteTopic', topic.id)"
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
          {{ topic.estimatedTime }} Min
        </div>
        
        <!-- Completion or topic type badge always on right -->
        <span 
          class="badge gap-1"
          :class="topicCompleted ? 'badge-success' : getTopicBadgeClass(topic.topicType)"
        >
          <!-- Completion check icon for completed topics -->
          <svg v-if="topicCompleted" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ topicCompleted ? 'Completed' : getTopicTypeLabel(topic.topicType) }}
        </span>
      </div>

      <!-- Card Title -->
      <h3 class="card-title text-lg mb-2 line-clamp-2" :title="topic.title">
        {{ topic.title }}
      </h3>

      <!-- Description -->
      <p class="text-sm opacity-70 mb-3 line-clamp-2">
        {{ topic.description }}
      </p>

      <!-- Metadata -->
      <div class="flex items-center text-xs opacity-60 mb-3">
        <div class="flex items-center space-x-3">
          <span>{{ topic.difficulty }}</span>
          <span>•</span>
          <span>{{ displayTestingPart }}</span>
          <span>•</span>
          <span>{{ topic.wordCount.min }}-{{ topic.wordCount.max }} Wörter</span>
        </div>
      </div>
      <div class="flex flex-wrap gap-1 mb-4">
        <span 
          v-for="categoryObj in displayCategories" 
          :key="categoryObj.full"
          :title="categoryObj.full"
          class="badge badge-ghost badge-sm"
        >
          {{ categoryObj.display }}
        </span>
      </div>

      <!-- Progress Information -->
      <div v-if="topicCompleted" class="mb-4 mt-4 p-3 bg-green-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center text-green-700">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-medium">Completed</span>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold text-green-700">{{ progress?.attemptCount || 1 }} {{ (progress?.attemptCount || 1) === 1 ? 'attempt' : 'attempts' }}</div>
          </div>
        </div>
      </div>

      <!-- Spacer to push button to bottom -->
      <div class="flex-1"/>

      <!-- Action Buttons -->
      <div class="card-actions">
        <button
          v-if="!topicCompleted"
          class="btn btn-primary flex-1"
          @click="$emit('startWriting', topic.id)"
        >
          Start Writing
        </button>

        <NuxtLink
          v-if="topicCompleted && isReady"
          class="btn btn-success flex-[4]"
          :to="`/writing/${props.topic.id}/checking`"
        >
          {{ $t('writing.checkReview') }}
        </NuxtLink>
        <button
          v-else-if="topicCompleted && isPending"
          class="btn btn-disabled flex-[4]"
          disabled
        >
          {{ $t('writing.checking') }}
        </button>

        <Tooltip
          v-if="topicCompleted && !isPending"
          :text="$t('writing.repeatExercise')"
          position="top"
          class="flex-[1]"
        >
          <button
            class="btn btn-success btn-circle w-full"
            :class="(isPending || !isReady) ? 'btn-disabled' : ''"
            :disabled="isPending || !isReady"
            @click="$emit('startWriting', topic.id)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </Tooltip>
      </div>
    </div>
  </div>

  <!-- Review modal removed; review is now a dedicated route -->
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { WritingTopic } from '../../utils/types'
import { useProgress } from '../../composables/useProgress'
import { useWritingReview } from '~/composables/useWritingReview'

interface Props {
  topic: WritingTopic
}

const props = defineProps<Props>()

const _emit = defineEmits<{
  startWriting: [topicId: string]
  deleteTopic: [topicId: string]
}>()

// Progress tracking composable (Stage 11)
const { isWritingTopicCompleted, getWritingTopicProgress } = useProgress()

// Client-side hydration
const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})

// Real progress tracking functions (Stage 11)
const isTopicCompleted = (topicId: string) => isWritingTopicCompleted(topicId)
const getTopicProgress = (topicId: string) => getWritingTopicProgress(topicId)

// Computed properties for progress display
const topicCompleted = computed(() => isClient.value ? isTopicCompleted(props.topic.id) : false)
const progress = computed(() => isClient.value ? getTopicProgress(props.topic.id) : null)

// Review state
const { isReviewInProgress, reviewVersion, hasReview } = useWritingReview()
const isPending = computed(() => {
  // depend on version to refresh when localStorage-backed status changes
  void reviewVersion.value
  return isClient.value ? isReviewInProgress(props.topic.id) : false
})
const isReady = computed(() => {
  void reviewVersion.value
  return isClient.value ? hasReview(props.topic.id) : false
})
// review interactions moved to /writing/[topicId]/checking

// Filter and process categories for display
const displayCategories = computed(() => {
  return props.topic.category
    .slice(0, 2) // Show max 2 categories
    .map(category => ({
      display: category.length > 15 ? category.substring(0, 15) + '...' : category,
      full: category
    }))
})

const displayTestingPart = computed(() => {
  return props.topic.testingPart === 1 ? 'Teil 1' : 'Teil 2'
})

// Topic type badge styling (daisyUI)
const topicBadgeClasses: Record<string, string> = {
  email: 'badge-info',
  letter: 'badge-secondary',
  essay: 'badge-success',
  form: 'badge-accent',
  postcard: 'badge-secondary',
  note: 'badge-warning',
  report: 'badge-error',
  review: 'badge-info',
  proposal: 'badge-success',
  article: 'badge-accent',
  post: 'badge-primary',
}

// Fallback badge class for unknown types
function getTopicBadgeClass(type: string): string {
  return topicBadgeClasses[type] || 'badge-ghost'
}

// Topic type labels in German with fallback
const topicTypeLabels: Record<string, string> = {
  email: 'E-Mail',
  letter: 'Brief',
  essay: 'Aufsatz',
  form: 'Formular',
  postcard: 'Postkarte',
  note: 'Notiz',
  post: 'Beitrag',
  article: 'Artikel',
  report: 'Bericht',
  review: 'Rezension',
  proposal: 'Vorschlag',
}

function getTopicTypeLabel(type: string): string {
  // Return known label or capitalize the type as fallback
  return topicTypeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
