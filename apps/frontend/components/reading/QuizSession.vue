<template>
  <div class="space-y-5">
    <!-- Questions list -->
    <div class="bg-base-100 border border-base-300/70 ring-soft rounded-box p-5 sm:p-7">
      <div class="flex items-center gap-2">
        <h2 class="font-display text-xl font-bold text-base-content">{{ t('reading.questions') }}</h2>
        <span class="ml-auto text-xs text-base-content/60">
          {{ t('reading.answeredCount', { answered: answeredCount, total: questions.length }) }}
        </span>
      </div>
      <p class="text-sm text-base-content/60 mt-1">
        {{ t('reading.quizInstructions') }}
      </p>

      <div class="mt-5 space-y-6">
        <QuestionCard
          v-for="(q, i) in questions"
          :key="q.id"
          :question="q"
          :question-number="i + 1"
          :selected-answer="answeredQuestions[q.id] ?? null"
          :submitted="isFinished"
          :show-feedback="!examMode"
          :true-false="isTrueFalse"
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
              <strong>{{ formatAnswerLabel(result.selectedAnswer, questions[index]?.options) }}</strong>
              · {{ t('quiz.correctLabel') }}
              <strong>{{
                formatAnswerLabel(questions[index]?.correctAnswer ?? 0, questions[index]?.options)
              }}</strong>
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
import type { ReadingExercise } from '~/utils/exercises/reading'
import { useProgress } from '~/composables/useProgress'
import QuestionCard from '~/components/reading/QuestionCard.vue'

interface Props {
  text: ReadingExercise
  examMode?: boolean
  initialAnswers?: Record<string, number | undefined>
}

interface QuizResult {
  questionId: string
  selectedAnswer: number
  isCorrect: boolean
}

const props = withDefaults(defineProps<Props>(), {
  examMode: false,
  initialAnswers: () => ({}),
})

const emit = defineEmits<{
  finish: []
  progress: [payload: { answers: Record<string, number | undefined>; score: number; total: number }]
  examComplete: [
    payload: { answers: Record<string, number | undefined>; score: number; total: number },
  ]
}>()

const { t } = useI18n()
const { saveQuizCompletion, clearSession, saveSession, getSession } = useProgress()

const isFinished = ref(false)
const answeredQuestions = ref<Record<string, number>>({})

const questions = computed(() => props.text.questions || [])
const { partsFor } = useActivePack()
const isTrueFalse = computed(
  () => partsFor('reading').find(part => part.n === props.text.testingPart)?.itemFormat === 'true-false'
)
const answeredCount = computed(() => Object.keys(answeredQuestions.value).length)
const allAnswered = computed(() => questions.value.every(q => q.id in answeredQuestions.value))
const results = computed<QuizResult[]>(() =>
  questions.value.reduce<QuizResult[]>((acc, question) => {
    const selectedAnswer = answeredQuestions.value[question.id]
    if (typeof selectedAnswer !== 'number') return acc
    acc.push({
      questionId: question.id,
      selectedAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
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
      Object.entries(props.initialAnswers).filter(
        (entry): entry is [string, number] => typeof entry[1] === 'number'
      )
    )
    return
  }
  const session = getSession()
  if (session && session.textId === props.text.id) {
    answeredQuestions.value = session.answers || {}
  }
})

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
  isFinished.value = true
  if (props.examMode) {
    emit('examComplete', {
      answers: { ...answeredQuestions.value },
      score: score.value,
      total: questions.value.length,
    })
    return
  }
  saveQuizCompletion(props.text.id, score.value, questions.value.length, { ...answeredQuestions.value })
  clearSession()
}

function saveAndExit() {
  if (!props.examMode) saveSession(props.text.id, 0, answeredQuestions.value)
  emit('finish')
}

function restartQuiz() {
  isFinished.value = false
  answeredQuestions.value = {}
  clearSession()
}

/** A letter for lettered options; the option itself for Richtig / Falsch, which has none. */
function formatAnswerLabel(index: number, options?: readonly string[]) {
  return isTrueFalse.value ? (options?.[index] ?? '') : String.fromCharCode(65 + index)
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
