<template>
  <div class="bg-base-100 rounded-box border border-base-300/70 p-5 sm:p-7 h-fit">
    <div class="flex items-center gap-2">
      <PenLine :size="14" class="text-base-content/70" aria-hidden="true" />
      <div class="text-sm font-semibold text-base-content/70">Your Answer</div>
      <span class="ml-auto text-xs text-base-content/60">
        <span class="font-mono font-semibold" :class="wordCountColor">{{ wordCount }}</span>
        <span class="text-base-content/50"> / {{ topic.wordCount.min }}–{{ topic.wordCount.max }} words</span>
      </span>
    </div>

    <textarea
      v-model="content"
      class="mt-4 w-full min-h-[360px] p-4 text-[15px] leading-relaxed rounded-box border bg-base-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-y"
      :class="[textareaClasses, props.submitted ? 'opacity-80 cursor-default' : '']"
      :disabled="props.submitted"
      placeholder="Start writing your response here..."
      aria-label="Your writing answer"
      @input="updateWordCount"
    />

    <div class="mt-4">
      <div class="flex items-center justify-between text-xs text-base-content/60 mb-1.5">
        <span>Word count progress</span>
        <span class="font-mono">{{ wordCountPercentage }}%</span>
      </div>
      <progress class="progress w-full h-1.5" :class="progressBarColor" :value="wordCountPercentage" max="100" />
    </div>

    <div v-if="content.trim().length > 20 && !props.submitted" class="mt-4 rounded-box border border-base-300/70 bg-base-200/40 p-3">
      <div class="flex items-center justify-between gap-3 mb-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-base-content/50">Writing quality</span>
        <button class="btn btn-ghost btn-xs" type="button" @click="showQualityDetails = !showQualityDetails">
          {{ showQualityDetails ? 'Hide details' : 'Details' }}
        </button>
      </div>
      <div class="grid grid-cols-3 gap-2 text-xs">
        <div class="flex items-center gap-2 text-base-content/70">
          <span class="badge badge-sm" :class="structureIndicatorColor" />
          <span>Structure</span>
        </div>
        <div class="flex items-center gap-2 text-base-content/70">
          <span class="badge badge-sm" :class="vocabularyIndicatorColor" />
          <span>Vocabulary</span>
        </div>
        <div class="flex items-center gap-2 text-base-content/70">
          <span class="badge badge-sm" :class="lengthIndicatorColor" />
          <span>Length</span>
        </div>
      </div>
      <div v-if="showQualityDetails && realtimeAnalysis" class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        <div v-for="item in analysisStats" :key="item.label" class="rounded-box bg-base-100 border border-base-300/70 p-2">
          <div class="text-[10px] uppercase tracking-wider text-base-content/50">{{ item.label }}</div>
          <div class="font-mono font-bold text-sm">{{ item.value }}</div>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-1.5" :class="wordCountColor">
        <FileText :size="13" aria-hidden="true" />
        <span>{{ wordCountStatus }}</span>
      </div>
      <button v-if="content.trim() && !props.submitted" type="button" class="btn btn-error btn-ghost btn-xs" @click="clearContent">
        Clear text
      </button>
    </div>

    <div class="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <button
        v-if="!props.submitted"
        :disabled="!content.trim()"
        type="button"
        class="btn btn-ghost btn-sm gap-1.5 flex-1 border border-base-300 rounded-full"
        @click="saveDraft"
      >
        <Save :size="12" aria-hidden="true" />
        Save Draft
      </button>
      <button
        v-if="!props.submitted"
        :disabled="!isSubmittable"
        type="button"
        class="btn btn-primary btn-sm flex-1 gap-1.5 rounded-full"
        @click="submitWriting"
      >
        Submit
        <ArrowRight :size="12" aria-hidden="true" />
      </button>
      <button
        v-else
        type="button"
        class="btn btn-primary btn-sm flex-1 gap-1.5 rounded-full"
        @click="emit('finish')"
      >
        <DoorOpen :size="12" aria-hidden="true" />
        Save & Exit
      </button>
      <div v-if="props.submitted" class="flex-1 text-center text-sm text-base-content/60">
        Submitted
      </div>
    </div>

    <div v-if="autoSaved" class="text-[11px] text-success mt-2 flex items-center gap-1" aria-live="polite">
      <CheckCircle2 :size="11" aria-hidden="true" />
      Draft auto-saved just now
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, CheckCircle2, DoorOpen, FileText, PenLine, Save } from 'lucide-vue-next'
import type { WritingExercise } from '~/utils/types'
import type { TextAnalysisResult } from '~/utils/textAnalysis'
import { analyzeGermanText } from '~/utils/textAnalysis'

interface Props {
  topic: WritingExercise
  initialContent?: string
  submitted?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [content: string, wordCount: number, timeSpent: number]
  saveDraft: [content: string, wordCount: number]
  finish: []
}>()

