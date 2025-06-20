<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Quiz Mode - Show questions -->
    <div v-if="!isFinished" class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 mb-1">
                {{ text.title }}
              </h1>
              <p class="text-gray-600">
                {{ getTextTypeLabel(text.textType) }} • {{ text.difficulty }} Level
              </p>
            </div>
            <button
              @click="$emit('exit')"
              class="p-2 hover:bg-white rounded-lg transition-colors"
              aria-label="Quiz beenden"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Question Card -->
        <QuestionCard
          v-if="currentQuestion"
          :question="currentQuestion"
          :current-question-index="currentQuestionIndex"
          :total-questions="questions.length"
          :score="score"
          @answer-selected="handleAnswerSelected"
          @previous="previousQuestion"
          @next="nextQuestion"
          @finish="finishQuiz"
        />
      </div>
    </div>

    <!-- Results Mode - Show final score and summary -->
    <div v-else class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- Results Header -->
          <div class="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-8 text-center">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                 :class="getScoreColor()">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="scorePercentage >= 75" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path v-else-if="scorePercentage >= 50" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Quiz abgeschlossen!
            </h1>
            <p class="text-gray-600">
              {{ text.title }}
            </p>
          </div>

          <!-- Score Summary -->
          <div class="px-6 py-8">
            <div class="text-center mb-8">
              <div class="text-5xl font-bold mb-2" :class="getScoreTextColor()">
                {{ score }}/{{ questions.length }}
              </div>
              <div class="text-2xl font-medium text-gray-700 mb-4">
                {{ scorePercentage }}% richtig
              </div>
              <div class="text-lg text-gray-600">
                {{ getScoreMessage() }}
              </div>
            </div>

            <!-- Detailed Results -->
            <div class="border-t pt-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Detaillierte Ergebnisse
              </h3>
              <div class="space-y-4">
                <div
                  v-for="(result, index) in results"
                  :key="result.questionId"
                  class="flex items-center justify-between p-4 rounded-lg border"
                  :class="result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
                >
                  <div class="flex items-center space-x-4">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center"
                         :class="result.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'">
                      <svg v-if="result.isCorrect" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">
                        Frage {{ index + 1 }}
                      </div>
                                             <div class="text-sm text-gray-600">
                         {{ questions[index]?.question }}
                       </div>
                     </div>
                   </div>
                   <div class="text-right">
                     <div class="text-sm text-gray-600">
                       Ihre Antwort: {{ String.fromCharCode(65 + result.selectedAnswer) }}
                     </div>
                     <div v-if="!result.isCorrect" class="text-sm text-gray-600">
                       Richtig: {{ String.fromCharCode(65 + (questions[index]?.correctAnswer ?? 0)) }}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
              <button
                @click="restartQuiz"
                class="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Nochmal versuchen
              </button>
              <button
                @click="$emit('exit')"
                class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Zurück zur Übersicht
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GermanText, Question } from '~/utils/types'

interface Props {
  text: GermanText
}

interface QuizResult {
  questionId: string
  selectedAnswer: number
  isCorrect: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  exit: []
}>()

// Reactive state
const currentQuestionIndex = ref(0)
const score = ref(0)
const isFinished = ref(false)
const results = ref<QuizResult[]>([])

// Computed properties
const questions = computed(() => props.text.questions || [])
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const scorePercentage = computed(() => Math.round((score.value / questions.value.length) * 100))

// Text type labels
const textTypeLabels = {
  email: 'E-Mail',
  notice: 'Hinweis',
  article: 'Artikel',
  advertisement: 'Anzeige',
  instructions: 'Anleitung',
  announcement: 'Ankündigung'
}

// Methods
function getTextTypeLabel(type: string) {
  return textTypeLabels[type as keyof typeof textTypeLabels] || type
}

function handleAnswerSelected(questionId: string, selectedAnswer: number, isCorrect: boolean) {
  // Record the result
  results.value.push({
    questionId,
    selectedAnswer,
    isCorrect
  })
  
  // Update score
  if (isCorrect) {
    score.value++
  }
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

function finishQuiz() {
  isFinished.value = true
  
  // Save to local storage for progress tracking
  const progress = {
    textId: props.text.id,
    completed: true,
    score: score.value,
    totalQuestions: questions.value.length,
    percentage: scorePercentage.value,
    completedAt: new Date().toISOString()
  }
  
  // Store in localStorage
  const existingProgress = JSON.parse(localStorage.getItem('quiz-progress') || '{}')
  existingProgress[props.text.id] = progress
  localStorage.setItem('quiz-progress', JSON.stringify(existingProgress))
}

function restartQuiz() {
  currentQuestionIndex.value = 0
  score.value = 0
  isFinished.value = false
  results.value = []
}

function getScoreColor() {
  if (scorePercentage.value >= 75) return 'bg-green-500 text-white'
  if (scorePercentage.value >= 50) return 'bg-yellow-500 text-white'
  return 'bg-red-500 text-white'
}

function getScoreTextColor() {
  if (scorePercentage.value >= 75) return 'text-green-600'
  if (scorePercentage.value >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreMessage() {
  if (scorePercentage.value >= 90) return 'Ausgezeichnet! Perfekte Leistung! 🎉'
  if (scorePercentage.value >= 75) return 'Sehr gut! Weiter so! 👏'
  if (scorePercentage.value >= 50) return 'Gut gemacht! Noch etwas Übung und es wird perfekt! 💪'
  return 'Nicht aufgeben! Übung macht den Meister! 📚'
}
</script> 