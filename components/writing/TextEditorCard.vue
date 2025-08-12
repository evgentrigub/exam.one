<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
    <!-- Card Header -->
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200 rounded-t-xl flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">Your Answer</h2>
            <p class="text-sm text-purple-600">Write your response here</p>
          </div>
        </div>
        
        <!-- Word Counter -->
        <div class="text-right">
          <div class="text-2xl font-bold" :class="wordCountColor">{{ wordCount }}</div>
          <div class="text-xs text-gray-600">
            {{ topic.wordCount.min }}-{{ topic.wordCount.max }} words
          </div>
        </div>
      </div>
    </div>

    <!-- Text Editor -->
    <div class="p-6 flex-1 flex flex-col overflow-y-auto min-h-0">
      <div class="mb-4 flex-1 min-h-0">
        <textarea
          v-model="content"
          class="w-full h-full min-h-[120px] border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
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
            <span class="text-xs font-medium text-gray-700">Wortanzahl-Fortschritt</span>
            <span class="text-xs text-gray-600">{{ wordCountPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="progressBarColor"
              :style="{ width: `${Math.min(wordCountPercentage, 100)}%` }"
            />
          </div>
        </div>

        <!-- Real-time Quality Indicators (Stage 12) -->
        <div v-if="content.trim().length > 20" class="mb-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-700">Schreibqualität</span>
            <button 
              @click="showQualityDetails = !showQualityDetails"
              class="text-xs text-blue-600 hover:text-blue-700"
            >
              {{ showQualityDetails ? 'Weniger' : 'Details' }}
            </button>
          </div>
          
          <!-- Quality Indicators -->
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full mr-2" :class="structureIndicatorColor"></div>
              <span class="text-gray-600">Struktur</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full mr-2" :class="vocabularyIndicatorColor"></div>
              <span class="text-gray-600">Wortschatz</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full mr-2" :class="lengthIndicatorColor"></div>
              <span class="text-gray-600">Länge</span>
            </div>
          </div>

          <!-- Detailed Quality Info -->
          <div v-if="showQualityDetails && realtimeAnalysis" class="mt-2 p-2 bg-gray-50 rounded text-xs">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="font-medium">Sätze:</span> {{ realtimeAnalysis.sentenceCount }}
              </div>
              <div>
                <span class="font-medium">Absätze:</span> {{ realtimeAnalysis.structureElements.paragraphCount }}
              </div>
              <div>
                <span class="font-medium">Wortvielfalt:</span> {{ Math.round(realtimeAnalysis.vocabularyMetrics.vocabularyDiversity * 100) }}%
              </div>
              <div>
                <span class="font-medium">Konnektoren:</span> {{ realtimeAnalysis.vocabularyMetrics.commonConnectors.length }}
              </div>
            </div>
          </div>
        </div>

        <!-- Writing Status -->
        <div class="flex items-center justify-between text-sm">
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
            class="text-red-600 hover:text-red-700 text-xs font-medium transition-colors"
            @click="clearContent"
          >
            Text löschen
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 flex-shrink-0 mt-auto">
        <button
          :disabled="!content.trim()"
          class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="saveDraft"
        >
          Save Draft
        </button>
        <button
          :class="submitButtonClasses"
          :disabled="!isSubmittable"
          class="flex-1 px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          @click="submitWriting"
        >
          <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
onMounted(() => {
  startTime.value = Date.now()
  updateWordCount()
  
  // Update time every second
  const interval = setInterval(() => {
    if (startTime.value) {
      timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
    }
  }, 1000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})

// Computed properties
const wordCountPercentage = computed(() => {
  const target = props.topic.wordCount.min
  return Math.round((wordCount.value / target) * 100)
})

const isSubmittable = computed(() => {
  return wordCount.value >= props.topic.wordCount.min && 
         wordCount.value <= props.topic.wordCount.max &&
         content.value.trim().length > 0
})

// const isSubmittable = computed(() => {
//   return wordCount.value >= 10 && 
//          wordCount.value <= 20 &&
//          content.value.trim().length > 0
// })


const wordCountColor = computed(() => {
  if (wordCount.value < props.topic.wordCount.min) {
    return 'text-red-600'
  } else if (wordCount.value > props.topic.wordCount.max) {
    return 'text-red-600'
  } else {
    return 'text-green-600'
  }
})

const progressBarColor = computed(() => {
  if (wordCount.value < props.topic.wordCount.min) {
    return 'bg-red-400'
  } else if (wordCount.value > props.topic.wordCount.max) {
    return 'bg-red-400'
  } else {
    return 'bg-green-400'
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
    return 'min-h-[150px] border-red-300 focus:ring-red-500 focus:border-red-500'
  } else if (wordCount.value >= props.topic.wordCount.min) {
    return 'min-h-[150px] border-green-300 focus:ring-green-500 focus:border-green-500'
  } else {
    return 'min-h-[150px] border-gray-300 focus:ring-purple-500 focus:border-purple-500'
  }
})

const submitButtonClasses = computed(() => {
  if (isSubmittable.value) {
    return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  } else {
    return 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }
})

// Quality indicator colors (Stage 12)
const structureIndicatorColor = computed(() => {
  if (!realtimeAnalysis.value) return 'bg-gray-300'
  const score = realtimeAnalysis.value.structureElements.structureScore
  if (score >= 4) return 'bg-green-500'
  if (score >= 3) return 'bg-yellow-500'
  return 'bg-red-500'
})

const vocabularyIndicatorColor = computed(() => {
  if (!realtimeAnalysis.value) return 'bg-gray-300'
  const diversity = realtimeAnalysis.value.vocabularyMetrics.vocabularyDiversity
  if (diversity >= 0.7) return 'bg-green-500'
  if (diversity >= 0.5) return 'bg-yellow-500'
  return 'bg-red-500'
})

const lengthIndicatorColor = computed(() => {
  if (wordCount.value >= props.topic.wordCount.min && wordCount.value <= props.topic.wordCount.max) {
    return 'bg-green-500'
  } else if (wordCount.value >= props.topic.wordCount.min * 0.8) {
    return 'bg-yellow-500'
  }
  return 'bg-red-500'
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
