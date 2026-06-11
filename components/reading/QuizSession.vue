<template>
  <div>
    <!-- Questions list -->
    <div v-if="!isFinished" class="space-y-4">
      <QuestionCard
        v-for="(q, i) in questions"
        :key="q.id"
        :question="q"
        :question-number="i + 1"
        :pre-answered="answeredQuestions[q.id] ?? null"
        @answer-selected="handleAnswerSelected"
      />

      <!-- Submit row -->
      <div class="flex items-center justify-between pt-2">
        <span class="text-xs text-base-content/50">
          {{ Object.keys(answeredQuestions).length }} / {{ questions.length }} answered
        </span>
        <button
          class="btn btn-primary"
          :disabled="!allAnswered"
          @click="finishQuiz"
        >
          Submit Quiz
        </button>
      </div>
    </div>

    <!-- Results screen -->
    <div v-else class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
      <!-- Score header -->
      <div class="p-6 text-center border-b border-base-300">
        <div
          class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
          :class="getScoreColor()"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="scorePercentage >= 75" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            <path v-else-if="scorePercentage >= 50" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="text-3xl font-bold font-mono mb-1" :class="getScoreTextColor()">
          {{ score }}/{{ questions.length }}
        </div>
        <div class="text-sm text-base-content/60">{{ scorePercentage }}% correct · {{ getScoreMessage() }}</div>
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
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="result.isCorrect" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-base-content/60 mb-0.5">Question {{ index + 1 }}</p>
            <p class="text-sm">{{ questions[index]?.question }}</p>
            <p v-if="!result.isCorrect" class="text-xs text-base-content/50 mt-1">
              Your answer: <strong>{{ String.fromCharCode(65 + result.selectedAnswer) }}</strong> ·
              Correct: <strong>{{ String.fromCharCode(65 + (questions[index]?.correctAnswer ?? 0)) }}</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-4 border-t border-base-300 flex gap-3">
        <button class="btn btn-primary flex-1" @click="restartQuiz">Try again</button>
        <button class="btn btn-ghost flex-1" @click="$emit('finish')">Back to exercises</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReadingExercise } from '~/utils/exercises/reading'
import { useProgress } from '~/composables/useProgress'
import QuestionCard from './QuestionCard.vue'

interface Props {
  text: ReadingExercise
}

interface QuizResult {
  questionId: string
  selectedAnswer: number
  isCorrect: boolean
}

const props = defineProps<Props>()

defineEmits<{ finish: [] }>()

const { saveQuizCompletion, clearSession, saveSession, getSession } = useProgress()

const score = ref(0)
const isFinished = ref(false)
const results = ref<QuizResult[]>([])
const answeredQuestions = ref<Record<string, number>>({})

onMounted(() => {
  const session = getSession()
  if (session && session.textId === props.text.id) {
    answeredQuestions.value = session.answers || {}
    let restoredScore = 0
    const restoredResults: QuizResult[] = []
    Object.entries(answeredQuestions.value).forEach(([questionId, selectedAnswer]) => {
      const question = questions.value.find(q => q.id === questionId)
      if (question) {
        const isCorrect = selectedAnswer === question.correctAnswer
        if (isCorrect) restoredScore++
        restoredResults.push({ questionId, selectedAnswer, isCorrect })
      }
    })
    score.value = restoredScore
    results.value = restoredResults
  }
})

const questions = computed(() => props.text.questions || [])
const scorePercentage = computed(() => Math.round((score.value / questions.value.length) * 100))
const allAnswered = computed(() => questions.value.every(q => q.id in answeredQuestions.value))

function handleAnswerSelected(questionId: string, selectedAnswer: number, isCorrect: boolean) {
  if (questionId in answeredQuestions.value) return
  results.value.push({ questionId, selectedAnswer, isCorrect })
  if (isCorrect) score.value++
  answeredQuestions.value[questionId] = selectedAnswer
  saveSession(props.text.id, 0, answeredQuestions.value)
}

function finishQuiz() {
  isFinished.value = true
  saveQuizCompletion(props.text.id, score.value, questions.value.length)
  clearSession()
}

function restartQuiz() {
  score.value = 0
  isFinished.value = false
  results.value = []
  answeredQuestions.value = {}
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
  if (scorePercentage.value >= 90) return 'Excellent!'
  if (scorePercentage.value >= 75) return 'Well done!'
  if (scorePercentage.value >= 50) return 'Keep practicing!'
  return "Don't give up!"
}
</script>
