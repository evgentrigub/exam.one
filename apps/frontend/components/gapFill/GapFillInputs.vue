<template>
  <ol class="space-y-3">
    <li
      v-for="(question, index) in questions"
      :key="question.id"
      class="rounded-box border p-3 transition-colors"
      :class="rowClass(question)"
    >
      <label :for="gapInputId(question.id)" class="flex items-center gap-2 text-sm font-medium">
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-xs"
          :class="badgeClass(question)"
        >
          {{ index + 1 }}
        </span>
        <span :lang="lang">{{ question.question || t('gapFill.inputLabel', { n: index + 1 }) }}</span>
        <template v-if="revealed && showFeedback">
          <Check v-if="isCorrect(question)" :size="14" class="ml-auto text-success" />
          <X v-else :size="14" class="ml-auto text-error" />
        </template>
      </label>
      <input
        :id="gapInputId(question.id)"
        type="text"
        class="input input-bordered input-sm mt-2 w-full font-medium"
        :lang="lang"
        :value="valueOf(question.id)"
        :placeholder="t('gapFill.placeholder')"
        :disabled="disabled"
        :aria-invalid="revealed && showFeedback && !isCorrect(question) ? 'true' : undefined"
        autocomplete="off"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        @input="update(question.id, ($event.target as HTMLInputElement).value)"
        @blur="emit('commit')"
      />
      <div v-if="revealed && showFeedback" class="mt-2 space-y-1 text-xs">
        <p v-if="!isCorrect(question)" class="text-base-content/70">
          {{ t('gapFill.accepted', { answers: (question.accepted ?? []).join(' / ') }) }}
        </p>
        <p v-if="question.explanation" class="text-base-content/60">{{ question.explanation }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'
import { isGapAnswerCorrect } from '@exam-one/exam-packs'
import { gapInputId, withTypedAnswer, type GapQuestion, type ObjectiveAnswers } from '~/utils/gapFill'

const props = withDefaults(
  defineProps<{
    questions: readonly GapQuestion[]
    modelValue: ObjectiveAnswers
    disabled?: boolean
    revealed?: boolean
    showFeedback?: boolean
  }>(),
  { disabled: false, revealed: false, showFeedback: true }
)

const emit = defineEmits<{
  'update:modelValue': [value: ObjectiveAnswers]
  /** The learner left an input: a good moment to save a draft. */
  commit: []
}>()

const { t } = useI18n()
const { pack } = useActivePack()
const lang = computed(() => pack.value.language)

function valueOf(id: string): string {
  const value = props.modelValue[id]
  return typeof value === 'string' ? value : ''
}

function update(id: string, value: string) {
  emit('update:modelValue', withTypedAnswer(props.modelValue, id, value))
}

function isCorrect(question: GapQuestion): boolean {
  return Boolean(question.accepted && isGapAnswerCorrect(valueOf(question.id), question.accepted))
}

function rowClass(question: GapQuestion): string {
  if (!props.revealed || !props.showFeedback) return 'border-base-300/70 bg-base-100'
  return isCorrect(question) ? 'border-success/40 bg-success/5' : 'border-error/40 bg-error/5'
}

function badgeClass(question: GapQuestion): string {
  if (props.revealed && props.showFeedback)
    return isCorrect(question) ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
  return valueOf(question.id).trim() ? 'bg-primary/15 text-primary' : 'bg-base-200 text-base-content/60'
}
</script>
