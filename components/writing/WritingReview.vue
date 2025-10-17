<template>
  <div>
    <div v-if="isPending" class="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-4">
      {{ $t('writing.reviewInProgress') }}
    </div>

    <div v-else-if="isReady && (reviewData || reviewText)" class="bg-white rounded-xl shadow-sm border">
      <div class="p-5 overflow-y-auto">
        <!-- View Toggle -->
        <div class="mb-4">
          <div class="flex rounded-lg bg-gray-100 p-1 w-fit">
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              :class="selectedView === 'review' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              @click="selectedView = 'review'"
            >
              {{ $t('writing.aiReview') }}
            </button>
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              :class="selectedView === 'answer' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              @click="selectedView = 'answer'"
            >
              {{ $t('writing.submittedAnswer') }}
            </button>
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              :class="selectedView === 'task' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              @click="selectedView = 'task'"
            >
              {{ $t('writing.topicTask') }}
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
        <div v-else-if="selectedView === 'answer'">
          <h4 class="text-sm font-semibold mb-2">{{ $t('writing.yourSubmission') }}</h4>
          <p class="text-sm whitespace-pre-wrap">{{ latestSubmissionText || $t('writing.noSubmission') }}</p>
        </div>

        <!-- Topic Task View -->
        <div v-else-if="selectedView === 'task'">
          <h4 class="text-sm font-semibold mb-3">{{ $t('writing.originalTask') }}</h4>
          <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-400 mb-4">
            <p class="text-gray-800 leading-relaxed font-medium text-sm">{{ currentTopic?.task || $t('writing.taskNotFound') }}</p>
          </div>
          <div v-if="currentTopic?.requirements?.length">
            <h4 class="text-sm font-semibold mb-2">{{ $t('writing.requirements') }}</h4>
            <div class="space-y-1">
              <div 
                v-for="requirement in currentTopic.requirements" 
                :key="requirement"
                class="flex items-center p-1 rounded"
              >
                <span class="text-orange-500 mr-2 flex-shrink-0">•</span>
                <span class="text-sm text-gray-700">{{ requirement }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-xl border p-6 text-gray-700">
      {{ $t('writing.noReviewAvailable') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWritingReview } from '~/composables/useWritingReview'
import { useProgress } from '~/composables/useProgress'
import { writingTopics } from '~/data/writing/exerciseTopics'
import type { AiReviewData } from '~/utils/types'

interface Props {
  topicId: string
}
const props = defineProps<Props>()

const { getReview, isReviewInProgress, hasReview, reviewVersion } = useWritingReview()
const { getLatestSubmission } = useProgress()

const currentTopic = computed(() => writingTopics.find(t => t.id === props.topicId))

const isPending = computed(() => {
  void reviewVersion.value
  return isReviewInProgress(props.topicId)
})

const isReady = computed(() => {
  void reviewVersion.value
  return hasReview(props.topicId)
})

const reviewText = computed(() => {
  void reviewVersion.value
  const rec = getReview(props.topicId)
  return rec?.responseText || ''
})

const reviewData = computed<AiReviewData | null>(() => {
  void reviewVersion.value
  const rec = getReview(props.topicId)
  return rec?.responseData || null
})

const latestSubmissionText = computed(() => {
  const sub = getLatestSubmission(props.topicId)
  return sub?.content || ''
})

const selectedView = ref<'review' | 'answer' | 'task'>('review')
</script>
