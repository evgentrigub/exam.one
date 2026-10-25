<template>
  <div>
    <div v-if="isPending" class="alert alert-warning mb-4">
      <Clock :size="24" aria-hidden="true" />
      <span>{{ $t('writing.reviewInProgress') }}</span>
    </div>

    <div v-else-if="reviewError" class="card bg-base-100 shadow">
      <div class="card-body space-y-4">
        <div class="alert alert-warning items-start">
          <AlertTriangle :size="20" class="shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 class="font-bold">{{ $t('writing.common.reviewUnavailable') }}</h3>
            <p class="text-sm">{{ reviewError }}</p>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">{{ $t('writing.yourSubmission') }}</h4>
          <p
            class="text-sm whitespace-pre-wrap rounded-box bg-base-200/60 border border-base-300/70 p-3"
          >
            {{ latestSubmissionText || $t('writing.noSubmission') }}
          </p>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">{{ $t('writing.originalTask') }}</h4>
          <div class="rounded-box bg-success/10 border border-success/20 p-3">
            <p class="leading-relaxed font-medium text-sm">
              {{ currentTopic?.task || $t('writing.taskNotFound') }}
            </p>
          </div>
        </div>
      </div>
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
          <FormFillReviewDetails
            v-if="formEntries"
            :review="reviewData"
            :entries="formEntries"
            :teil="currentTopic?.testingPart ?? 1"
          />
          <WritingReviewDetails
            v-else
            :review="reviewData"
            :teil="currentTopic?.testingPart ?? 1"
          />
        </div>

        <pre
          v-else-if="selectedView === 'review'"
          class="whitespace-pre-wrap text-sm text-base-content"
          >{{ reviewText }}</pre>

        <!-- Submitted Answer View -->
        <div v-else-if="selectedView === 'answer'">
          <h4 class="text-sm font-semibold mb-2">{{ $t('writing.yourSubmission') }}</h4>
          <p class="text-sm whitespace-pre-wrap">
            {{ latestSubmissionText || $t('writing.noSubmission') }}
          </p>
        </div>

        <!-- Topic Task View -->
        <div v-else-if="selectedView === 'task'">
          <h4 class="text-sm font-semibold mb-3">{{ $t('writing.originalTask') }}</h4>
          <div class="alert alert-success mb-4">
            <CheckCircle2 :size="20" aria-hidden="true" />
            <p class="leading-relaxed font-medium text-sm">
              {{ currentTopic?.task || $t('writing.taskNotFound') }}
            </p>
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
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-vue-next'
import WritingReviewDetails from '~/components/writing/WritingReviewDetails.vue'
import FormFillReviewDetails from '~/components/writing/FormFillReviewDetails.vue'
import {
  blankRows,
  displayWritingContent,
  isFormFillTopic,
  parseFormValues,
} from '~/utils/writing/formFill'
import { useWritingReview } from '~/composables/useWritingReview'
import { useProgress } from '~/composables/useProgress'
import { useWritingTopics } from '~/composables/useWritingTopics'
import type { CriterionReview } from '@exam-one/exam-packs'

interface Props {
  topicId: string
}
const props = defineProps<Props>()

const { getReview, isReviewInProgress, hasReview, getReviewError, reviewVersion } =
  useWritingReview()
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

const reviewError = computed(() => {
  void reviewVersion.value
  return getReviewError(props.topicId)
})

const reviewText = computed(() => {
  void reviewVersion.value
  const rec = getReview(props.topicId)
  return rec?.responseText || ''
})

const reviewData = computed<CriterionReview | null>(() => {
  void reviewVersion.value
  const rec = getReview(props.topicId)
  return rec?.responseData || null
})

const latestSubmissionText = computed(() => {
  const sub = getLatestSubmission(props.topicId)
  return sub?.content ? displayWritingContent(currentTopic.value, sub.content) : ''
})

/** A form-fill task's entries beside their form labels; null for an essay. */
const formEntries = computed(() => {
  const topic = currentTopic.value
  if (!topic || !isFormFillTopic(topic)) return null
  const values = parseFormValues(getLatestSubmission(props.topicId)?.content)
  return blankRows(topic).map(row => ({
    id: row.field,
    label: row.label,
    answer: values[row.field] ?? '',
  }))
})

const selectedView = ref<'review' | 'answer' | 'task'>('review')
</script>
