<template>
  <div class="space-y-5">
    <!-- Questions list -->
    <div class="bg-base-100 border border-base-300/70 ring-soft rounded-box p-5 sm:p-7">
      <div class="flex items-center gap-2">
        <h2 class="font-display text-xl font-bold text-base-content">
          {{ t('reading.questions') }}
        </h2>
        <span class="ml-auto text-xs text-base-content/60">
          {{ t('reading.answeredCount', { answered: answeredCount, total: questions.length }) }}
        </span>
      </div>
      <p class="text-sm text-base-content/60 mt-1">
        {{ isGapFill ? t('reading.gapInstructions') : t('reading.quizInstructions') }}
      </p>

      <GapFillInputs
        v-if="isGapFill"
        class="mt-5"
        :questions="questions"
        :model-value="answeredQuestions"
        :disabled="isFinished"
        :revealed="isFinished"
        :show-feedback="!examMode"
        @update:model-value="handleTypedAnswers"
        @commit="flushDraft"
      />
      <OptionBank
        v-if="bankOptions"
        class="mt-5"
        :options="bankOptions"
        :usage="bankUsage"
        :exclusive="part?.runtime?.reuseOptions === false"
        :repeatable="part?.runtime?.repeatableOptions ?? []"
      />
      <div v-if="!isGapFill" class="mt-5" :class="bankOptions ? 'space-y-5' : 'space-y-6'">
        <QuestionCard
          v-for="(q, i) in questions"
          :id="gapInputId(q.id)"
          :key="q.id"
          tabindex="-1"
          :question="q"
          :question-number="i + 1"
          :selected-answer="choiceOf(q.id)"
          :submitted="isFinished"
          :show-feedback="!examMode"
          :true-false="isTrueFalse"
          :compact="Boolean(bankOptions)"
          @answer-selected="handleAnswerSelected"
        />
      </div>

      <!-- Submit row -->
      <div
        class="mt-7 pt-5 border-t border-base-300/70 flex items-center gap-3 flex-wrap sm:flex-nowrap"
      >
        <button class="btn btn-ghost btn-sm" @click="saveAndExit">
          {{ examMode ? t('reading.backToModule') : t('writing.formFill.saveAndExit') }}
        </button>
        <button
          v-if="!isFinished"
          class="btn btn-primary btn-sm flex-1 gap-1"
          :disabled="!allAnswered"
          @click="finishQuiz"
        >
          {{ t('reading.submitAnswers') }}
          <ArrowRight :size="12" />
        </button>
        <div v-else-if="!examMode" class="flex-1 flex items-center gap-3 flex-wrap">
          <div class="text-sm">
            {{ t('quiz.scoreLabel') }}
            <b class="font-mono" :class="getScoreTextColor()"
              >{{ score }} / {{ questions.length }}</b
            >
            · {{ scorePercentage }}%
          </div>
          <button class="btn btn-outline btn-sm gap-1 sm:ml-auto" @click="restartQuiz">
            <RotateCcw :size="12" />
            {{ t('generation.retry') }}
          </button>
          <button class="btn btn-primary btn-sm gap-1" @click="$emit('finish')">
            {{ t('quiz.back') }}
            <ArrowRight :size="12" />
          </button>
        </div>
      </div>
    </div>

    <!-- Results screen -->
    <div
      v-if="isFinished && !examMode"
      class="bg-base-100 border border-base-300/70 ring-soft rounded-box overflow-hidden"
    >
      <!-- Score header -->
      <div class="p-6 text-center border-b border-base-300">
        <div
          class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
          :class="getScoreColor()"
        >
          <CircleCheck v-if="scorePercentage >= 75" :size="32" />
          <Info v-else-if="scorePercentage >= 50" :size="32" />
          <CircleAlert v-else :size="32" />
        </div>
        <div class="text-3xl font-bold font-mono mb-1" :class="getScoreTextColor()">
          {{ score }}/{{ questions.length }}
        </div>
        <div class="text-sm text-base-content/60">
          {{ t('quiz.percentCorrect', { percent: scorePercentage, message: getScoreMessage() }) }}
        </div>
      </div>

      <!-- Result rows -->
      <div class="divide-y divide-base-200">
        <div
          v-for="(result, index) in results"
          :key="result.questionId"
          class="flex items-start gap-3 p-4"
        >
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            :class="result.isCorrect ? 'bg-success/20 text-success' : 'bg-error/20 text-error'"
          >
            <Check v-if="result.isCorrect" :size="14" />
            <X v-else :size="14" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-base-content/60 mb-0.5">
              {{ t('quiz.question') }} {{ index + 1 }}
            </p>
            <p class="text-sm">{{ questions[index]?.question }}</p>
            <p v-if="!result.isCorrect" class="text-xs text-base-content/50 mt-1">
              {{ t('quiz.yourAnswer') }}
              <strong>{{ answerLabel(result.selectedAnswer, questions[index]) }}</strong>
              · {{ t('quiz.correctLabel') }}
              <strong>{{ correctLabel(questions[index]) }}</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-4 border-t border-base-300 flex gap-3 flex-wrap sm:flex-nowrap">
        <button class="btn btn-primary flex-1" @click="restartQuiz">
          {{ t('quiz.tryAgain') }}
        </button>
        <button class="btn btn-ghost flex-1" @click="$emit('finish')">
          {{ t('quiz.backToExercises') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Check, CircleAlert, CircleCheck, Info, RotateCcw, X } from 'lucide-vue-next'
import { isGapAnswerCorrect } from '@exam-one/exam-packs'
import type { ReadingExercise, ReadingQuestion } from '~/utils/exercises/reading'
import { useProgress } from '~/composables/useProgress'
import QuestionCard from '~/components/reading/QuestionCard.vue'
import OptionBank from '~/components/reading/OptionBank.vue'
import GapFillInputs from '~/components/gapFill/GapFillInputs.vue'
import { gapInputId, type ObjectiveAnswer, type ObjectiveAnswers } from '~/utils/gapFill'
import { optionLetter, optionUsage, sharedOptions } from '~/utils/optionBank'

interface Props {
  text: ReadingExercise
  examMode?: boolean
  initialAnswers?: ObjectiveAnswers
}

interface QuizResult {
  questionId: string
  selectedAnswer: ObjectiveAnswer
  isCorrect: boolean
}

/** Typing saves the draft after a short pause, not on every keystroke. */
const DRAFT_DEBOUNCE_MS = 500

const props = withDefaults(defineProps<Props>(), {
  examMode: false,
  initialAnswers: () => ({}),
})

const emit = defineEmits<{
  finish: []
  progress: [payload: { answers: ObjectiveAnswers; score: number; total: number }]
  examComplete: [payload: { answers: ObjectiveAnswers; score: number; total: number }]
  /** Gap-fill parts: the typed answers, for the gapped text beside the questions. */
  gapState: [payload: { answers: ObjectiveAnswers; revealed: boolean }]
}>()

const { t } = useI18n()
const { saveQuizCompletion, clearSession, saveSession, getSession } = useProgress()

const isFinished = ref(false)
const answeredQuestions = ref<ObjectiveAnswers>({})

const questions = computed(() => props.text.questions || [])
const { partsFor } = useActivePack()
const part = computed(() => partsFor('reading').find(item => item.n === props.text.testingPart))
const itemFormat = computed(() => part.value?.itemFormat)
const isTrueFalse = computed(() => itemFormat.value === 'true-false')
const isGapFill = computed(() => itemFormat.value === 'gap-fill')
/** The shared bank of an `optionBank` part; a payload whose options differ keeps the grid. */
const bankOptions = computed(() => (part.value?.optionBank ? sharedOptions(questions.value) : null))
const bankUsage = computed(() => optionUsage(questions.value, answeredQuestions.value))

/** A choice is an index; a typed gap counts once it is not blank. */
function isAnswered(value: ObjectiveAnswer | undefined): value is ObjectiveAnswer {
  return typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')
}
function choiceOf(questionId: string): number | null {
  const value = answeredQuestions.value[questionId]
  return typeof value === 'number' ? value : null
}

const answeredCount = computed(
  () => questions.value.filter(q => isAnswered(answeredQuestions.value[q.id])).length
)
const allAnswered = computed(() =>
  questions.value.every(q => isAnswered(answeredQuestions.value[q.id]))
)
const results = computed<QuizResult[]>(() =>
  questions.value.reduce<QuizResult[]>((acc, question) => {
    const selectedAnswer = answeredQuestions.value[question.id]
    if (!isAnswered(selectedAnswer)) return acc
    acc.push({
      questionId: question.id,
      selectedAnswer,
      isCorrect: question.accepted
        ? isGapAnswerCorrect(selectedAnswer, question.accepted)
        : selectedAnswer === question.correctAnswer,
    })
    return acc
  }, [])
)
const score = computed(() => results.value.filter(result => result.isCorrect).length)
const scorePercentage = computed(() =>
  questions.value.length ? Math.round((score.value / questions.value.length) * 100) : 0
)

onMounted(() => {
  if (props.examMode) {
    answeredQuestions.value = Object.fromEntries(
      Object.entries(props.initialAnswers).filter((entry): entry is [string, ObjectiveAnswer] =>
        isAnswered(entry[1])
      )
    )
    return
  }
  const session = getSession()
  if (session && session.textId === props.text.id) {
    answeredQuestions.value = session.answers || {}
  }
})

let draftTimer: ReturnType<typeof setTimeout> | undefined

function flushDraft() {
  if (draftTimer === undefined) return
  clearTimeout(draftTimer)
  draftTimer = undefined
  if (!props.examMode && !isFinished.value) saveSession(props.text.id, 0, answeredQuestions.value)
}

function handleTypedAnswers(value: ObjectiveAnswers) {
  answeredQuestions.value = value
  if (props.examMode) {
    emit('progress', { answers: { ...value }, score: score.value, total: questions.value.length })
    return
  }
  if (draftTimer !== undefined) clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    draftTimer = undefined
    saveSession(props.text.id, 0, answeredQuestions.value)
  }, DRAFT_DEBOUNCE_MS)
}

