<template>
  <div :class="isSideBySide ? 'bg-base-100' : 'card bg-base-100 shadow-xl'">
    <!-- Question Header -->
    <div v-if="!isSideBySide" class="bg-base-200 px-6 py-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-base-content opacity-70">
            {{ $t('quiz.question') }} {{ currentQuestionIndex + 1 }} {{ $t('quiz.of') }} {{ totalQuestions }}
          </span>
          <progress 
            class="progress progress-primary w-48" 
            :value="currentQuestionIndex + 1" 
            :max="totalQuestions"
          />
        </div>
        <div v-if="score !== null" class="text-sm font-medium text-primary">
          {{ $t('quiz.scoreLabel') }} {{ score }}/{{ totalQuestions }}
        </div>
      </div>
    </div>

    <!-- Side-by-side progress bar -->
    <div v-if="isSideBySide" class="mb-6">
      <progress 
        class="progress progress-primary w-full" 
        :value="currentQuestionIndex + 1" 
        :max="totalQuestions"
      />
      <div class="flex justify-between mt-2 text-xs text-base-content opacity-60">
        <span>{{ $t('quiz.question') }} {{ currentQuestionIndex + 1 }}</span>
        <span>{{ totalQuestions }} {{ $t('quiz.total') }}</span>
      </div>
    </div>

    <!-- Question Content -->
    <div :class="isSideBySide ? 'p-0' : 'p-6 md:p-8'">
      <h2 class="text-xl md:text-2xl font-bold text-base-content mb-6">
        {{ question.question }}
      </h2>

      <!-- Answer Options -->
      <div class="space-y-3 mb-8">
        <button
          v-for="(option, index) in question.options"
          :key="index"
          :disabled="isAnswered"
          class="w-full p-4 rounded-lg border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          :class="getOptionClass(index)"
          @click="selectAnswer(index)"
        >
          <div class="flex items-center">
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-200"
              :class="getOptionCircleClass(index)"
            >
              <span class="text-sm font-medium">{{ String.fromCharCode(65 + index) }}</span>
            </div>
            <span class="text-base-content font-medium">{{ option }}</span>
            <!-- Feedback Icons -->
            <div v-if="isAnswered" class="ml-auto">
              <svg v-if="index === question.correctAnswer" class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <svg v-else-if="index === selectedAnswer && index !== question.correctAnswer" class="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
          </div>
        </button>
      </div>

      <!-- Feedback Section -->
      <div v-if="isAnswered" class="border-t pt-6">
        <div :class="isCorrect ? 'alert alert-success alert-soft' : 'alert alert-error alert-soft'">
          <svg v-if="isCorrect" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <div>
            <h3 class="font-bold">
              {{ isCorrect ? $t('quiz.correct') : $t('quiz.incorrect') }}
            </h3>
            <p class="text-sm">
              {{ question.explanation }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          :disabled="currentQuestionIndex === 0"
          class="btn btn-ghost"
          @click="$emit('previous')"
        >
          {{ $t('quiz.previous') }}
        </button>
        
        <div v-if="!isAnswered" class="text-sm text-base-content opacity-60">
          {{ $t('quiz.selectAnswer') }}
        </div>
        
        <button
          v-if="currentQuestionIndex < totalQuestions - 1"
          :disabled="!isAnswered"
          class="btn btn-primary"
          @click="$emit('next')"
        >
          {{ $t('quiz.next') }}
        </button>
        
        <button
          v-else
          :disabled="!isAnswered"
          class="btn btn-success"
          @click="$emit('finish')"
        >
          {{ $t('quiz.finish') }}
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
  isSideBySide?: boolean | undefined
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
    return 'border-base-300 hover:border-primary hover:bg-primary hover:bg-opacity-10'
  }
  
  if (index === props.question.correctAnswer) {
    return 'border-success bg-success bg-opacity-10'
  }
  
  if (index === selectedAnswer.value && index !== props.question.correctAnswer) {
    return 'border-error bg-error bg-opacity-10'
  }
  
  return 'border-base-200 bg-base-200'
}

function getOptionCircleClass(index: number) {
  if (!isAnswered.value) {
    return 'border-base-content border-opacity-40 text-base-content text-opacity-60'
  }
  
  if (index === props.question.correctAnswer) {
    return 'border-success bg-success text-success-content'
  }
  
  if (index === selectedAnswer.value && index !== props.question.correctAnswer) {
    return 'border-error bg-error text-error-content'
  }
  
  return 'border-base-content border-opacity-20 text-base-content text-opacity-50'
}
</script> 