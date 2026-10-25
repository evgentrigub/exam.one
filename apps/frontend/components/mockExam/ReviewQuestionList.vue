<template>
  <div class="space-y-3">
    <article
      v-for="(question, index) in questions"
      :key="question.id"
      class="rounded-box border border-base-300 p-4"
    >
      <div class="flex gap-3">
        <span class="font-mono text-sm font-semibold text-primary">{{ index + 1 }}.</span>
        <div class="min-w-0 flex-1">
          <div class="font-medium">{{ question.prompt }}</div>
          <div v-if="question.accepted" class="mt-3 space-y-1 text-sm">
            <div
              class="flex items-center gap-2 rounded-field border px-3 py-2"
              :class="
                isGapCorrect(question)
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-error/40 bg-error/10 text-error'
              "
            >
              <Check v-if="isGapCorrect(question)" :size="14" />
              <X v-else :size="14" />
              <span class="font-medium">{{
                typedAnswer(question) || $t('pastExams.notAnswered')
              }}</span>
              <span class="ml-auto text-xs font-semibold">{{ $t('mockExam.yourAnswer') }}</span>
            </div>
            <p v-if="!isGapCorrect(question)" class="text-xs text-base-content/60">
              {{ $t('gapFill.accepted', { answers: question.accepted.join(' / ') }) }}
            </p>
          </div>
          <div v-else class="mt-3 grid gap-2 sm:grid-cols-2">
            <div
              v-for="(option, optionIndex) in question.options"
              :key="`${question.id}-${optionIndex}`"
              class="rounded-field border px-3 py-2 text-sm"
              :class="optionClass(question, optionIndex)"
            >
              {{ option }}
              <span v-if="optionIndex === question.correctIndex" class="ml-1 text-xs font-semibold"
                >· {{ $t('mockExam.correct') }}</span
              >
              <span v-if="answers[question.id] === optionIndex" class="ml-1 text-xs font-semibold"
                >· {{ $t('mockExam.yourAnswer') }}</span
              >
            </div>
          </div>
          <p class="mt-2 text-xs text-base-content/50">{{ question.explanation }}</p>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'
import { isGapAnswerCorrect } from '@exam-one/exam-packs'
import type { ReviewQuestion } from '~/utils/mockExam/review'
import type { ObjectiveAnswers } from '~/utils/gapFill'

const props = defineProps<{
  questions: ReviewQuestion[]
  answers: ObjectiveAnswers
}>()

function typedAnswer(question: ReviewQuestion): string {
  const value = props.answers[question.id]
  return typeof value === 'string' ? value.trim() : ''
}

function isGapCorrect(question: ReviewQuestion): boolean {
  return Boolean(question.accepted && isGapAnswerCorrect(typedAnswer(question), question.accepted))
}

function optionClass(question: ReviewQuestion, optionIndex: number): string {
  if (optionIndex === question.correctIndex) return 'border-success/40 bg-success/10 text-success'
  if (props.answers[question.id] === optionIndex) return 'border-error/40 bg-error/10 text-error'
  return 'border-base-300 bg-base-100 text-base-content/65'
}
</script>
