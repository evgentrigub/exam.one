<template>
  <div>
    <!-- Question header -->
    <div class="flex items-baseline gap-2">
      <span class="font-mono text-sm font-semibold text-primary">{{ questionNumber }}.</span>
      <div class="text-[15px] font-semibold leading-snug text-base-content">
        {{ question.question }}
      </div>
    </div>

    <!-- Option bank: the options are listed once above, answered here by letter -->
    <div v-if="compact" class="mt-2.5 flex flex-wrap gap-1.5" role="group">
      <button
        v-for="(option, i) in question.options"
        :key="i"
        :disabled="submitted"
        type="button"
        :aria-label="option"
        :aria-pressed="selectedAnswer === i"
        :title="optionText(option)"
        class="grid h-9 min-w-9 place-items-center rounded-field border px-2 font-mono text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :class="getLetterPillClass(i)"
        @click="selectAnswer(i)"
      >
        {{ optionLetter(option, i) }}
      </button>
    </div>

    <!-- 2×2 option grid -->
    <div v-else class="grid sm:grid-cols-2 gap-2 mt-3">
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
          <Check v-if="submitted && showFeedback && i === question.correctAnswer" :size="10" />
          <X
            v-else-if="
              submitted && showFeedback && selectedAnswer === i && i !== question.correctAnswer
            "
            :size="10"
          />
          <span v-else-if="!trueFalse" class="opacity-70">{{ String.fromCharCode(65 + i) }}</span>
        </span>
        <span class="text-sm flex-1 leading-snug">{{ option }}</span>
      </button>
    </div>

    <!-- Inline feedback -->
    <div v-if="submitted && showFeedback" class="mt-3 text-xs flex items-start gap-1.5">
      <span :class="isCorrect ? 'text-success' : 'text-error'">
        {{
          isCorrect
            ? t('quiz.correct')
            : t('quiz.correctAnswer', { answer: optionLabel(question.correctAnswer) })
        }}
      </span>
      <span v-if="question.explanation" class="text-base-content/50">{{
        question.explanation
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'
import type { ReadingQuestion } from '~/utils/exercises/reading'
import { optionLetter, optionText } from '~/utils/optionBank'

interface Props {
  question: ReadingQuestion
  questionNumber: number
  selectedAnswer: number | null
  submitted: boolean
  showFeedback?: boolean
  /** Richtig / Falsch items: the options are the answer, so no a/b letter is shown. */
  trueFalse?: boolean
  /** The options are shown once in an option bank; answer with letter chips only. */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFeedback: true,
  trueFalse: false,
  compact: false,
})

const { t } = useI18n()

function optionLabel(index: number): string {
  if (props.trueFalse) return props.question.options[index] ?? ''
  return props.compact
    ? optionLetter(props.question.options[index], index)
    : String.fromCharCode(65 + index)
}

const emit = defineEmits<{
  answerSelected: [questionId: string, selectedAnswer: number]
}>()

const isCorrect = computed(() => props.selectedAnswer === props.question.correctAnswer)

function selectAnswer(index: number) {
  if (props.submitted) return
  emit('answerSelected', props.question.id, index)
}

function getOptionClass(index: number) {
  if (props.submitted && props.showFeedback && index === props.question.correctAnswer) {
    return 'border-success bg-success/5'
  }
  if (
    props.submitted &&
    props.showFeedback &&
    props.selectedAnswer === index &&
    index !== props.question.correctAnswer
  ) {
    return 'border-error bg-error/5'
  }
  if (props.selectedAnswer === index) {
    return 'border-primary bg-primary/5'
  }
  return 'border-base-300 hover:border-base-content/30 bg-base-100'
}

function getLetterPillClass(index: number) {
  if (props.submitted && props.showFeedback && index === props.question.correctAnswer)
    return 'border-success bg-success text-success-content'
  if (
    props.submitted &&
    props.showFeedback &&
    props.selectedAnswer === index &&
    index !== props.question.correctAnswer
  )
    return 'border-error bg-error text-error-content'
  if (props.selectedAnswer === index) return 'border-primary bg-primary text-primary-content'
  return props.compact
    ? 'border-base-300 bg-base-100 hover:border-base-content/40 disabled:hover:border-base-300'
    : 'border-base-300 bg-base-100'
}
</script>
