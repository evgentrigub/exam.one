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
      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2" :title="topic.title">
        {{ topic.title }}
      </h3>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-3 line-clamp-2">
        {{ topic.description }}
      </p>

      <!-- Metadata -->
      <div class="flex items-center text-xs text-gray-500 mb-4">
        <div class="flex items-center space-x-3">
          <span>{{ topic.difficulty }}</span>
          <span>•</span>
          <span>{{ displayTestingPart }}</span>
          <span>•</span>
          <span>{{ topic.wordCount.min }}-{{ topic.wordCount.max }} Wörter</span>
        </div>
      </div>
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="categoryObj in displayCategories" 
          :key="categoryObj.full"
          :title="categoryObj.full"
          class="px-2 py-1 bg-gray-100 rounded text-xs whitespace-nowrap"
        >
          {{ categoryObj.display }}
        </span>
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
            <div class="text-sm font-bold text-green-700">{{ progress?.attemptCount || 1 }} {{ (progress?.attemptCount || 1) === 1 ? 'attempt' : 'attempts' }}</div>
            <div class="text-xs text-green-600">
              {{ progress?.bestWordCount || 0 }} words best
            </div>
          </div>
        </div>
      </div>

      <!-- Spacer to push button to bottom -->
      <div class="flex-1"/>

      <!-- Action Button - fixed at bottom -->
      <div class="pb-4">
        <div class="flex gap-2">
          <button
            v-if="!topicCompleted"
            class="flex-1 px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            @click="$emit('startWriting', topic.id)"
          >
            Start Writing
          </button>

          <button
            v-if="topicCompleted"
            class="flex-1 px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="(isPending || !isReady) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'"
            :disabled="isPending || !isReady"
            @click="openReviewModal()"
          >
            {{ isPending ? 'Checking…' : 'Check the review' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Review Modal (sibling root allowed in Vue 3) -->
  <div v-if="showReview" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h3 class="text-lg font-semibold text-gray-900">AI Review</h3>
        <button class="text-gray-400 hover:text-gray-600" @click="showReview = false">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
<div class="p-5 overflow-y-auto flex-1">
        <!-- View Toggle -->
        <div class="mb-4">
          <div class="flex rounded-lg bg-gray-100 p-1 w-fit">
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              :class="selectedView === 'review' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              @click="selectedView = 'review'"
            >
              AI Review
            </button>
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              :class="selectedView === 'answer' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              @click="selectedView = 'answer'"
            >
              Submitted Answer
            </button>
          </div>
        </div>

        <!-- Review View -->
        <div v-if="selectedView === 'review' && reviewData">
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <div class="text-gray-500">Teil</div>
              <div class="font-medium">{{ reviewData.teil }}</div>
            </div>
            <div>
              <div class="text-gray-500">Words</div>
              <div class="font-medium">{{ reviewData.word_count }} / {{ reviewData.required_word_count }}</div>
            </div>
            <div>
              <div class="text-gray-500">Teil points</div>
              <div class="font-medium">{{ reviewData.teil_points }}</div>
            </div>
            <div>
              <div class="text-gray-500">Rule</div>
              <div class="font-medium uppercase">{{ reviewData.teil_rule_applied }}</div>
            </div>
            <div>
              <div class="text-gray-500">Passed module</div>
              <div class="font-medium">{{ reviewData.passed_module ? 'Yes' : 'No' }}</div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="text-sm font-semibold mb-2">Criteria</h4>
            <table class="w-full text-sm border">
              <thead>
                <tr class="bg-gray-50 text-left">
                  <th class="p-2 border">Criterion</th>
                  <th class="p-2 border">Grade</th>
                  <th class="p-2 border">Points</th>
                  <th class="p-2 border">Comment</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="p-2 border">Aufgabenerfüllung</td>
                  <td class="p-2 border">{{ reviewData.criteria.aufgabenerfuellung.grade }}</td>
                  <td class="p-2 border">{{ reviewData.criteria.aufgabenerfuellung.points }}</td>
                  <td class="p-2 border">{{ reviewData.criteria.aufgabenerfuellung.comment }}</td>
                </tr>
                <tr>
                  <td class="p-2 border">Kohärenz</td>
                  <td class="p-2 border">{{ reviewData.criteria.kohaerenz.grade }}</td>
                  <td class="p-2 border">{{ reviewData.criteria.kohaerenz.points }}</td>
                  <td class="p-2 border">{{ reviewData.criteria.kohaerenz.comment }}</td>
                </tr>
                <tr>
                  <td class="p-2 border">Wortschatz</td>
                  <td class="p-2 border">{{ reviewData.criteria.wortschatz.grade }}</td>
                  <td class="p-2 border">{{ reviewData.criteria.wortschatz.points }}</td>
                  <td class="p-2 border">{{ reviewData.criteria.wortschatz.comment }}</td>
                </tr>
                <tr>
                  <td class="p-2 border">Strukturen</td>
                  <td class="p-2 border">{{ reviewData.criteria.strukturen.grade }}</td>
                  <td class="p-2 border">{{ reviewData.criteria.strukturen.points }}</td>
                  <td class="p-2 border">{{ reviewData.criteria.strukturen.comment }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="reviewData.priority_fixes?.length" class="mb-4">
            <h4 class="text-sm font-semibold mb-2">Priority fixes</h4>
            <ul class="list-disc pl-5 text-sm">
              <li v-for="(fix, idx) in reviewData.priority_fixes" :key="idx">{{ fix }}</li>
            </ul>
          </div>

          <div v-if="reviewData.examples?.length" class="mb-4">
            <h4 class="text-sm font-semibold mb-2">Examples</h4>
            <table class="w-full text-sm border">
              <thead>
                <tr class="bg-gray-50 text-left">
                  <th class="p-2 border">Error</th>
                  <th class="p-2 border">Correction</th>
                  <th class="p-2 border">Rule</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ex, idx) in reviewData.examples" :key="idx">
                  <td class="p-2 border">{{ ex.error }}</td>
                  <td class="p-2 border">{{ ex.correction }}</td>
                  <td class="p-2 border">{{ ex.rule }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 class="text-sm font-semibold mb-2">Report</h4>
            <p class="text-sm whitespace-pre-wrap">{{ reviewData.report }}</p>
          </div>
        </div>
        <pre v-else-if="selectedView === 'review'" class="whitespace-pre-wrap text-sm text-gray-800">{{ reviewText }}</pre>

        <!-- Submitted Answer View -->
        <div v-else>
          <h4 class="text-sm font-semibold mb-2">Your submission</h4>
          <p class="text-sm whitespace-pre-wrap">{{ latestSubmissionText || 'No submission found for this topic.' }}</p>
        </div>
      </div>
      <div class="px-5 py-4 border-t flex justify-end">
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" @click="showReview = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { WritingTopic } from '../../utils/types'
import { useProgress } from '../../composables/useProgress'
import { useWritingReview } from '~/composables/useWritingReview'
import type { AiReviewData } from '~/utils/types'

interface Props {
  topic: WritingTopic
}

const props = defineProps<Props>()

const _emit = defineEmits<{
  startWriting: [topicId: string]
}>()

// Progress tracking composable (Stage 11)
const { isWritingTopicCompleted, getWritingTopicProgress, getLatestSubmission } = useProgress()

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
const { getReview, isReviewInProgress, reviewVersion, hasReview } = useWritingReview()
const isPending = computed(() => {
  // depend on version to refresh when localStorage-backed status changes
  void reviewVersion.value
  return isClient.value ? isReviewInProgress(props.topic.id) : false
})
const reviewText = computed(() => {
  // depend on version to refresh
  void reviewVersion.value
  const rec = isClient.value ? getReview(props.topic.id) : null
  return rec?.responseText || ''
})
const reviewData = computed<AiReviewData | null>(() => {
  void reviewVersion.value
  const rec = isClient.value ? getReview(props.topic.id) : null
  return rec?.responseData || null
})
const isReady = computed(() => {
  void reviewVersion.value
  return isClient.value ? hasReview(props.topic.id) : false
})
const showReview = ref(false)
const selectedView = ref<'review' | 'answer'>('review')
const latestSubmissionText = computed(() => {
  if (!isClient.value) return ''
  const sub = getLatestSubmission(props.topic.id)
  return sub?.content || ''
})

function openReviewModal() {
  // Only open if review is available
  const rec = getReview(props.topic.id)
  if (rec && rec.status === 'ready' && (rec.responseText || rec.responseData)) {
    showReview.value = true
  }
}

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

// Topic type styling
const topicTypeStyles = {
  email: 'bg-blue-100 text-blue-800',
  letter: 'bg-purple-100 text-purple-800',
  essay: 'bg-green-100 text-green-800',
  form: 'bg-orange-100 text-orange-800',
  postcard: 'bg-pink-100 text-pink-800',
  note: 'bg-yellow-100 text-yellow-800',
  report: 'bg-red-100 text-red-800',
  review: 'bg-blue-100 text-blue-800',
  proposal: 'bg-green-100 text-green-800',
  article: 'bg-orange-100 text-orange-800',
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
