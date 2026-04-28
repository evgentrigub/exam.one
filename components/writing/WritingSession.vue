<template>
  <div class="grid lg:grid-cols-2 gap-5 items-start">

    <!-- Left: tabbed info card (sticky) -->
    <div class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden lg:sticky lg:top-4">
      <!-- Tab bar -->
      <div class="flex border-b border-base-300 px-4 gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-underline px-3 pb-3 pt-3 text-sm font-medium transition-colors"
          :class="activeTab === tab.key ? 'text-base-content' : 'text-base-content/50 hover:text-base-content/70'"
          :aria-selected="activeTab === tab.key ? 'true' : 'false'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab content -->
      <div class="p-5">

        <!-- AI Prompt tab -->
        <div v-if="activeTab === 'prompt'" class="space-y-4">
          <div>
            <p class="text-sm text-base-content/70 leading-relaxed">{{ topic.description }}</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <span class="level-pip flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ topic.estimatedTime }} min
            </span>
            <span class="level-pip">{{ topic.wordCount.min }}–{{ topic.wordCount.max }} words</span>
            <span class="level-pip capitalize">{{ topic.topicType }}</span>
          </div>
          <ul v-if="writingTips.length" class="space-y-1.5 pt-1">
            <li v-for="tip in writingTips" :key="tip" class="text-xs text-base-content/60 flex gap-2">
              <span class="text-primary shrink-0">•</span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </div>

        <!-- Ideal Answer tab -->
        <ModelAnswerCard v-else-if="activeTab === 'answer'" :topic="topic" />

        <!-- AI Feedback tab -->
        <div v-else-if="activeTab === 'feedback'">
          <div v-if="!submissionResults" class="py-12 text-center">
            <p class="text-sm text-base-content/50">Submit your writing to get AI feedback.</p>
          </div>
          <template v-else>
            <div class="flex items-center gap-2 mb-4 p-3 rounded-field bg-success/10 border border-success/20">
              <svg class="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
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
    </div>

    <!-- Right: text editor card -->
    <div class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
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
import type { WritingTopic, WritingFeedbackModel } from '~/utils/types'
import type { TextAnalysisResult } from '~/utils/textAnalysis'
import { analyzeGermanText, createWritingFeedback } from '~/utils/textAnalysis'
import { useProgress } from '~/composables/useProgress'
import { writingTipsC1Teil1, writingTipsC1Teil2 } from '~/data/writing/exerciseTopics'
import TextEditorCard from './TextEditorCard.vue'
import WritingFeedback from './WritingFeedback.vue'
import ModelAnswerCard from './ModelAnswerCard.vue'

interface Props {
  topic: WritingTopic
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [topicId: string, content: string, wordCount: number, timeSpent: number]
}>()

const { saveWritingSubmission, saveWritingDraft, getWritingSession } = useProgress()

type TabKey = 'prompt' | 'answer' | 'feedback'

const activeTab = ref<TabKey>('prompt')
const tabs: { key: TabKey; label: string }[] = [
  { key: 'prompt', label: 'AI Prompt' },
  { key: 'answer', label: 'Ideal Answer' },
  { key: 'feedback', label: 'AI Feedback' }
]

const currentDraft = ref('')
const submissionResults = ref<{
  wordCount: number
  timeSpent: number
  feedback?: WritingFeedbackModel
  analysisResult?: TextAnalysisResult | undefined
} | null>(null)

const writingTips = computed(() =>
  props.topic.testingPart === 1 ? writingTipsC1Teil1 : writingTipsC1Teil2
)

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