watch(
  [answeredQuestions, isFinished],
  () => {
    if (isGapFill.value || part.value?.choiceGaps)
      emit('gapState', { answers: { ...answeredQuestions.value }, revealed: isFinished.value })
  },
  { immediate: true }
)

onBeforeUnmount(flushDraft)

function handleAnswerSelected(questionId: string, selectedAnswer: number) {
  answeredQuestions.value = {
    ...answeredQuestions.value,
    [questionId]: selectedAnswer,
  }
  if (props.examMode) {
    emit('progress', {
      answers: { ...answeredQuestions.value },
      score: score.value,
      total: questions.value.length,
    })
  } else {
    saveSession(props.text.id, 0, answeredQuestions.value)
  }
}

function finishQuiz() {
  if (!allAnswered.value) return
  if (draftTimer !== undefined) clearTimeout(draftTimer)
  draftTimer = undefined
  isFinished.value = true
  if (props.examMode) {
    emit('examComplete', {
      answers: { ...answeredQuestions.value },
      score: score.value,
      total: questions.value.length,
    })
    return
  }
  saveQuizCompletion(props.text.id, score.value, questions.value.length, {
    ...answeredQuestions.value,
  })
  clearSession()
}

function saveAndExit() {
  if (draftTimer !== undefined) clearTimeout(draftTimer)
  draftTimer = undefined
  if (!props.examMode) saveSession(props.text.id, 0, answeredQuestions.value)
  emit('finish')
}

