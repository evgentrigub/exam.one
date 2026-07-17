<template>
  <Teleport to="body">
    <div class="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="writing-review-title">
      <div class="modal-box max-w-4xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-base-content/50">
              <Sparkles :size="11" aria-hidden="true" />
              {{ $t('writing.aiReview') || 'AI Review' }}
            </div>
            <h3 id="writing-review-title" class="font-display text-xl font-bold mt-1">
              {{ currentTopic?.title || 'Writing Review' }}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-ghost gap-1"
              :disabled="isPending"
              @click="handleRegenerate"
            >
              <RefreshCw :size="14" :class="{ 'animate-spin': isPending }" aria-hidden="true" />
              {{ isPending ? 'Regenerating…' : 'Regenerate AI review' }}
            </button>
            <button type="button" class="btn btn-sm btn-circle btn-ghost" aria-label="Close" @click="emit('close')">
              <X :size="16" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Pending -->
        <div v-if="isPending" class="py-12 text-center">
          <span class="loading loading-spinner loading-md text-primary" aria-hidden="true" />
          <p class="text-sm text-base-content/60 mt-3">AI review in progress…</p>
        </div>

        <!-- Error -->
        <div v-else-if="reviewError" class="alert alert-warning items-start mb-4">
          <AlertTriangle :size="20" class="shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 class="font-bold">AI review unavailable</h3>
            <p class="text-sm">{{ reviewError }}</p>
          </div>
        </div>

        <!-- Review content -->
        <div v-else-if="reviewData" class="space-y-6">
          <!-- Overview grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div class="rounded-box bg-base-200/60 border border-base-300/70 p-3">
              <div class="text-base-content/60 text-[11px] uppercase tracking-wider">Teil</div>
              <div class="font-medium">{{ reviewData.teil }}</div>
            </div>
            <div class="rounded-box bg-base-200/60 border border-base-300/70 p-3">
              <div class="text-base-content/60 text-[11px] uppercase tracking-wider">Words</div>
              <div class="font-medium">{{ formatWordCount(reviewData) }}</div>
            </div>
            <div v-if="isA2ReviewData(reviewData)" class="rounded-box bg-base-200/60 border border-base-300/70 p-3">
              <div class="text-base-content/60 text-[11px] uppercase tracking-wider">Result points</div>
              <div class="font-medium">{{ getA2ResultPoints(reviewData) }}</div>
            </div>
            <div v-if="isC1ReviewData(reviewData)" class="rounded-box bg-base-200/60 border border-base-300/70 p-3">
              <div class="text-base-content/60 text-[11px] uppercase tracking-wider">Teil points</div>
              <div class="font-medium">{{ getC1TeilPoints(reviewData) }}</div>
            </div>
            <div class="rounded-box bg-base-200/60 border border-base-300/70 p-3">
              <div class="text-base-content/60 text-[11px] uppercase tracking-wider">Rule</div>
              <div class="font-medium uppercase">{{ reviewData.teil_rule_applied }}</div>
            </div>
          </div>

          <!-- Criteria -->
          <div>
            <h4 class="text-sm font-semibold mb-2">Criteria</h4>
            <div class="overflow-x-auto rounded-box border border-base-300/70">
              <table class="table table-zebra table-sm w-full">
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
                  <tr v-if="isA2ReviewData(reviewData)">
                    <td>Sprache</td>
                    <td>{{ getA2Sprache(reviewData).grade }}</td>
                    <td>{{ getA2Sprache(reviewData).points }}</td>
                    <td>{{ getA2Sprache(reviewData).comment }}</td>
                  </tr>
                  <tr v-if="isC1ReviewData(reviewData)">
                    <td>Kohärenz</td>
                    <td>{{ getC1Kohaerenz(reviewData).grade }}</td>
                    <td>{{ getC1Kohaerenz(reviewData).points }}</td>
                    <td>{{ getC1Kohaerenz(reviewData).comment }}</td>
                  </tr>
                  <tr v-if="isC1ReviewData(reviewData)">
                    <td>Wortschatz</td>
                    <td>{{ getC1Wortschatz(reviewData).grade }}</td>
                    <td>{{ getC1Wortschatz(reviewData).points }}</td>
                    <td>{{ getC1Wortschatz(reviewData).comment }}</td>
                  </tr>
                  <tr v-if="isC1ReviewData(reviewData)">
                    <td>Strukturen</td>
                    <td>{{ getC1Strukturen(reviewData).grade }}</td>
                    <td>{{ getC1Strukturen(reviewData).points }}</td>
                    <td>{{ getC1Strukturen(reviewData).comment }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Priority fixes -->
          <div v-if="reviewData.priority_fixes?.length">
            <h4 class="text-sm font-semibold mb-2">Priority fixes</h4>
            <ul class="list-disc pl-5 text-sm space-y-1">
              <li v-for="(fix, idx) in reviewData.priority_fixes" :key="idx">{{ fix }}</li>
            </ul>
          </div>

          <!-- Examples -->
          <div v-if="reviewData.examples?.length">
            <h4 class="text-sm font-semibold mb-2">Examples</h4>
            <div class="overflow-x-auto rounded-box border border-base-300/70">
              <table class="table table-zebra table-sm w-full">
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

          <!-- Report -->
          <div class="rounded-box bg-base-200/60 border border-base-300/70 p-4">
            <h4 class="text-sm font-semibold mb-2">Report</h4>
            <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ reviewData.report }}</p>
          </div>
        </div>

        <div v-else class="py-12 text-center text-sm text-base-content/60">
          No AI review data available.
        </div>

        <!-- Footer -->
        <div class="modal-action mt-4">
          <button type="button" class="btn btn-primary btn-sm" @click="emit('close')">Close</button>
        </div>
      </div>
      <div class="modal-backdrop" @click="emit('close')" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, RefreshCw, Sparkles, X } from 'lucide-vue-next'
