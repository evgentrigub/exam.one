<template>
  <div class="bg-base-100 rounded-box border border-base-300/70 p-5 sm:p-7 h-fit">
    <div class="flex items-center gap-2">
      <ClipboardList :size="14" class="text-base-content/70" aria-hidden="true" />
      <div class="text-sm font-semibold text-base-content/70">{{ $t('writing.formFill.title') }}</div>
      <span class="ml-auto text-xs text-base-content/60">
        <span class="font-mono font-semibold" :class="allFilled ? 'text-success' : ''">{{
          filledCount
        }}</span>
        <span class="text-base-content/50"> / {{ blanks.length }} {{ $t('writing.formFill.filled') }}</span>
      </span>
    </div>

    <!-- The form reads like the paper one: printed rows, and numbered blanks to fill in. -->
    <form
      class="mt-4 rounded-box border border-base-300 overflow-hidden"
      :aria-label="topic.form?.title"
      @submit.prevent="submitForm"
    >
      <div class="bg-base-200/70 border-b border-base-300 px-4 py-3">
        <div class="font-display font-semibold text-[15px]">{{ topic.form?.title }}</div>
      </div>
      <div class="divide-y divide-base-300/70">
        <div
          v-for="row in rows"
          :key="row.label"
          class="grid grid-cols-1 sm:grid-cols-[minmax(8rem,2fr)_minmax(0,3fr)] items-center gap-x-4 gap-y-1.5 px-4 py-3"
          :class="row.field ? 'bg-base-100' : 'bg-base-200/25'"
        >
          <label
            :for="row.field ? inputId(row.field) : undefined"
            class="min-w-0 text-[13px] text-base-content/65 flex items-center gap-2 break-words hyphens-auto"
            :lang="pack.language"
          >
            <span
              v-if="row.field"
              class="w-5 h-5 rounded-full border grid place-items-center text-[10px] font-mono shrink-0 transition-colors"
              :class="
                values[row.field]?.trim()
                  ? 'bg-primary text-primary-content border-primary'
                  : 'border-base-content/30 text-base-content/60'
              "
              aria-hidden="true"
              >{{ row.number }}</span
            >
            {{ row.label }}
          </label>

          <div v-if="!row.field" class="text-[15px] font-medium text-base-content/85">
            {{ row.value }}
          </div>

          <div
            v-else-if="row.options?.length"
            class="flex flex-wrap gap-2"
            role="radiogroup"
            :aria-label="row.label"
          >
            <button
              v-for="option in row.options"
              :key="option"
              type="button"
              role="radio"
              :aria-checked="values[row.field] === option"
              :disabled="submitted"
              class="btn btn-sm rounded-full"
              :class="values[row.field] === option ? 'btn-primary' : 'btn-ghost border border-base-300'"
              @click="setValue(row.field, option)"
            >
              {{ option }}
            </button>
          </div>

          <input
            v-else
            :id="inputId(row.field)"
            :value="values[row.field] ?? ''"
            type="text"
            autocomplete="off"
            :disabled="submitted"
            class="input input-sm w-full text-[15px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            :class="values[row.field]?.trim() ? 'input-success' : 'input-bordered'"
            @input="setValue(row.field, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </form>

    <div class="mt-4">
      <progress
        class="progress w-full h-1.5"
        :class="allFilled ? 'progress-success' : 'progress-primary'"
        :value="filledCount"
        :max="Math.max(blanks.length, 1)"
        :aria-label="$t('writing.formFill.progress')"
      />
    </div>

    <div class="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <button
        v-if="!submitted"
        :disabled="filledCount === 0"
        type="button"
        class="btn btn-ghost btn-sm gap-1.5 flex-1 border border-base-300 rounded-full"
        @click="saveDraft"
      >
        <Save :size="12" aria-hidden="true" />
        {{ $t('writing.formFill.saveDraft') }}
      </button>
      <button
        v-if="!submitted"
        :disabled="!allFilled"
        type="button"
        class="btn btn-primary btn-sm flex-1 gap-1.5 rounded-full"
        @click="submitForm"
      >
        {{ $t('writing.formFill.submit') }}
        <ArrowRight :size="12" aria-hidden="true" />
      </button>
      <button
        v-else
        type="button"
        class="btn btn-primary btn-sm flex-1 gap-1.5 rounded-full"
        @click="emit('finish')"
      >
        <DoorOpen :size="12" aria-hidden="true" />
        {{ $t('writing.formFill.saveAndExit') }}
      </button>
      <div v-if="submitted" class="flex-1 text-center text-sm text-base-content/60">
        {{ $t('writing.formFill.submitted') }}
      </div>
    </div>

    <div
      v-if="autoSaved"
      class="text-[11px] text-success mt-2 flex items-center gap-1"
      aria-live="polite"
    >
      <CheckCircle2 :size="11" aria-hidden="true" />
      {{ $t('writing.formFill.autoSaved') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, CheckCircle2, ClipboardList, DoorOpen, Save } from 'lucide-vue-next'
import type { WritingExercise } from '~/utils/types'
import {
  blankRows,
  countFormWords,
  parseFormValues,
  serializeFormValues,
  type FormValues,
} from '~/utils/writing/formFill'

interface Props {
  topic: WritingExercise
  /** The stored content: the entries as a JSON object keyed by field id. */
  initialContent?: string
  submitted?: boolean
}

const props = defineProps<Props>()

// Same events as the essay editor, so the writing session handles both the same way.
const emit = defineEmits<{
  submit: [content: string, wordCount: number, timeSpent: number]
  saveDraft: [content: string, wordCount: number]
  finish: []
}>()

// Hyphenation of long form labels follows the exam language, not the interface language.
const { pack } = useActivePack()

const AUTOSAVE_MS = 800
const AUTOSAVED_NOTICE_MS = 3500

const values = ref<FormValues>(parseFormValues(props.initialContent))
const startedAt = Date.now()
const autoSaved = ref(false)
let saveTimer: ReturnType<typeof setTimeout> | null = null
let autoSavedTimer: ReturnType<typeof setTimeout> | null = null

const blanks = computed(() => blankRows(props.topic))
/** Every row, with the blanks numbered (1)…(5) as on the paper form. */
const rows = computed(() => {
  let number = 0
  return (props.topic.form?.rows ?? []).map(row => ({
    ...row,
    number: row.field ? ++number : 0,
  }))
})
const filledCount = computed(() => blanks.value.filter(row => values.value[row.field]?.trim()).length)
const allFilled = computed(() => blanks.value.length > 0 && filledCount.value === blanks.value.length)

watch(
  () => props.initialContent,
  next => {
    if (next !== undefined && next !== serializeFormValues(values.value)) {
      values.value = parseFormValues(next)
    }
  }
)

function inputId(field: string): string {
  return `${props.topic.id}-${field}`
}

function setValue(field: string, value: string) {
  if (props.submitted) return
  values.value = { ...values.value, [field]: value }
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (filledCount.value > 0) {
      emit('saveDraft', serializeFormValues(values.value), countFormWords(values.value))
      showAutoSaved()
    }
  }, AUTOSAVE_MS)
}

function showAutoSaved() {
  autoSaved.value = true
  if (autoSavedTimer) clearTimeout(autoSavedTimer)
  autoSavedTimer = setTimeout(() => {
    autoSaved.value = false
  }, AUTOSAVED_NOTICE_MS)
}

function saveDraft() {
  emit('saveDraft', serializeFormValues(values.value), countFormWords(values.value))
  showAutoSaved()
}

function submitForm() {
  if (!allFilled.value || props.submitted) return
  // Only the blank fields are submitted, trimmed, in form order.
  const entries = Object.fromEntries(
    blanks.value.map(row => [row.field, values.value[row.field]?.trim() ?? ''])
  )
  emit(
    'submit',
    serializeFormValues(entries),
    countFormWords(entries),
    Math.floor((Date.now() - startedAt) / 1000)
  )
}

onUnmounted(() => {
  if (saveTimer) clearTimeout(saveTimer)
  if (autoSavedTimer) clearTimeout(autoSavedTimer)
})
</script>