function restartQuiz() {
  isFinished.value = false
  answeredQuestions.value = {}
  clearSession()
}

/** A letter for lettered options; the option itself for Richtig / Falsch; a gap's own word. */
function formatAnswerLabel(index: number, options?: readonly string[]) {
  if (isTrueFalse.value) return options?.[index] ?? ''
  return bankOptions.value ? optionLetter(options?.[index], index) : String.fromCharCode(65 + index)
}

function answerLabel(answer: ObjectiveAnswer, question?: ReadingQuestion) {
  return typeof answer === 'string' ? answer.trim() : formatAnswerLabel(answer, question?.options)
}

function correctLabel(question?: ReadingQuestion) {
  if (question?.accepted) return question.accepted.join(' / ')
  return formatAnswerLabel(question?.correctAnswer ?? 0, question?.options)
}

function getScoreColor() {
  if (scorePercentage.value >= 75) return 'bg-success text-success-content'
  if (scorePercentage.value >= 50) return 'bg-warning text-warning-content'
  return 'bg-error text-error-content'
}

function getScoreTextColor() {
  if (scorePercentage.value >= 75) return 'text-success'
  if (scorePercentage.value >= 50) return 'text-warning'
  return 'text-error'
}

function getScoreMessage() {
  if (scorePercentage.value >= 90) return t('quiz.excellent')
  if (scorePercentage.value >= 75) return t('quiz.wellDone')
  if (scorePercentage.value >= 50) return t('quiz.keepPracticing')
  return t('quiz.dontGiveUp')
}
</script>