import { useWritingReview } from '~/composables/useWritingReview'
import { useWritingTopics } from '~/composables/useWritingTopics'
import type { AiReviewData } from '~/utils/types'
import { isA2Review, isC1Review } from '~/utils/types'

interface Props {
  topicId: string
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  regenerate: []
}>()

const { getReview, isReviewInProgress, getReviewError, reviewVersion } = useWritingReview()
const { getTopicById } = useWritingTopics()

const currentTopic = computed(() => getTopicById(props.topicId))

const isPending = computed(() => {
  void reviewVersion.value
  return isReviewInProgress(props.topicId)
})

const reviewError = computed(() => {
  void reviewVersion.value
  return getReviewError(props.topicId)
})

const reviewData = computed<AiReviewData | null>(() => {
  void reviewVersion.value
  const rec = getReview(props.topicId)
  return rec?.responseData || null
})

function handleRegenerate() {
  emit('regenerate')
}

const isA2ReviewData = (data: AiReviewData | null): data is import('~/utils/types').AiReviewDataA2 => {
  return data ? isA2Review(data) : false
}

const isC1ReviewData = (data: AiReviewData | null): data is import('~/utils/types').AiReviewDataC1 => {
  return data ? isC1Review(data) : false
}

const formatWordCount = (data: AiReviewData) => {
  if (isA2Review(data)) {
    return `${data.word_count} / ${data.required_word_count.min}-${data.required_word_count.max}`
  }
  return `${data.word_count} / ${data.required_word_count}`
}

const getC1TeilPoints = (data: AiReviewData) => {
  return isC1Review(data) ? data.teil_points : 0
}

const getA2ResultPoints = (data: AiReviewData) => {
  return isA2Review(data) ? data.teil_points_result : 0
}

const getA2Sprache = (data: AiReviewData) => {
  if (isA2Review(data)) {
    return data.criteria.sprache
  }
  return { grade: '', points: 0, comment: '' }
}

const getC1Kohaerenz = (data: AiReviewData) => {
  if (isC1Review(data)) {
    return data.criteria.kohaerenz
  }
  return { grade: '', points: 0, comment: '' }
}

const getC1Wortschatz = (data: AiReviewData) => {
  if (isC1Review(data)) {
    return data.criteria.wortschatz
  }
  return { grade: '', points: 0, comment: '' }
}

const getC1Strukturen = (data: AiReviewData) => {
  if (isC1Review(data)) {
    return data.criteria.strukturen
  }
  return { grade: '', points: 0, comment: '' }
}
</script>
