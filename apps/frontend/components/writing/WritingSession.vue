<template>
  <div class="grid grid-cols-12 gap-6 items-start">
    <div class="col-span-12 lg:col-span-6 space-y-5 lg:sticky lg:top-20">
      <section class="bg-base-100 rounded-box border border-base-300/70 p-5 sm:p-7">
        <div class="flex items-center gap-2 text-base-content/70">
          <FileText :size="14" aria-hidden="true" />
          <div class="text-sm font-semibold">Description</div>
        </div>
        <h2 class="font-display text-xl font-bold mt-3">{{ topic.title }}</h2>
        <div class="flex flex-wrap gap-2 mt-3">
          <span
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
          >
            <Clock :size="11" aria-hidden="true" />
            {{ topic.estimatedTime }} minutes
          </span>
          <span
            v-if="!isFormFill"
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
          >
            <Type :size="11" aria-hidden="true" />
            {{ topic.wordCount.min }}–{{ topic.wordCount.max }} words
          </span>
          <span
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70 capitalize"
          >
            Teil {{ topic.testingPart || 2 }} · {{ topic.topicType }}
          </span>
        </div>
        <p class="mt-4 text-[15px] text-base-content/80 leading-relaxed">{{ topic.description }}</p>
      </section>

      <section class="bg-base-100 rounded-box border border-base-300/70 overflow-hidden">
        <div
          v-if="!examMode"
          class="flex border-b border-base-300/70 px-3 overflow-x-auto"
          role="tablist"
          aria-label="Writing support tabs"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            role="tab"
            class="relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            :class="
              activeTab === tab.key
                ? 'text-primary'
                : 'text-base-content/60 hover:text-base-content'
            "
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" :size="12" aria-hidden="true" />
            {{ tab.label }}
            <span
              v-if="activeTab === tab.key"
              class="absolute left-3 right-3 -bottom-px h-0.5 bg-primary rounded-full"
            />
          </button>
        </div>

        <div class="p-5 sm:p-6">
          <div v-if="activeTab === 'prompt'" class="space-y-5">
            <div
              class="p-4 rounded-box bg-success/10 text-[14px] leading-relaxed text-base-content/85"
            >
              {{ topic.task }}
            </div>
            <div>
              <div class="text-sm font-semibold mb-2">Requirements</div>
              <ul class="space-y-1.5 text-[14px] text-base-content/80">
                <li
                  v-for="requirement in topic.requirements"
                  :key="requirement"
                  class="flex items-start gap-2"
                >
                  <CheckCircle2
                    :size="13"
                    class="text-success mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ requirement }}</span>
                </li>
              </ul>
            </div>
            <div v-if="writingTips.length && !examMode" class="pt-4 border-t border-base-300/70">
              <div class="text-sm font-semibold mb-2">Writing tips</div>
              <ul class="space-y-1.5 text-[13px] text-base-content/70">
                <li v-for="tip in writingTips" :key="tip" class="flex items-start gap-2">
                  <Lightbulb :size="13" class="text-warning mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{{ tip }}</span>
                </li>
              </ul>
            </div>
          </div>

          <ModelAnswerCard v-else-if="activeTab === 'answer'" :topic="topic" />

          <div v-else-if="activeTab === 'ai-review'" class="space-y-4">
            <div v-if="!isSubmitted" class="text-center py-8 text-sm text-base-content/60">
              <MessageSquare :size="22" class="mx-auto opacity-40 mb-2" aria-hidden="true" />
              Submit your answer to see AI review here.
            </div>

            <div
              v-else-if="reviewPending"
              class="flex items-center gap-3 py-2 text-sm text-base-content/70"
            >
              <span class="loading loading-spinner loading-sm text-primary" aria-hidden="true" />
              <span>AI review in progress…</span>
            </div>

            <div v-else-if="reviewError" class="space-y-3">
              <div class="alert alert-warning items-start text-sm">
                <AlertTriangle :size="16" class="shrink-0 mt-0.5" aria-hidden="true" />
                <div class="min-w-0">
                  <p class="font-medium">AI review unavailable</p>
                  <p class="text-xs opacity-80">{{ reviewError }}</p>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-outline btn-sm w-full gap-1.5 rounded-full"
                :disabled="reviewPending"
                @click="handleRegenerate"
              >
                <Sparkles :size="14" aria-hidden="true" />
                Regenerate AI review
              </button>
            </div>

            <div v-else-if="reviewReady" class="space-y-3">
              <div
                class="flex items-center gap-2 p-3 rounded-box bg-success/10 border border-success/20"
              >
                <CheckCircle2 :size="14" class="text-success shrink-0" aria-hidden="true" />
                <p class="text-sm font-medium text-success">AI review ready</p>
              </div>
              <button
                type="button"
                class="btn btn-primary btn-sm w-full gap-1.5 rounded-full"
                @click="handleViewDetailedReview"
              >
                <Sparkles :size="14" aria-hidden="true" />
                View detailed AI review
              </button>
            </div>

            <div v-else class="space-y-3">
              <p class="text-sm text-base-content/60 py-2">Preparing your review…</p>
              <button
                type="button"
                class="btn btn-outline btn-sm w-full gap-1.5 rounded-full"
                :disabled="reviewPending"
                @click="handleRegenerate"
              >
                <Sparkles :size="14" aria-hidden="true" />
                Regenerate AI review
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="col-span-12 lg:col-span-6">
      <FormFillCard
        v-if="isFormFill"
        :topic="topic"
        :initial-content="currentDraft"
        :submitted="isSubmitted"
        @submit="handleSubmit"
        @save-draft="handleSaveDraft"
        @finish="handleFinish"
      />
      <TextEditorCard
        v-else
        :topic="topic"
        :initial-content="currentDraft"
        :submitted="isSubmitted"
        :exam-mode="examMode ?? false"
        @submit="handleSubmit"
        @save-draft="handleSaveDraft"
        @finish="handleFinish"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Type,
} from 'lucide-vue-next'
import type { WritingExercise } from '~/utils/types'
import { useProgress } from '~/composables/useProgress'
import { useWritingReview } from '~/composables/useWritingReview'
import { getWritingTips } from '~/data/writing/exerciseTips'
import TextEditorCard from '~/components/writing/TextEditorCard.vue'
import FormFillCard from '~/components/writing/FormFillCard.vue'
import { parseFormValues } from '~/utils/writing/formFill'
import ModelAnswerCard from '~/components/writing/ModelAnswerCard.vue'

