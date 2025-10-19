<template>
  <div>
    <div v-if="isPending" class="alert alert-warning mb-4">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>{{ $t('writing.reviewInProgress') }}</span>
    </div>

    <div v-else-if="isReady && (reviewData || reviewText)" class="card bg-base-100 shadow">
      <div class="card-body overflow-y-auto">
        <!-- View Toggle -->
        <div class="mb-4">
          <div class="tabs tabs-boxed w-fit">
            <a 
              class="tab"
              :class="selectedView === 'review' ? 'tab-active' : ''"
              @click="selectedView = 'review'"
            >
              {{ $t('writing.aiReview') }}
            </a>
            <a 
              class="tab"
              :class="selectedView === 'answer' ? 'tab-active' : ''"
              @click="selectedView = 'answer'"
            >
              {{ $t('writing.submittedAnswer') }}
            </a>
            <a 
              class="tab"
              :class="selectedView === 'task' ? 'tab-active' : ''"
              @click="selectedView = 'task'"
            >
              {{ $t('writing.topicTask') }}
            </a>
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
            <div class="overflow-x-auto">
              <table class="table table-zebra table-compact w-full">
                <thead>
                  <tr>
                    <th>Criterion</th>
                    <th>Grade</th>
                    <th>Points</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Aufgabenerfüllung</td>
                    <td>{{ reviewData.criteria.aufgabenerfuellung.grade }}</td>
                    <td>{{ reviewData.criteria.aufgabenerfuellung.points }}</td>
                    <td>{{ reviewData.criteria.aufgabenerfuellung.comment }}</td>
                  </tr>
                  <tr>
                    <td>Kohärenz</td>
                    <td>{{ reviewData.criteria.kohaerenz.grade }}</td>
                    <td>{{ reviewData.criteria.kohaerenz.points }}</td>
                    <td>{{ reviewData.criteria.kohaerenz.comment }}</td>
                  </tr>
                  <tr>
                    <td>Wortschatz</td>
                    <td>{{ reviewData.criteria.wortschatz.grade }}</td>
                    <td>{{ reviewData.criteria.wortschatz.points }}</td>
                    <td>{{ reviewData.criteria.wortschatz.comment }}</td>
                  </tr>
                  <tr>
                    <td>Strukturen</td>
                    <td>{{ reviewData.criteria.strukturen.grade }}</td>
                    <td>{{ reviewData.criteria.strukturen.points }}</td>
                    <td>{{ reviewData.criteria.strukturen.comment }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="reviewData.priority_fixes?.length" class="mb-4">
            <h4 class="text-sm font-semibold mb-2">Priority fixes</h4>
            <ul class="list-disc pl-5 text-sm">
              <li v-for="(fix, idx) in reviewData.priority_fixes" :key="idx">{{ fix }}</li>
            </ul>
          </div>

          <div v-if="reviewData.examples?.length" class="mb-4">
            <h4 class="text-sm font-semibold mb-2">Examples</h4>
            <div class="overflow-x-auto">
              <table class="table table-zebra table-compact w-full">
                <thead>
                  <tr>
                    <th>Error</th>
                    <th>Correction</th>
                    <th>Rule</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ex, idx) in reviewData.examples" :key="idx">
                    <td>{{ ex.error }}</td>
                    <td>{{ ex.correction }}</td>
                    <td>{{ ex.rule }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
          <div class="alert alert-success mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="leading-relaxed font-medium text-sm">{{ currentTopic?.task || $t('writing.taskNotFound') }}</p>
          </div>
          <div v-if="currentTopic?.requirements?.length">
            <h4 class="text-sm font-semibold mb-2">{{ $t('writing.requirements') }}</h4>
            <ul class="menu menu-compact bg-base-200 rounded-box">
              <li v-for="requirement in currentTopic.requirements" :key="requirement">
                <span class="text-sm">{{ requirement }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card bg-base-100 shadow">
      <div class="card-body">
        <p class="text-base-content opacity-70">{{ $t('writing.noReviewAvailable') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWritingReview } from '~/composables/useWritingReview'
import { useProgress } from '~/composables/useProgress'
import { useWritingTopics } from '~/composables/useWritingTopics'
import type { AiReviewData } from '~/utils/types'

interface Props {
  topicId: string
}
const props = defineProps<Props>()

const { getReview, isReviewInProgress, hasReview, reviewVersion } = useWritingReview()
const { getLatestSubmission } = useProgress()
const { getTopicById } = useWritingTopics()

const currentTopic = computed(() => getTopicById(props.topicId))

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
