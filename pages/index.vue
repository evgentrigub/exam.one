<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          German A2 Reading Trainer
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Master German reading comprehension with authentic A2-level texts. 
          Practice with exam-style questions and track your progress.
        </p>
      </header>

      <!-- Progress Overview -->
      <div v-if="stats.totalTextsCompleted > 0" class="max-w-6xl mx-auto mb-12">
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Your Progress Overview 📊</h2>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <!-- Texts Completed -->
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-3xl font-bold text-green-600 mb-1">{{ stats.totalTextsCompleted }}</div>
              <div class="text-sm text-gray-600">Texts Completed</div>
            </div>
            
            <!-- Average Score -->
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-3xl font-bold text-blue-600 mb-1">{{ stats.averageScore }}%</div>
              <div class="text-sm text-gray-600">Average Score</div>
            </div>
            
            <!-- Best Score -->
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-3xl font-bold text-purple-600 mb-1">{{ stats.bestScore }}%</div>
              <div class="text-sm text-gray-600">Best Score</div>
            </div>
            
            <!-- Total Attempts -->
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <div class="text-3xl font-bold text-yellow-600 mb-1">{{ stats.totalAttempts }}</div>
              <div class="text-sm text-gray-600">Total Attempts</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Start Practice Card -->
          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div class="text-center">
              <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
                </svg>
              </div>
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">
                Start Reading Practice
              </h2>
              <p class="text-gray-600 mb-6">
                Practice with authentic German texts designed for A2 level learners.
              </p>
              <NuxtLink 
                to="/practice" 
                class="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Begin Practice
              </NuxtLink>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="bg-white rounded-xl shadow-lg p-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">
                Track Progress
              </h2>
              <p class="text-gray-600 mb-6">
                View your learning analytics and identify areas for improvement.
              </p>
              
              <!-- Resume Session Button -->
              <div v-if="resumeSession" class="mb-4">
                <button 
                  class="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors mb-2"
                  @click="resumeQuiz"
                >
                  📚 Resume Quiz
                </button>
                <p class="text-sm text-gray-600">Continue where you left off</p>
              </div>
              
              <!-- Progress Stats or Getting Started -->
              <div v-if="stats.totalTextsCompleted > 0">
                <div class="text-lg font-semibold text-secondary-700 mb-2">
                  {{ stats.totalTextsCompleted }} {{ stats.totalTextsCompleted === 1 ? 'Text' : 'Texts' }} Completed 🎉
                </div>
                <div class="text-sm text-gray-600">
                  {{ stats.averageScore }}% Average Score
                </div>
              </div>
              <div v-else>
                <div class="text-lg font-medium text-gray-700 mb-2">
                  Ready to start? 🚀
                </div>
                <div class="text-sm text-gray-600">
                  Complete your first quiz to see progress stats
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div v-if="stats.recentActivity.length > 0" class="mt-12">
          <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">Recent Activity 📈</h3>
            
            <div class="space-y-4">
              <div
                v-for="activity in stats.recentActivity"
                :key="activity.textId"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <div 
                    class="w-12 h-12 rounded-full flex items-center justify-center"
                    :class="getScoreColor(activity.percentage)"
                  >
                    <span class="text-white font-bold">{{ activity.score }}</span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">
                      Text {{ activity.textId }}
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ activity.percentage }}% • {{ formatDate(activity.completedAt) }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">
                    {{ activity.attemptCount || 1 }} {{ (activity.attemptCount || 1) === 1 ? 'attempt' : 'attempts' }}
                  </div>
                  <div v-if="activity.bestScore && activity.bestScore > activity.score" class="text-xs text-green-600">
                    Best: {{ Math.round((activity.bestScore / activity.totalQuestions) * 100) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="mt-16">
          <h3 class="text-2xl font-semibold text-center text-gray-900 mb-8">
            Why Choose Our Trainer?
          </h3>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center p-6">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">Authentic Texts</h4>
              <p class="text-sm text-gray-600">Real German texts matching A2 exam format</p>
            </div>
            <div class="text-center p-6">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">Instant Feedback</h4>
              <p class="text-sm text-gray-600">Get immediate results and explanations</p>
            </div>
            <div class="text-center p-6">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">Progress Tracking</h4>
              <p class="text-sm text-gray-600">Monitor improvement over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProgress } from '~/composables/useProgress'

// Progress tracking composable
const { getProgressStats, getSession } = useProgress()

// Page metadata
useHead({
  title: 'German A2 Reading Trainer - Home',
  meta: [
    { name: 'description', content: 'Practice German A2 reading comprehension with authentic exam-style texts' }
  ]
})

// Reactive data
const stats = ref(getProgressStats())
const resumeSession = ref(null)

// Check for incomplete session on mount
onMounted(() => {
  // Refresh stats when component mounts
  stats.value = getProgressStats()
  
  // Check for resume session
  const session = getSession()
  if (session) {
    resumeSession.value = session
  }
})

// Methods
function getScoreColor(percentage: number): string {
  if (percentage >= 75) return 'bg-green-500'
  if (percentage >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Today'
  if (diffDays === 2) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays - 1} days ago`
  
  return date.toLocaleDateString()
}

function resumeQuiz() {
  if (resumeSession.value) {
    // Navigate to practice page with resume parameter
    navigateTo('/practice?resume=true')
  }
}
</script> 