interface Props {
  topic: WritingExercise
  examMode?: boolean
  initialContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  examMode: false,
  initialContent: '',
})

const emit = defineEmits<{
  complete: [topicId: string, content: string, wordCount: number, timeSpent: number]
  progress: [payload: { content: string; wordCount: number }]
  examComplete: [payload: { content: string; wordCount: number; timeSpent: number }]
  finish: []
}>()

const { saveWritingSubmission, saveWritingDraft, getWritingSession, getLatestSubmission } =
  useProgress()
const {
  requestReview,
  regenerateReview,
  isReviewInProgress,
  hasReview,
  getReviewError,
  reviewVersion,
} = useWritingReview()

type TabKey = 'prompt' | 'answer' | 'ai-review'

const activeTab = ref<TabKey>('prompt')
const tabs: { key: TabKey; label: string; icon: Component }[] = [
  { key: 'prompt', label: 'AI Prompt', icon: Sparkles },
  { key: 'answer', label: 'Ideal Answer', icon: Lightbulb },
  { key: 'ai-review', label: 'AI Review', icon: MessageSquare },
]

const currentDraft = ref(props.initialContent)
const isSubmitted = ref(false)
const submittedContent = ref('')
const submittedWordCount = ref(0)
const submittedTimeSpent = ref(0)

const { partsFor } = useActivePack()
/** The pack decides the screen: a `form-fill` part gets the form instead of the editor. */
const isFormFill = computed(
  () => partsFor('writing').find(part => part.n === props.topic.testingPart)?.layout === 'form-fill'
)

const writingTips = computed(() => getWritingTips(props.topic.difficulty, props.topic.testingPart))

const reviewPending = computed(() => {
  void reviewVersion.value
  return isReviewInProgress(props.topic.id)
})

const reviewReady = computed(() => {
  void reviewVersion.value
  return hasReview(props.topic.id)
})

const reviewError = computed(() => {
  void reviewVersion.value
  return getReviewError(props.topic.id)
})

onMounted(() => {
  if (props.examMode) return
  const existingSession = getWritingSession(props.topic.id)
  if (existingSession) {
    currentDraft.value = existingSession.content
  }

  const latest = getLatestSubmission(props.topic.id)
  if (latest && !latest.isDraft) {
    isSubmitted.value = true
    submittedContent.value = latest.content
    submittedWordCount.value = latest.wordCount
    submittedTimeSpent.value = latest.timeSpent || 0
    currentDraft.value = latest.content
  }
})

function handleSaveDraft(content: string, wordCount: number) {
  if (isSubmitted.value) return
  currentDraft.value = content
  if (props.examMode) {
    emit('progress', { content, wordCount })
  } else {
    saveWritingDraft(props.topic.id, content, wordCount)
  }
}

async function handleSubmit(content: string, wordCount: number, timeSpent: number) {
  isSubmitted.value = true
  submittedContent.value = content
  submittedWordCount.value = wordCount
  submittedTimeSpent.value = timeSpent
  if (props.examMode) {
    emit('examComplete', { content, wordCount, timeSpent })
    return
  }
  saveWritingSubmission(
    props.topic.id,
    content,
    wordCount,
    timeSpent,
    undefined,
    isFormFill.value ? parseFormValues(content) : undefined
  )
  emit('complete', props.topic.id, content, wordCount, timeSpent)
  activeTab.value = 'ai-review'

  try {
    await requestReview(props.topic, content)
  } catch {
    // Errors are stored in the review record; UI reads from there.
  }
}

async function handleRegenerate() {
  if (!submittedContent.value) return
  await regenerateReview(props.topic, submittedContent.value)
}

function handleViewDetailedReview() {
  navigateTo(`/writing/${props.topic.id}/checking`)
}

function handleFinish() {
  if (props.examMode) {
    emit('finish')
    return
  }
  navigateTo('/exercises?skill=writing')
}
</script>
