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
          <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70">
            <Clock :size="11" aria-hidden="true" />
            {{ topic.estimatedTime }} minutes
          </span>
          <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70">
            <Type :size="11" aria-hidden="true" />
            {{ topic.wordCount.min }}–{{ topic.wordCount.max }} words
          </span>
          <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70 capitalize">
            Teil {{ topic.testingPart || 2 }} · {{ topic.topicType }}
          </span>
        </div>
        <p class="mt-4 text-[15px] text-base-content/80 leading-relaxed">{{ topic.description }}</p>
      </section>

      <section class="bg-base-100 rounded-box border border-base-300/70 overflow-hidden">
        <div class="flex border-b border-base-300/70 px-3 overflow-x-auto" role="tablist" aria-label="Writing support tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            role="tab"
            class="relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            :class="activeTab === tab.key ? 'text-primary' : 'text-base-content/60 hover:text-base-content'"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" :size="12" aria-hidden="true" />
            {{ tab.label }}
            <span v-if="activeTab === tab.key" class="absolute left-3 right-3 -bottom-px h-0.5 bg-primary rounded-full" />
          </button>
        </div>

        <div class="p-5 sm:p-6">
          <div v-if="activeTab === 'prompt'" class="space-y-5">
            <div class="p-4 rounded-box bg-success/10 text-[14px] leading-relaxed text-base-content/85">
              {{ topic.task }}
            </div>
            <div>
              <div class="text-sm font-semibold mb-2">Requirements</div>
              <ul class="space-y-1.5 text-[14px] text-base-content/80">
                <li v-for="requirement in topic.requirements" :key="requirement" class="flex items-start gap-2">
                  <CheckCircle2 :size="13" class="text-success mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{{ requirement }}</span>
                </li>
              </ul>
            </div>
            <div v-if="writingTips.length" class="pt-4 border-t border-base-300/70">
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

          <div v-else-if="activeTab === 'feedback'" class="space-y-3">
            <div v-if="!submissionResults" class="text-center py-8 text-sm text-base-content/60">
              <MessageSquareQuote :size="22" class="mx-auto opacity-40 mb-2" aria-hidden="true" />
              Submit your answer to see AI feedback here.
            </div>
            <template v-else>
              <div class="flex items-center gap-2 p-3 rounded-box bg-success/10 border border-success/20">
                <CheckCircle2 :size="14" class="text-success shrink-0" aria-hidden="true" />
                <p class="text-xs font-medium text-success">Writing submitted — {{ submissionResults.wordCount }} words</p>
              </div>
              <WritingFeedback
                v-if="submissionResults.feedback"
                :feedback="submissionResults.feedback"
                :analysis-result="submissionResults.analysisResult"
              />
            </template>
          </div>
        </div>
      </section>
    </div>

    <div class="col-span-12 lg:col-span-6">
      <TextEditorCard
        :topic="topic"
        :initial-content="currentDraft"
        @submit="handleSubmit"
        @save-draft="handleSaveDraft"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { CheckCircle2, Clock, FileText, Lightbulb, MessageSquareQuote, Sparkles, Type } from 'lucide-vue-next'
import type { WritingExercise, WritingFeedbackModel } from '~/utils/types'
import type { TextAnalysisResult } from '~/utils/textAnalysis'
import { analyzeGermanText, createWritingFeedback } from '~/utils/textAnalysis'
import { useProgress } from '~/composables/useProgress'
import { getWritingTips } from '~/data/writing/exerciseTips'
import TextEditorCard from '~/components/writing/TextEditorCard.vue'
import WritingFeedback from '~/components/writing/WritingFeedback.vue'
import ModelAnswerCard from '~/components/writing/ModelAnswerCard.vue'

interface Props {
  topic: WritingExercise
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [topicId: string, content: string, wordCount: number, timeSpent: number]
}>()

const { saveWritingSubmission, saveWritingDraft, getWritingSession } = useProgress()

type TabKey = 'prompt' | 'answer' | 'feedback'

const activeTab = ref<TabKey>('prompt')
const tabs: { key: TabKey; label: string; icon: Component }[] = [
  { key: 'prompt', label: 'AI Prompt', icon: Sparkles },
  { key: 'answer', label: 'Ideal Answer', icon: Lightbulb },
  { key: 'feedback', label: 'AI Feedback', icon: MessageSquareQuote },
]

const currentDraft = ref('')
const submissionResults = ref<{
  wordCount: number
  timeSpent: number
  feedback?: WritingFeedbackModel
  analysisResult?: TextAnalysisResult | undefined
} | null>(null)

const writingTips = computed(() => getWritingTips(props.topic.difficulty, props.topic.testingPart))

onMounted(() => {
  const existingSession = getWritingSession(props.topic.id)
  if (existingSession) {
    currentDraft.value = existingSession.content
  }
})

function handleSaveDraft(content: string, wordCount: number) {
  currentDraft.value = content
  saveWritingDraft(props.topic.id, content, wordCount)
}

function handleSubmit(content: string, wordCount: number, timeSpent: number) {
  const analysisResult = analyzeGermanText(content, props.topic)
  const feedback = createWritingFeedback(analysisResult, props.topic)
  submissionResults.value = { wordCount, timeSpent, feedback, analysisResult }
  saveWritingSubmission(props.topic.id, content, wordCount, timeSpent, feedback)
  activeTab.value = 'feedback'
  emit('complete', props.topic.id, content, wordCount, timeSpent)
}
</script>
