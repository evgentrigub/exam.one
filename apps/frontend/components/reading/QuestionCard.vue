<template>
  <div>
    <!-- Question header -->
    <div class="flex items-baseline gap-2">
      <span class="font-mono text-sm font-semibold text-primary">{{ questionNumber }}.</span>
      <div class="text-[15px] font-semibold leading-snug text-base-content">{{ question.question }}</div>
    </div>

    <!-- 2×2 option grid -->
    <div class="grid sm:grid-cols-2 gap-2 mt-3">
      <button
        v-for="(option, i) in question.options"
        :key="i"
        :disabled="submitted"
        type="button"
        class="group w-full text-left px-4 py-3 rounded-box border transition-all flex items-center gap-3"
        :class="getOptionClass(i)"
        @click="selectAnswer(i)"
      >
        <span
          class="w-5 h-5 rounded-full border grid place-items-center text-[10px] font-mono shrink-0"
          :class="getLetterPillClass(i)"
        >
          <Check v-if="submitted && i === question.correctAnswer" :size="10" />
          <X v-else-if="submitted && selectedAnswer === i && i !== question.correctAnswer" :size="10" />
          <span v-else class="opacity-70">{{ String.fromCharCode(65 + i) }}</span>
        </span>
        <span class="text-sm flex-1 leading-snug">{{ option }}</span>
      </button>
    </div>

    <!-- Inline feedback -->
    <div v-if="submitted" class="mt-3 text-xs flex items-start gap-1.5">
      <span :class="isCorrect ? 'text-success' : 'text-error'">
        {{ isCorrect ? 'Correct!' : `Correct answer: ${String.fromCharCode(65 + question.correctAnswer)}` }}
      </span>
      <span v-if="question.explanation" class="text-base-content/50">{{ question.explanation }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'
import type { ReadingQuestion } from '~/utils/exercises/reading'

interface Props {
  question: ReadingQuestion
  questionNumber: number
  selectedAnswer: number | null
  submitted: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  answerSelected: [questionId: string, selectedAnswer: number]
}>()

const isCorrect = computed(() => props.selectedAnswer === props.question.correctAnswer)

function selectAnswer(index: number) {
  if (props.submitted) return
  emit('answerSelected', props.question.id, index)
}

function getOptionClass(index: number) {
  if (props.submitted && index === props.question.correctAnswer) {
    return 'border-success bg-success/5'
  }
  if (props.submitted && props.selectedAnswer === index && index !== props.question.correctAnswer) {
    return 'border-error bg-error/5'
  }
  if (props.selectedAnswer === index) {
    return 'border-primary bg-primary/5'
  }
  return 'border-base-300 hover:border-base-content/30 bg-base-100'
}

function getLetterPillClass(index: number) {
  if (props.submitted && index === props.question.correctAnswer) return 'border-success bg-success text-success-content'
  if (props.submitted && props.selectedAnswer === index && index !== props.question.correctAnswer) return 'border-error bg-error text-error-content'
  if (props.selectedAnswer === index) return 'border-primary bg-primary text-primary-content'
  return 'border-base-300 bg-base-100'
}
</script>
