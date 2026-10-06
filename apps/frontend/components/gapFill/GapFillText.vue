<template>
  <div class="space-y-3 leading-[1.9]" :lang="lang">
    <template v-for="(line, lineIndex) in lines" :key="lineIndex">
      <p v-if="line.length">
        <template v-for="(token, tokenIndex) in line" :key="`${lineIndex}-${tokenIndex}`">
          <span v-if="token.kind === 'text'">{{ token.value }}</span>
          <button
            v-else
            type="button"
            class="mx-0.5 inline-flex items-baseline gap-1 rounded-t border-b-2 px-1.5 align-baseline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="gapClass(token.n)"
            :aria-label="gapAria(token.n)"
            @click="focusGap(token.n)"
          >
            <span class="font-mono text-[10px] font-semibold opacity-70">{{ token.n }}</span>
            <span v-if="answerFor(token.n)" :class="isWrong(token.n) ? 'line-through' : ''">
              {{ answerFor(token.n) }}
            </span>
            <span v-else class="tracking-widest opacity-50">{{ BLANK }}</span>
            <span v-if="isWrong(token.n)" class="font-medium text-success">
              {{ questionFor(token.n)?.accepted?.[0] }}
            </span>
          </button>
        </template>
      </p>
      <div v-else class="h-1" aria-hidden="true" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { isGapAnswerCorrect } from '@exam-one/exam-packs'
import { gapInputId, splitGapLine, type GapQuestion, type ObjectiveAnswers } from '~/utils/gapFill'

const props = withDefaults(
  defineProps<{
    content: string
    questions: readonly GapQuestion[]
    answers: ObjectiveAnswers
    revealed?: boolean
  }>(),
  { revealed: false }
)

/** The empty line an unanswered gap shows. */
const BLANK = '_____'

const { t } = useI18n()
const { pack } = useActivePack()
// The text is in the exam language, whatever the interface language is.
const lang = computed(() => pack.value.language)

const lines = computed(() => props.content.split('\n').map(line => (line.trim() ? splitGapLine(line) : [])))

/** Gap `(n)` is the n-th question. */
function questionFor(n: number): GapQuestion | undefined {
  return props.questions[n - 1]
}

function answerFor(n: number): string {
  const question = questionFor(n)
  const value = question ? props.answers[question.id] : undefined
  return typeof value === 'string' ? value.trim() : ''
}

function isCorrect(n: number): boolean {
  const question = questionFor(n)
  return Boolean(question?.accepted && isGapAnswerCorrect(answerFor(n), question.accepted))
}

function isWrong(n: number): boolean {
  return props.revealed && !isCorrect(n)
}

function gapClass(n: number): string {
  if (props.revealed) return isCorrect(n) ? 'border-success bg-success/15' : 'border-error bg-error/10'
  return answerFor(n)
    ? 'border-primary bg-primary/10 text-base-content hover:bg-primary/20'
    : 'border-dashed border-base-content/30 text-base-content/60 hover:bg-base-200'
}

function gapAria(n: number): string {
  const answer = answerFor(n)
  return answer ? t('gapFill.gapAria', { n, answer }) : t('gapFill.gapEmptyAria', { n })
}

function focusGap(n: number) {
  if (!import.meta.client) return
  const question = questionFor(n)
  if (question) document.getElementById(gapInputId(question.id))?.focus()
}
</script>