const content = ref(props.initialContent || '')
const wordCount = ref(0)
const timeSpent = ref(0)
const startTime = ref<number | null>(null)
const showQualityDetails = ref(false)
const realtimeAnalysis = ref<TextAnalysisResult | null>(null)
const autoSaved = ref(false)
let saveTimer: ReturnType<typeof setTimeout> | null = null
let autoSavedTimer: ReturnType<typeof setTimeout> | null = null
let interval: number | null = null

watch(() => props.initialContent, (next) => {
  if (next !== undefined && next !== content.value) {
    content.value = next
    updateWordCount()
  }
})

watch(content, () => {
  if (props.submitted) return
  updateWordCount()
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (content.value.trim()) {
      emit('saveDraft', content.value, wordCount.value)
      showAutoSaved()
    }
  }, 800)
})

const wordCountPercentage = computed(() => {
  const target = Math.max(props.topic.wordCount.max, 1)
  return Math.min(100, Math.round((wordCount.value / target) * 100))
})

const isSubmittable = computed(() => {
  return wordCount.value >= props.topic.wordCount.min
    && wordCount.value <= props.topic.wordCount.max
    && content.value.trim().length > 0
})

const wordCountColor = computed(() => {
  if (wordCount.value === 0) return 'text-base-content/60'
  if (wordCount.value < props.topic.wordCount.min) return 'text-base-content'
  if (wordCount.value > props.topic.wordCount.max) return 'text-warning'
  return 'text-success'
})

const progressBarColor = computed(() => {
  if (wordCount.value > props.topic.wordCount.max) return 'progress-warning'
  if (wordCount.value >= props.topic.wordCount.min) return 'progress-success'
  return 'progress-primary'
})

const wordCountStatus = computed(() => {
  if (wordCount.value === 0) return 'Start writing...'
  if (wordCount.value < props.topic.wordCount.min) return `${props.topic.wordCount.min - wordCount.value} more words needed`
  if (wordCount.value > props.topic.wordCount.max) return `${wordCount.value - props.topic.wordCount.max} words over limit`
  return 'Good length for this task'
})

const textareaClasses = computed(() => {
  if (wordCount.value > props.topic.wordCount.max) return 'border-warning'
  if (wordCount.value >= props.topic.wordCount.min) return 'border-success'
  return 'border-base-300'
})

const structureIndicatorColor = computed(() => {
  if (!realtimeAnalysis.value) return 'badge-ghost'
  const score = realtimeAnalysis.value.structureElements.structureScore
  if (score >= 4) return 'badge-success'
  if (score >= 3) return 'badge-warning'
  return 'badge-error'
})

const vocabularyIndicatorColor = computed(() => {
  if (!realtimeAnalysis.value) return 'badge-ghost'
  const diversity = realtimeAnalysis.value.vocabularyMetrics.vocabularyDiversity
  if (diversity >= 0.7) return 'badge-success'
  if (diversity >= 0.5) return 'badge-warning'
  return 'badge-error'
})

const lengthIndicatorColor = computed(() => {
  if (wordCount.value >= props.topic.wordCount.min && wordCount.value <= props.topic.wordCount.max) return 'badge-success'
  if (wordCount.value >= props.topic.wordCount.min * 0.8) return 'badge-warning'
  return 'badge-error'
})

const analysisStats = computed(() => {
  if (!realtimeAnalysis.value) return []
  return [
    { label: 'Sentences', value: realtimeAnalysis.value.sentenceCount },
    { label: 'Paragraphs', value: realtimeAnalysis.value.structureElements.paragraphCount },
    { label: 'Variety', value: `${Math.round(realtimeAnalysis.value.vocabularyMetrics.vocabularyDiversity * 100)}%` },
    { label: 'Connectors', value: realtimeAnalysis.value.vocabularyMetrics.commonConnectors.length },
  ]
})

onMounted(() => {
  startTime.value = Date.now()
  updateWordCount()
  interval = setInterval(() => {
    if (startTime.value) {
      timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
    }
  }, 1000) as unknown as number
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  if (saveTimer) clearTimeout(saveTimer)
  if (autoSavedTimer) clearTimeout(autoSavedTimer)
})

function updateWordCount() {
  const words = content.value.trim().split(/\s+/).filter(word => word.length > 0)
  wordCount.value = content.value.trim() === '' ? 0 : words.length
  if (content.value.trim().length > 20) {
    try {
      realtimeAnalysis.value = analyzeGermanText(content.value, props.topic)
    } catch (error) {
      console.warn('Real-time analysis failed:', error)
    }
  } else {
    realtimeAnalysis.value = null
  }
}

function showAutoSaved() {
  autoSaved.value = true
  if (autoSavedTimer) clearTimeout(autoSavedTimer)
  autoSavedTimer = setTimeout(() => {
    autoSaved.value = false
  }, 3500)
}

function clearContent() {
  if (confirm('Are you sure you want to clear all your text?')) {
    content.value = ''
    updateWordCount()
  }
}

function saveDraft() {
  emit('saveDraft', content.value, wordCount.value)
  showAutoSaved()
}

function submitWriting() {
  if (isSubmittable.value) {
    emit('submit', content.value, wordCount.value, timeSpent.value)
  }
}
</script>
