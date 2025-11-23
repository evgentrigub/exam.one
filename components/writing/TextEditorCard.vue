<template>
  <div class="card bg-base-100 shadow h-full flex flex-col">
    <!-- Card Header -->
    <div class="bg-primary/10 px-6 py-4 border-b flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </div>
          <div>
            <h2 class="card-title text-lg">Your Answer</h2>
            <p class="text-sm text-primary">Write your response here</p>
          </div>
        </div>
        
        <!-- Word Counter -->
        <div class="text-right">
          <div class="text-2xl font-bold" :class="wordCountColor">{{ wordCount }}</div>
          <div class="text-sm text-primary">
            {{ topic.wordCount.min }}-{{ topic.wordCount.max }} words
          </div>
        </div>
      </div>
    </div>

    <!-- Text Editor -->
    <div class="card-body flex-1 flex flex-col overflow-y-auto min-h-0">
      <div class="mb-4 flex-1 min-h-0">
        <textarea
          v-model="content"
          class="textarea textarea-bordered w-full h-full min-h-[120px] resize-none"
          :class="textareaClasses"
          placeholder="Start writing your response here..."
          @input="updateWordCount"
        />
      </div>

      <!-- Writing Progress Indicators -->
      <div class="mb-4">
        <!-- Word Count Progress Bar -->
        <div class="mb-2">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-medium text-base-content opacity-70">Wortanzahl-Fortschritt</span>
            <span class="text-xs text-base-content opacity-60">{{ wordCountPercentage }}%</span>
          </div>
          <progress 
            class="progress w-full"
            :class="progressBarColor"
            :value="wordCountPercentage"
            max="100"
          ></progress>
        </div>

        <!-- Real-time Quality Indicators (Stage 12) -->
        <div v-if="content.trim().length > 20" class="mb-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-base-content opacity-70">Schreibqualität</span>
            <button 
              @click="showQualityDetails = !showQualityDetails"
              class="btn btn-ghost btn-xs"
            >
              {{ showQualityDetails ? 'Weniger' : 'Details' }}
            </button>
          </div>
          
          <!-- Quality Indicators -->
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div class="flex items-center">
              <div class="badge badge-sm mr-2" :class="structureIndicatorColor"></div>
              <span class="text-base-content opacity-70">Struktur</span>
            </div>
            <div class="flex items-center">
              <div class="badge badge-sm mr-2" :class="vocabularyIndicatorColor"></div>
              <span class="text-base-content opacity-70">Wortschatz</span>
            </div>
            <div class="flex items-center">
              <div class="badge badge-sm mr-2" :class="lengthIndicatorColor"></div>
              <span class="text-base-content opacity-70">Länge</span>
            </div>
          </div>

          <!-- Detailed Quality Info -->
          <div v-if="showQualityDetails && realtimeAnalysis" class="stats stats-horizontal shadow mt-2 text-xs">
            <div class="stat px-4 py-2">
              <div class="stat-title text-xs">Sätze</div>
              <div class="stat-value text-lg">{{ realtimeAnalysis.sentenceCount }}</div>
            </div>
            <div class="stat px-4 py-2">
              <div class="stat-title text-xs">Absätze</div>
              <div class="stat-value text-lg">{{ realtimeAnalysis.structureElements.paragraphCount }}</div>
            </div>
            <div class="stat px-4 py-2">
              <div class="stat-title text-xs">Wortvielfalt</div>
              <div class="stat-value text-lg">{{ Math.round(realtimeAnalysis.vocabularyMetrics.vocabularyDiversity * 100) }}%</div>
            </div>
            <div class="stat px-4 py-2">
              <div class="stat-title text-xs">Konnektoren</div>
              <div class="stat-value text-lg">{{ realtimeAnalysis.vocabularyMetrics.commonConnectors.length }}</div>
            </div>
          </div>
        </div>

        <!-- Writing Status -->
        <div class="flex items-center justify-between text-sm">
          <!-- <div class="badge badge-soft gap-2" :class="wordCountColor">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ wordCountStatus }}
          </div> -->
          <div class="flex items-center">
            <span class="flex items-center" :class="wordCountColor">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {{ wordCountStatus }}
            </span>
          </div>
          <button
            v-if="content.trim()"
            class="btn btn-error btn-ghost btn-xs"
            @click="clearContent"
          >
            Text löschen
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card-actions justify-end gap-3 flex-shrink-0 mt-auto">
        <button
          :disabled="!content.trim()"
          class="btn btn-outline flex-1"
          @click="saveDraft"
        >
          Save Draft
        </button>
        <button
          :class="submitButtonClasses"
          :disabled="!isSubmittable"
          class="btn flex-1 gap-2"
          @click="submitWriting"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          Submit Writing
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WritingTopic } from '~/utils/types'
import type { TextAnalysisResult } from '~/utils/textAnalysis'
import { analyzeGermanText } from '~/utils/textAnalysis'

