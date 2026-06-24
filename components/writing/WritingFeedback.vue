<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div v-for="score in scores" :key="score.label" class="p-2.5 rounded-box bg-base-200/60 border border-base-300/70">
        <div class="text-[10px] uppercase tracking-wider text-base-content/60">{{ score.label }}</div>
        <div class="font-mono font-bold text-sm" :class="score.className">{{ score.value }}</div>
        <progress class="progress h-1 mt-1" :class="score.progressClass" :value="score.raw" max="5" />
      </div>
    </div>

    <div class="space-y-2">
      <div v-for="(suggestion, index) in feedback.suggestions" :key="suggestion" class="flex gap-2 text-sm text-base-content/80">
        <AlertTriangle v-if="index === 0 && !feedback.wordCountValid" :size="14" class="text-warning mt-0.5 shrink-0" aria-hidden="true" />
        <CheckCircle2 v-else-if="index === 0" :size="14" class="text-success mt-0.5 shrink-0" aria-hidden="true" />
        <PenLine v-else :size="14" class="text-info mt-0.5 shrink-0" aria-hidden="true" />
        <span>{{ suggestion }}</span>
      </div>
    </div>

    <details v-if="analysisResult" class="rounded-box bg-base-200/60 border border-base-300/70 p-3">
      <summary class="cursor-pointer text-sm font-semibold flex items-center gap-2">
        <ListChecks :size="14" aria-hidden="true" />
        Detailed analysis
      </summary>
      <div class="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div v-for="item in analysisItems" :key="item.label" class="rounded-box bg-base-100 border border-base-300/70 p-2">
          <div class="text-[10px] uppercase tracking-wider text-base-content/50">{{ item.label }}</div>
          <div class="font-mono font-bold text-sm">{{ item.value }}</div>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, CheckCircle2, ListChecks, PenLine } from 'lucide-vue-next'
import type { WritingFeedbackModel } from '~/utils/types'
import type { TextAnalysisResult } from '~/utils/textAnalysis'

interface Props {
  feedback: WritingFeedbackModel
  analysisResult?: TextAnalysisResult | undefined
}

const props = defineProps<Props>()

const overallScoreClass = computed(() => {
  const score = props.feedback.overallScore
  if (score >= 4) return 'text-success'
  if (score >= 3) return 'text-info'
  if (score >= 2) return 'text-warning'
  return 'text-error'
})

const scores = computed(() => [
  {
    label: 'Length',
    value: props.feedback.wordCountValid ? 'OK' : 'Check',
    raw: props.feedback.wordCountValid ? 5 : 2,
    className: props.feedback.wordCountValid ? 'text-success' : 'text-warning',
    progressClass: props.feedback.wordCountValid ? 'progress-success' : 'progress-warning',
  },
  {
    label: 'Structure',
    value: `${props.feedback.structureScore}/5`,
    raw: props.feedback.structureScore,
    className: 'text-info',
    progressClass: 'progress-info',
  },
  {
    label: 'Task',
    value: `${props.feedback.completenessScore}/5`,
    raw: props.feedback.completenessScore,
    className: 'text-primary',
    progressClass: 'progress-primary',
  },
  {
    label: 'Overall',
    value: `${props.feedback.overallScore}/5`,
    raw: props.feedback.overallScore,
    className: overallScoreClass.value,
    progressClass: props.feedback.overallScore >= 4 ? 'progress-success' : props.feedback.overallScore >= 3 ? 'progress-info' : 'progress-warning',
  },
])

const analysisItems = computed(() => {
  if (!props.analysisResult) return []
  return [
    { label: 'Words', value: props.analysisResult.wordCount },
    { label: 'Sentences', value: props.analysisResult.sentenceCount },
    { label: 'Avg length', value: Math.round(props.analysisResult.averageSentenceLength) },
    { label: 'Paragraphs', value: props.analysisResult.structureElements.paragraphCount },
  ]
})
</script>
