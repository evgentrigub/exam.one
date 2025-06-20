<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <!-- Question Header -->
    <div class="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-600">
            Frage {{ currentQuestionIndex + 1 }} von {{ totalQuestions }}
          </span>
          <div class="w-48 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }"
            />
          </div>
        </div>
        <div v-if="score !== null" class="text-sm font-medium text-primary-700">
          Punkte: {{ score }}/{{ totalQuestions }}
        </div>
      </div>
    </div>

    <!-- Question Content -->
    <div class="p-6 md:p-8">
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-6">
        {{ question.question }}
      </h2>

      <!-- Answer Options -->
      <div class="space-y-3 mb-8">
        <button
          v-for="(option, index) in question.options"
          :key="index"
          :disabled="isAnswered"
          class="w-full p-4 rounded-lg border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="getOptionClass(index)"
          @click="selectAnswer(index)"
        >
          <div class="flex items-center">
            <div
class="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-200"
                 :class="getOptionCircleClass(index)">
              <span class="text-sm font-medium">{{ String.fromCharCode(65 + index) }}</span>
            </div>
            <span class="text-gray-900 font-medium">{{ option }}</span>
            <!-- Feedback Icons -->
            <div v-if="isAnswered" class="ml-auto">
              <svg v-if="index === question.correctAnswer" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <svg v-else-if="index === selectedAnswer && index !== question.correctAnswer" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
          </div>
        </button>
      </div>

      <!-- Feedback Section -->
      <div v-if="isAnswered" class="border-t pt-6">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div v-if="isCorrect" class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div v-else class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-medium mb-2" :class="isCorrect ? 'text-green-900' : 'text-red-900'">
              {{ isCorrect ? 'Richtig!' : 'Nicht richtig' }}
            </h3>
            <p class="text-gray-700 text-sm leading-relaxed">
              {{ question.explanation }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          :disabled="currentQuestionIndex === 0"
          class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="$emit('previous')"
        >
          Zurück
        </button>
        
        <div v-if="!isAnswered" class="text-sm text-gray-500">
          Wählen Sie eine Antwort aus
        </div>
        
        <button
          v-if="currentQuestionIndex < totalQuestions - 1"
          :disabled="!isAnswered"
          class="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="$emit('next')"
        >
          Weiter
        </button>
        
        <button
          v-else
          :disabled="!isAnswered"
          class="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="$emit('finish')"
        >
          Fertig
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '~/utils/types'

interface Props {
  question: Question
  currentQuestionIndex: number
  totalQuestions: number
  score: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  answerSelected: [questionId: string, selectedAnswer: number, isCorrect: boolean]
  previous: []
  next: []
  finish: []
}>()

// Reactive state
const selectedAnswer = ref<number | null>(null)
const isAnswered = ref(false)

// Reset state when question changes
watch(() => props.question.id, () => {
  selectedAnswer.value = null
  isAnswered.value = false
})

// Computed properties
const isCorrect = computed(() => selectedAnswer.value === props.question.correctAnswer)

// Methods
function selectAnswer(index: number) {
  if (isAnswered.value) return
  
  selectedAnswer.value = index
  isAnswered.value = true
  
  const correct = index === props.question.correctAnswer
  emit('answerSelected', props.question.id, index, correct)
}

function getOptionClass(index: number) {
  if (!isAnswered.value) {
    return 'border-gray-300 hover:border-primary-300 hover:bg-primary-50'
  }
  
  if (index === props.question.correctAnswer) {
    return 'border-green-500 bg-green-50'
  }
  
  if (index === selectedAnswer.value && index !== props.question.correctAnswer) {
    return 'border-red-500 bg-red-50'
  }
  
  return 'border-gray-200 bg-gray-50'
}

function getOptionCircleClass(index: number) {
  if (!isAnswered.value) {
    return 'border-gray-400 text-gray-600'
  }
  
  if (index === props.question.correctAnswer) {
    return 'border-green-500 bg-green-500 text-white'
  }
  
  if (index === selectedAnswer.value && index !== props.question.correctAnswer) {
    return 'border-red-500 bg-red-500 text-white'
  }
  
  return 'border-gray-300 text-gray-500'
}
</script> 