interface Props {
  topic: WritingTopic
  initialContent?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [content: string, wordCount: number, timeSpent: number]
  saveDraft: [content: string, wordCount: number]
}>()

// Reactive state
const content = ref(props.initialContent || '')
const wordCount = ref(0)
const timeSpent = ref(0)
const startTime = ref<number | null>(null)
const showQualityDetails = ref(false)

// Real-time analysis (Stage 12)
const realtimeAnalysis = ref<TextAnalysisResult | null>(null)

// Start timing when component mounts
let interval: number | null = null

onMounted(() => {
  startTime.value = Date.now()
  updateWordCount()
  
  // Update time every second
  interval = setInterval(() => {
    if (startTime.value) {
      timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
    }
  }, 1000) as unknown as number
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})

// Computed properties
const wordCountPercentage = computed(() => {
  const target = props.topic.wordCount.min
  return Math.round((wordCount.value / target) * 100)
})

// Temporary: Submittable if word count is between 10 and 20
// const isSubmittable = computed(() => {
//   return wordCount.value >= props.topic.wordCount.min && 
//          wordCount.value <= props.topic.wordCount.max &&
//          content.value.trim().length > 0
// })

const isSubmittable = computed(() => {
  return wordCount.value >= 10 && 
         wordCount.value <= props.topic.wordCount.max &&
         content.value.trim().length > 0
})

const wordCountColor = computed(() => {
  if (wordCount.value < props.topic.wordCount.min) {
    return 'text-error'
  } else if (wordCount.value > props.topic.wordCount.max) {
    return 'text-error'
  } else {
    return 'text-success'
  }
})

// const wordCountColor = computed(() => {
//   if (wordCount.value < props.topic.wordCount.min) {
//     return 'badge-error'
//   } else if (wordCount.value > props.topic.wordCount.max) {
//     return 'badge-error'
//   } else {
//     return 'badge-success'
//   }
// })

// const wordCountColorText = computed(() => {
//   if (wordCount.value < props.topic.wordCount.min) {
//     return 'text-error'
//   } else if (wordCount.value > props.topic.wordCount.max) {
//     return 'text-error'
//   } else {
//     return 'text-success'
//   }
// })


const progressBarColor = computed(() => {
  if (wordCount.value < props.topic.wordCount.min) {
    return 'progress-error'
  } else if (wordCount.value > props.topic.wordCount.max) {
    return 'progress-error'
  } else {
    return 'progress-success'
  }
})

const wordCountStatus = computed(() => {
  if (wordCount.value === 0) {
    return 'Start writing...'
  } else if (wordCount.value < props.topic.wordCount.min) {
    const needed = props.topic.wordCount.min - wordCount.value
    return `${needed} more words needed`
  } else if (wordCount.value > props.topic.wordCount.max) {
    const excess = wordCount.value - props.topic.wordCount.max
    return `${excess} words over limit`
  } else {
    return 'Perfect length!'
  }
})

const textareaClasses = computed(() => {
  if (wordCount.value > props.topic.wordCount.max) {
    return 'textarea-error'
  } else if (wordCount.value >= props.topic.wordCount.min) {
    return 'textarea-success'
  } else {
    return 'textarea-accent'
  }
})

const submitButtonClasses = computed(() => {
  if (isSubmittable.value) {
    return 'btn-success'
  } else {
    return 'btn-disabled'
  }
})

// Quality indicator colors (Stage 12)
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
  if (wordCount.value >= props.topic.wordCount.min && wordCount.value <= props.topic.wordCount.max) {
    return 'badge-success'
  } else if (wordCount.value >= props.topic.wordCount.min * 0.8) {
    return 'badge-warning'
  }
  return 'badge-error'
})

// Methods
function updateWordCount() {
  // Simple word counting - split by whitespace and filter empty strings
  const words = content.value.trim().split(/\s+/).filter(word => word.length > 0)
  wordCount.value = content.value.trim() === '' ? 0 : words.length
  
  // Real-time analysis for quality indicators (Stage 12)
  if (content.value.trim().length > 20) {
    try {
      realtimeAnalysis.value = analyzeGermanText(content.value, props.topic)
    } catch (error) {
      // Silently fail for real-time analysis to avoid disrupting user experience
      console.warn('Real-time analysis failed:', error)
    }
  } else {
    realtimeAnalysis.value = null
  }
}

function clearContent() {
  if (confirm('Are you sure you want to clear all your text?')) {
    content.value = ''
    updateWordCount()
  }
}

function saveDraft() {
  emit('saveDraft', content.value, wordCount.value)
}

function submitWriting() {
  if (isSubmittable.value) {
    emit('submit', content.value, wordCount.value, timeSpent.value)
  }
}

</script>
