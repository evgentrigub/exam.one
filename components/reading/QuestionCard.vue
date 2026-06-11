<template>
  <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-4 space-y-3">
    <!-- Question header -->
    <div class="flex items-start gap-2">
      <span class="level-pip shrink-0 font-mono">{{ questionNumber }}</span>
      <p class="text-sm font-medium leading-snug">{{ question.question }}</p>
    </div>

    <!-- 2×2 option grid -->
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="(option, i) in question.options"
        :key="i"
        :disabled="isAnswered"
        class="flex items-center gap-2 p-3 rounded-field border text-left text-sm transition-all"
        :class="getOptionClass(i)"
        @click="selectAnswer(i)"
      >
        <span
          class="level-pip shrink-0 font-mono text-xs"
          :class="getLetterPillClass(i)"
        >{{ String.fromCharCode(65 + i) }}</span>
        <span class="leading-snug">{{ option }}</span>
      </button>
    </div>

    <!-- Inline feedback -->
    <div v-if="isAnswered" class="text-xs flex items-start gap-1.5">
      <span :class="isCorrect ? 'text-success' : 'text-error'">
        {{ isCorrect ? 'Correct!' : `Incorrect — correct answer: ${String.fromCharCode(65 + question.correctAnswer)}` }}
      </span>
      <span v-if="question.explanation" class="text-base-content/50">{{ question.explanation }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReadingQuestion } from '~/utils/exercises/reading'

interface Props {
  question: ReadingQuestion
  questionNumber: number
  preAnswered: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  answerSelected: [questionId: string, selectedAnswer: number, isCorrect: boolean]
}>()

const selectedAnswer = ref<number | null>(null)
const isAnswered = ref(false)

onMounted(() => {
  if (props.preAnswered !== null) {
    selectedAnswer.value = props.preAnswered
    isAnswered.value = true
  }
})

const isCorrect = computed(() => selectedAnswer.value === props.question.correctAnswer)

function selectAnswer(index: number) {
  if (isAnswered.value) return
  selectedAnswer.value = index
  isAnswered.value = true
  emit('answerSelected', props.question.id, index, index === props.question.correctAnswer)
}

function getOptionClass(index: number) {
  if (!isAnswered.value) {
    return 'border-base-300 hover:border-primary hover:bg-primary/10 cursor-pointer'
  }
  if (index === props.question.correctAnswer) {
    return 'border-success bg-success/10'
  }
  if (index === selectedAnswer.value && index !== props.question.correctAnswer) {
    return 'border-error bg-error/10'
  }
  return 'border-base-200 opacity-50'
}

function getLetterPillClass(index: number) {
  if (!isAnswered.value) return ''
  if (index === props.question.correctAnswer) return 'bg-success text-success-content border-success'
  if (index === selectedAnswer.value && index !== props.question.correctAnswer) return 'bg-error text-error-content border-error'
  return ''
}
</script>
