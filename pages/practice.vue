<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          📚 {{ $t('practice.title') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('practice.subtitle') }}
        </p>
      </header>

      <!-- Practice Content -->
      <div v-if="!selectedText" class="max-w-6xl mx-auto">

        <!-- Enhanced Filter and Sort Bar -->
        <div class="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <!-- Filters -->
            <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <!-- Text Type Filter -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Type:</label>
                <select 
                  v-model="selectedTypeFilter"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="email">E-Mail</option>
                  <option value="notice">Notice</option>
                  <option value="article">Article</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="instructions">Instructions</option>
                </select>
              </div>
              
              <!-- Completion Status Filter -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Status:</label>
                <select 
                  v-model="selectedStatusFilter"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Texts</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Not Completed</option>
                </select>
              </div>
            </div>
            
                          <!-- Sort Options -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">{{ $t('practice.sortBy') }}:</label>
                <select 
                  v-model="selectedSort"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="title">{{ $t('practice.titleSort') }}</option>
                  <option value="type">Type</option>
                  <option value="difficulty">{{ $t('practice.difficulty') }}</option>
                  <option value="completion">Completion Status</option>
                  <option value="score">Best Score</option>
                  <option value="wordCount">Word Count</option>
                </select>
              </div>
              
              <!-- Sort Direction -->
              <button
                class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                :title="sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
                @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
              >
                <svg 
                  class="w-4 h-4 text-gray-600 transition-transform"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                </svg>
              </button>
            </div>
            
            <!-- Results Count -->
            <div class="text-sm text-gray-600 whitespace-nowrap">
              {{ filteredAndSortedTexts.length }} {{ filteredAndSortedTexts.length === 1 ? 'text' : 'texts' }} found
            </div>
          </div>
        </div>

        <!-- Text Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <TextCard 
            v-for="text in filteredAndSortedTexts"
            :key="text.id"
            :text="text"
            @start-reading="openReader"
          />
        </div>

        <!-- Enhanced Empty State -->
        <div v-if="filteredAndSortedTexts.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No texts found
          </h3>
          <p class="text-gray-600 max-w-md mx-auto mb-4">
            No texts match your current filters. Try adjusting your search criteria.
          </p>
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="resetFilters"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Inline Text Reading -->
    <div v-if="selectedText && mode === 'reading'" class="max-w-4xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <button 
              @click="closeReader"
              class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              {{ $t('practice.reading.backToSelection') }}
            </button>
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{{ selectedText.textType }}</span>
              <span>A2 • {{ selectedText.wordCount }} Wörter</span>
            </div>
          </div>
        </div>

        <!-- Text Content -->
        <div class="p-8">
          <div class="flex items-center mb-6">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900">{{ selectedText.title }}</h2>
          </div>
          
          <div class="prose prose-lg max-w-none h-[550px] overflow-y-auto border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div class="whitespace-pre-line text-gray-800 leading-relaxed font-medium">{{ selectedText.content }}</div>
          </div>

          <!-- Start Questions Button -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <div class="bg-blue-50 rounded-xl p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">Ready for the questions?</h3>
                    <p class="text-gray-600">Test your text comprehension with {{ selectedText.questions?.length || 4 }} multiple-choice questions.</p>
                  </div>
                </div>
                <button 
                  @click="startQuiz(selectedText.id)"
                  class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                >
                  {{ $t('practice.reading.startQuestions') }}
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Side-by-Side Quiz Layout -->
    <div v-if="selectedText && mode === 'quiz'" class="fixed inset-0 bg-white z-50 overflow-hidden">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <button 
            @click="closeQuiz"
            class="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Exit Quiz
          </button>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ selectedText.textType }} • A2 Level</span>
            <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Quiz Mode
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="h-full flex overflow-hidden" style="height: calc(100vh - 73px)">
        <!-- Text Panel (Left) -->
        <div class="w-1/2 bg-gray-50 border-r border-gray-200">
          <div class="p-6">
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="p-6 border-b border-gray-200">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h2 class="text-xl font-bold text-gray-900">{{ selectedText.title }}</h2>
                </div>
              </div>
              <div class="overflow-y-auto p-6 bg-gray-50">
                <div class="prose max-w-none">
                  <div class="whitespace-pre-line text-gray-800 leading-relaxed">{{ selectedText.content }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Panel (Right) -->
        <div class="w-1/2 bg-white overflow-y-auto">
          <QuizSession 
            :text="selectedText"
            :is-side-by-side="true"
            @exit="closeQuiz"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { germanTexts } from '~/data/german-texts'
import type { GermanText } from '~/utils/types'
import { useProgress } from '~/composables/useProgress'

// Page metadata
useHead({
  title: 'Reading Practice - German Reading Trainer',
  meta: [
    { name: 'description', content: 'Practice German reading comprehension with authentic texts' }
  ]
})

// Progress composable
const { getSession, isTextCompleted, getBestScore } = useProgress()

// Reactive data
const selectedTypeFilter = ref<string>('all')
const selectedStatusFilter = ref<string>('all')
const selectedSort = ref<string>('title')
const sortDirection = ref<'asc' | 'desc'>('asc')
const selectedText = ref<GermanText | null>(null)
const mode = ref<'reading' | 'quiz' | null>(null)

// Check for resume session on mount
onMounted(() => {
  const route = useRoute()
  if (route.query['resume'] === 'true') {
    const session = getSession()
    if (session) {
      const text = germanTexts.find(t => t.id === session.textId)
      if (text) {
        selectedText.value = text
        mode.value = 'quiz'
      }
    }
  }
})

// Computed properties
const filteredTexts = computed(() => {
  let texts = germanTexts
  
  // Filter by text type
  if (selectedTypeFilter.value !== 'all') {
    texts = texts.filter(text => text.textType === selectedTypeFilter.value)
  }
  
  // Filter by completion status
  if (selectedStatusFilter.value === 'completed') {
    texts = texts.filter(text => isTextCompleted(text.id))
  } else if (selectedStatusFilter.value === 'incomplete') {
    texts = texts.filter(text => !isTextCompleted(text.id))
  }
  
  return texts
})

const filteredAndSortedTexts = computed(() => {
  const sortedTexts = [...filteredTexts.value]
  
  sortedTexts.sort((a, b) => {
    let comparison = 0
    
    if (selectedSort.value === 'title') {
      comparison = a.title.localeCompare(b.title)
    } else if (selectedSort.value === 'type') {
      comparison = a.textType.localeCompare(b.textType)
    } else if (selectedSort.value === 'difficulty') {
      comparison = a.difficulty.localeCompare(b.difficulty)
    } else if (selectedSort.value === 'completion') {
      const aCompleted = isTextCompleted(a.id)
      const bCompleted = isTextCompleted(b.id)
      comparison = aCompleted === bCompleted ? 0 : (aCompleted ? -1 : 1)
    } else if (selectedSort.value === 'score') {
      comparison = getBestScore(b.id) - getBestScore(a.id) // Higher scores first
    } else if (selectedSort.value === 'wordCount') {
      comparison = a.wordCount - b.wordCount
    }
    
    return sortDirection.value === 'desc' ? -comparison : comparison
  })

  return sortedTexts
})

// Methods
function openReader(textId: string) {
  const text = germanTexts.find(t => t.id === textId)
  if (text) {
    selectedText.value = text
    mode.value = 'reading'
  }
}

function closeReader() {
  selectedText.value = null
  mode.value = null
}

function startQuiz(textId: string) {
  const text = germanTexts.find(t => t.id === textId)
  if (text && text.questions && text.questions.length > 0) {
    selectedText.value = text
    mode.value = 'quiz'
  }
}

function closeQuiz() {
  selectedText.value = null
  mode.value = null
}

function resetFilters() {
  selectedTypeFilter.value = 'all'
  selectedStatusFilter.value = 'all'
  selectedSort.value = 'title'
  sortDirection.value = 'asc'
}
</script> 