<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        📊 Progress Dashboard
      </h1>
      <p class="text-gray-600">
        Track your German Reading comprehension progress and performance
      </p>
    </header>

    <!-- Progress Overview -->
    <div class="mb-6 bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Your Progress</h2>
        <ClientOnly>
          <div class="text-sm text-gray-600">
            {{ completedCount }}/{{ germanTexts.length }} texts completed
          </div>
          <template #fallback>
            <div class="text-sm text-gray-600">Loading...</div>
          </template>
        </ClientOnly>
      </div>
      
      <ClientOnly>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            class="bg-green-600 h-3 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${completionPercentage}%` }"
          />
        </div>
        <template #fallback>
          <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div class="bg-gray-400 h-3 rounded-full animate-pulse" style="width: 0%"></div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Progress Overview Cards -->
    <div class="max-w-6xl mx-auto mb-8">
      <ClientOnly>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <!-- Texts Completed -->
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="text-3xl font-bold text-green-600 mb-1">{{ completionPercentage }}% </div>
            <div class="text-sm text-gray-600">Completion Rate</div>
          </div>
          
          <!-- Average Score -->
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div class="text-3xl font-bold text-blue-600 mb-1">{{ stats.averageScore }}%</div>
            <div class="text-sm text-gray-600">Average Score</div>
          </div>
          
          <!-- Best Score -->
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"/>
              </svg>
            </div>
            <div class="text-3xl font-bold text-purple-600 mb-1">{{ stats.bestScore }}%</div>
            <div class="text-sm text-gray-600">Best Score</div>
          </div>
          
          <!-- Total Attempts -->
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
            <div class="text-3xl font-bold text-yellow-600 mb-1">{{ stats.totalAttempts }}</div>
            <div class="text-sm text-gray-600">Total Attempts</div>
          </div>
        </div>
        <template #fallback>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-sm p-6 text-center">
              <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse"></div>
              <div class="h-8 bg-gray-200 rounded mb-1 animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Resume Session Card -->
    <ClientOnly>
      <div v-if="resumeSession" class="max-w-2xl mx-auto mb-8">
        <div class="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-orange-900 mb-1">Resume Your Quiz</h3>
              <p class="text-orange-700">You have an incomplete quiz session. Continue where you left off.</p>
            </div>
            <button 
              class="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              @click="resumeQuiz"
            >
              📚 Resume
            </button>
          </div>
        </div>
      </div>
    </ClientOnly>

    <!-- Recent Activity -->
    <ClientOnly>
      <div v-if="stats.recentActivity.length > 0" class="max-w-4xl mx-auto mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">📈 Recent Activity</h3>
          
          <div class="space-y-4">
            <div
              v-for="activity in stats.recentActivity"
              :key="activity.textId"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
    </ClientOnly>

    <!-- Quick Actions -->
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">🚀 Quick Actions</h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Start Practice -->
          <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer" @click="goToPractice">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900">Continue Practice</h4>
              <p class="text-sm text-gray-600">Start reading and practicing with German texts</p>
            </div>
          </div>

          <!-- View Progress Stats -->
          <div class="flex items-center p-4 border border-gray-200 rounded-lg">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
                       <div>
             <h4 class="font-semibold text-gray-900">Progress Overview</h4>
             <ClientOnly>
               <p class="text-sm text-gray-600">
                 {{ stats.totalTextsCompleted > 0 
                   ? `${stats.totalTextsCompleted} texts completed with ${stats.averageScore}% average` 
                   : 'Start your first quiz to see progress'
                 }}
               </p>
               <template #fallback>
                 <p class="text-sm text-gray-600">Loading progress...</p>
               </template>
             </ClientOnly>
           </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <ClientOnly>
      <div v-if="stats.totalTextsCompleted === 0" class="max-w-2xl mx-auto text-center py-12">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-lineCap="round" stroke-lineJoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Your Dashboard! 🎉
        </h3>
        <p class="text-gray-600 mb-8">
          Start practicing to see your progress statistics and track your improvement over time.
        </p>
        <NuxtLink 
          to="/practice" 
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
          </svg>
          Start Your First Practice
        </NuxtLink>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useProgress } from '~/composables/useProgress'
import { germanTexts } from '~/data/german-texts'

// Page metadata
useHead({
  title: 'Dashboard - German Reading Trainer',
  meta: [
    { name: 'description', content: 'Track your German A2 reading comprehension progress and performance' }
  ]
})

// Progress tracking composable
const { getProgressStats, getSession, isTextCompleted } = useProgress()

const completionPercentage = computed(() => {
  return Math.round((completedCount.value / germanTexts.length) * 100)
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


const completedCount = computed(() => {
  return germanTexts.filter(text => isTextCompleted(text.id)).length
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

function goToPractice() {
  navigateTo('/practice')
}
</script> 