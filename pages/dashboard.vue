<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-base-content mb-2">
        📊 {{ $t('dashboard.title') }}
      </h1>
      <p class="text-base-content/70">
        {{ $t('dashboard.subtitle') }}
      </p>
    </header>

      <!-- Empty State -->
      <ClientOnly>
      <div v-if="stats.totalTextsCompleted === 0" class="max-w-2xl mx-auto text-center py-12">
        <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-lineCap="round" stroke-lineJoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-base-content mb-4">
          Welcome to Your Dashboard! 🎉
        </h3>
        <p class="text-base-content/70 mb-8">
          Start practicing to see your progress statistics and track your improvement over time.
        </p>
        <NuxtLink 
          to="/reading" 
          class="btn btn-primary gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
          </svg>
          Start Your First Practice
        </NuxtLink>
      </div>
    </ClientOnly>

    <!-- Reading Progress Overview -->
    <div class="mb-6 bg-base-100 rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-base-content">📚 Reading Progress</h2>
        <ClientOnly>
          <div class="text-sm text-base-content/70">
            {{ completedCount }}/{{ germanTexts.length }} texts completed
          </div>
          <template #fallback>
            <div class="text-sm text-base-content/70">Loading...</div>
          </template>
        </ClientOnly>
      </div>
      
      <ClientOnly>
        <progress
          class="progress progress-primary w-full h-3"
          :value="completionPercentage"
          max="100"
        ></progress>
        <template #fallback>
          <progress class="progress progress-primary w-full h-3" value="0" max="100"></progress>
        </template>
      </ClientOnly>
    </div>

    <!-- Writing Progress Overview (Stage 11) -->
    <div class="mb-6 bg-base-100 rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-base-content">✍️ Writing Progress</h2>
        <ClientOnly>
          <div class="text-sm text-base-content/70">
            {{ writingCompletedCount }}/{{ writingTopicsTotal }} topics completed
          </div>
          <template #fallback>
            <div class="text-sm text-base-content/70">Loading...</div>
          </template>
        </ClientOnly>
      </div>
      
      <ClientOnly>
        <progress
          class="progress progress-success w-full h-3"
          :value="Math.round((writingCompletedCount / writingTopicsTotal) * 100)"
          max="100"
        ></progress>
        <template #fallback>
          <progress class="progress progress-success w-full h-3" value="0" max="100"></progress>
        </template>
      </ClientOnly>
    </div>

    <!-- Progress Overview Cards (Stage 11: Extended for Reading + Writing) -->
    <div class="max-w-7xl mx-auto mb-8">
      <!-- Reading Statistics -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-base-content mb-4">📚 Reading Statistics</h3>
        <ClientOnly>
          <div class="stats shadow w-full bg-base-100">
            <!-- Reading Completion Rate -->
            <div class="stat place-items-center">
              <div class="stat-figure text-primary">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="stat-title">Reading Completion</div>
              <div class="stat-value text-primary">{{ completionPercentage }}%</div>
            </div>
            
            <!-- Average Score -->
            <div class="stat place-items-center">
              <div class="stat-figure text-secondary">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <div class="stat-title">Average Score</div>
              <div class="stat-value text-secondary">{{ stats.averageScore }}%</div>
            </div>
            
            <!-- Best Score -->
            <div class="stat place-items-center">
              <div class="stat-figure text-accent">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"/>
                </svg>
              </div>
              <div class="stat-title">Best Score</div>
              <div class="stat-value text-accent">{{ stats.bestScore }}%</div>
            </div>
            
            <!-- Total Reading Attempts -->
            <div class="stat place-items-center">
              <div class="stat-figure text-info">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
              <div class="stat-title">Reading Attempts</div>
              <div class="stat-value text-info">{{ stats.totalAttempts }}</div>
            </div>
          </div>
          <template #fallback>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div v-for="i in 4" :key="i" class="bg-base-100 rounded-xl shadow-sm p-6 text-center">
                <div class="w-12 h-12 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse"></div>
                <div class="h-8 bg-base-200 rounded mb-1 animate-pulse"></div>
                <div class="h-4 bg-base-200 rounded animate-pulse"></div>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Writing Statistics (Stage 11) -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-base-content mb-4">✍️ Writing Statistics</h3>
        <ClientOnly>
          <div class="stats shadow w-full bg-base-100">
            <!-- Writing Completion Rate -->
            <div class="stat place-items-center">
              <div class="stat-figure text-success">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="stat-title">Writing Completion</div>
              <div class="stat-value text-success">{{ writingStats.completionRate }}%</div>
            </div>
            
            <!-- Average Word Count -->
            <div class="stat place-items-center">
              <div class="stat-figure text-accent">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </div>
              <div class="stat-title">Avg Word Count</div>
              <div class="stat-value text-accent">{{ writingStats.averageWordCount }}</div>
            </div>
            
            <!-- Total Topics Completed -->
            <div class="stat place-items-center">
              <div class="stat-figure text-info">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
                </svg>
              </div>
              <div class="stat-title">Topics Completed</div>
              <div class="stat-value text-info">{{ writingStats.totalTopicsCompleted }}</div>
            </div>
            
            <!-- Total Writing Submissions -->
            <div class="stat place-items-center">
              <div class="stat-figure text-warning">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div class="stat-title">Writing Submissions</div>
              <div class="stat-value text-warning">{{ writingStats.totalSubmissions }}</div>
            </div>
          </div>
          <template #fallback>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div v-for="i in 4" :key="i" class="bg-base-100 rounded-xl shadow-sm p-6 text-center">
                <div class="w-12 h-12 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse"></div>
                <div class="h-8 bg-base-200 rounded mb-1 animate-pulse"></div>
                <div class="h-4 bg-base-200 rounded animate-pulse"></div>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Writing Feedback Insights (Stage 12) -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-base-content mb-4">💡 Writing Feedback Insights</h3>
        <ClientOnly>
          <div v-if="writingStats.totalTopicsCompleted > 0" class="stats shadow w-full bg-base-100">
            <!-- Average Quality Score -->
            <div class="stat place-items-center">
              <div class="stat-figure text-secondary">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
              <div class="stat-title">Ø Qualitätsbewertung</div>
              <div class="stat-value text-secondary">{{ averageQualityScore }}/5</div>
            </div>

            <!-- Most Common Feedback -->
            <div class="stat place-items-center">
              <div class="stat-figure text-warning">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div class="stat-title">Häufigster Tipp</div>
              <div class="stat-value text-sm text-warning line-clamp-2">{{ mostCommonFeedback }}</div>
            </div>

            <!-- Progress Trend -->
            <div class="stat place-items-center">
              <div class="stat-figure text-info">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <div class="stat-title">Verbesserungstrend</div>
              <div class="stat-value text-info">{{ progressTrend }}</div>
            </div>
          </div>
          
          <div v-else class="bg-base-200 rounded-lg p-6 text-center">
            <p class="text-base-content/70">Vervollständige deine ersten Schreibaufgaben, um Feedback-Einblicke zu erhalten!</p>
          </div>
          
          <template #fallback>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-base-100 rounded-xl shadow-sm p-6 animate-pulse">
                <div class="w-12 h-12 bg-base-200 rounded-full mx-auto mb-3"></div>
                <div class="h-8 bg-base-200 rounded mb-2"></div>
                <div class="h-4 bg-base-200 rounded"></div>
              </div>
              <div class="bg-base-100 rounded-xl shadow-sm p-6 animate-pulse">
                <div class="w-12 h-12 bg-base-200 rounded-full mx-auto mb-3"></div>
                <div class="h-8 bg-base-200 rounded mb-2"></div>
                <div class="h-4 bg-base-200 rounded"></div>
              </div>
              <div class="bg-base-100 rounded-xl shadow-sm p-6 animate-pulse">
                <div class="w-12 h-12 bg-base-200 rounded-full mx-auto mb-3"></div>
                <div class="h-8 bg-base-200 rounded mb-2"></div>
                <div class="h-4 bg-base-200 rounded"></div>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Resume Session Card -->
    <ClientOnly>
      <div v-if="resumeSession" class="max-w-2xl mx-auto mb-8">
        <div class="alert alert-warning shadow">
          <div class="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-bold">{{ $t('dashboard.resumeSession') }}</h3>
            <p class="text-sm">{{ $t('dashboard.resumeDescription') }}</p>
          </div>
          <button 
            class="btn btn-warning gap-2"
            @click="resumeQuiz"
          >
            📚 {{ $t('dashboard.resume') }}
          </button>
        </div>
      </div>
    </ClientOnly>

    <!-- Recent Activity -->
    <ClientOnly>
      <div v-if="stats.recentActivity.length > 0" class="max-w-4xl mx-auto mb-8">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title">📈 Recent Activity</h3>
            
            <div class="space-y-4">
              <div
                v-for="activity in stats.recentActivity"
                :key="activity.textId"
                class="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div class="flex items-center space-x-4">
                  <div 
                    class="w-12 h-12 rounded-full flex items-center justify-center"
                    :class="getScoreColor(activity.percentage)"
                  >
                    <span class="text-white font-bold">{{ activity.score }}</span>
                  </div>
                  <div>
                    <div class="font-medium">
                      Text {{ activity.textId }}
                    </div>
                    <div class="text-sm opacity-70">
                      {{ activity.percentage }}% • {{ formatDate(activity.completedAt) }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm opacity-70">
                    {{ activity.attemptCount || 1 }} {{ (activity.attemptCount || 1) === 1 ? 'attempt' : 'attempts' }}
                  </div>
                  <div v-if="activity.bestScore && activity.bestScore > activity.score" class="text-xs text-success">
                    Best: {{ Math.round((activity.bestScore / activity.totalQuestions) * 100) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>

    <!-- Quick Actions -->
    <div class="max-w-4xl mx-auto">
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title">🚀 {{ $t('dashboard.quickActions') }}</h3>
          
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Reading Practice -->
            <button class="card bg-base-200 hover:bg-primary/10 hover:border-primary transition-all cursor-pointer border border-base-300" @click="goToReading">
              <div class="card-body flex-row items-center gap-4 p-4">
                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
                  </svg>
                </div>
                <div class="text-left">
                  <h4 class="font-semibold">Reading Practice</h4>
                  <p class="text-sm opacity-70">Practice German reading comprehension</p>
                </div>
              </div>
            </button>

            <!-- Writing Practice (Stage 11) -->
            <button class="card bg-base-200 hover:bg-success/10 hover:border-success transition-all cursor-pointer border border-base-300" @click="goToWriting">
              <div class="card-body flex-row items-center gap-4 p-4">
                <div class="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                </div>
                <div class="text-left">
                  <h4 class="font-semibold">Writing Practice</h4>
                  <p class="text-sm opacity-70">Practice German writing skills</p>
                </div>
              </div>
            </button>

            <!-- View Progress Stats -->
            <div class="card bg-base-200 border border-base-300">
              <div class="card-body flex-row items-center gap-4 p-4">
                <div class="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div class="text-left">
                 <h4 class="font-semibold">Progress Overview</h4>
                 <ClientOnly>
                   <p class="text-sm opacity-70">
                     {{ (stats.totalTextsCompleted + writingStats.totalTopicsCompleted) > 0 
                       ? `${stats.totalTextsCompleted + writingStats.totalTopicsCompleted} activities completed` 
                       : 'Start your first practice session'
                     }}
                   </p>
                   <template #fallback>
                     <p class="text-sm opacity-70">Loading progress...</p>
                   </template>
                 </ClientOnly>
               </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useProgress } from '~/composables/useProgress'
import { useWritingTopics } from '~/composables/useWritingTopics'
import type { WritingProgress, WritingSubmission } from '~/utils/types'
import { germanTexts } from '~/data/german-texts'

// Page metadata
useHead({
  title: 'Dashboard - Exam.one',
  meta: [
    { name: 'description', content: 'Track your reading, writing, listening and speaking progress and performance' }
  ]
})

// Progress tracking composable (Stage 11: Extended for writing)
const { 
  getProgressStats, 
  getSession, 
  isTextCompleted,
  getWritingStats,
  isWritingTopicCompleted,
  getWritingProgressData
} = useProgress()

// Writing topics composable
const { getTopics } = useWritingTopics()

const completionPercentage = computed(() => {
  return Math.round((completedCount.value / germanTexts.length) * 100)
})

// Reactive data (Stage 11: Extended for writing)
const stats = ref(getProgressStats())
const writingStats = ref(getWritingStats())
const resumeSession = ref(null)

// Writing Feedback Insights (Stage 12)
const averageQualityScore = computed(() => {
  const progressData = getWritingProgressData()
  const completedTopics = Object.values(progressData).filter((p: WritingProgress) => p.completed)
  
  if (completedTopics.length === 0) return 0
  
  const scores = completedTopics.flatMap((topic: WritingProgress) => 
    topic.submissions
      .filter((sub: WritingSubmission) => sub.feedback?.overallScore)
      .map((sub: WritingSubmission) => sub.feedback!.overallScore)
  )
  
  if (scores.length === 0) return 0
  
  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
})

const mostCommonFeedback = computed(() => {
  const progressData = getWritingProgressData()
  const allSuggestions = Object.values(progressData)
    .filter((p: WritingProgress) => p.completed)
    .flatMap((topic: WritingProgress) => 
      topic.submissions
        .filter((sub: WritingSubmission) => sub.feedback?.suggestions)
        .flatMap((sub: WritingSubmission) => sub.feedback!.suggestions)
    )
  
  if (allSuggestions.length === 0) return 'Noch keine Verbesserungsvorschläge verfügbar.'
  
  // Count frequency of suggestions
  const suggestionCounts = allSuggestions.reduce((acc: Record<string, number>, suggestion: string) => {
    acc[suggestion] = (acc[suggestion] || 0) + 1
    return acc
  }, {})
  
  // Find most common suggestion
  const mostCommon = Object.entries(suggestionCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]
  
  return mostCommon ? mostCommon[0] : 'Noch keine Verbesserungsvorschläge verfügbar.'
})

const progressTrend = computed(() => {
  const progressData = getWritingProgressData()
  const completedTopics = Object.values(progressData).filter((p: WritingProgress) => p.completed)
  
  if (completedTopics.length < 2) return '📊'
  
  // Get recent scores (last 3 submissions)
  const recentScores = completedTopics
    .flatMap((topic: WritingProgress) => topic.submissions.filter((sub: WritingSubmission) => sub.feedback?.overallScore))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 3)
    .map((sub: WritingSubmission) => sub.feedback!.overallScore)
  
  if (recentScores.length < 2) return '📊'
  
  const latest = recentScores[0]
  const previous = recentScores[recentScores.length - 1]
  
  if (latest && previous) {
    if (latest > previous) return '📈'
    if (latest < previous) return '📉'
  }
  return '➡️'
})

// Check for incomplete session on mount
onMounted(() => {
  // Refresh stats when component mounts
  stats.value = getProgressStats()
  writingStats.value = getWritingStats()
  
  // Check for resume session
  const session = getSession()
  if (session) {
    resumeSession.value = session
  }
})

const completedCount = computed(() => {
  return germanTexts.filter(text => isTextCompleted(text.id)).length
})

const writingCompletedCount = computed(() => {
  return getTopics().filter(topic => isWritingTopicCompleted(topic.id)).length
})

const writingTopicsTotal = computed(() => {
  return getTopics().length
})

// Methods
function getScoreColor(percentage: number): string {
  if (percentage >= 75) return 'bg-success'
  if (percentage >= 50) return 'bg-warning'
  return 'bg-error'
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
    // Navigate to reading page with resume parameter
    navigateTo('/reading?resume=true')
  }
}

function goToReading() {
  navigateTo('/reading')
}

function goToWriting() {
  navigateTo('/writing')
}
</script> 