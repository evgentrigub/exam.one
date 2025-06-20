<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Reading Practice
            </h1>
            <p class="text-gray-600">
              Choose a text to practice your German reading comprehension
            </p>
          </div>
          <NuxtLink 
            to="/" 
            class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Home
          </NuxtLink>
        </div>
      </header>

      <!-- Practice Content -->
      <div class="max-w-6xl mx-auto">
        <!-- Filter Bar -->
        <div class="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">Texttyp:</label>
              <select 
                v-model="selectedFilter"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Alle Texte</option>
                <option value="email">E-Mail</option>
                <option value="notice">Hinweis</option>
                <option value="article">Artikel</option>
                <option value="advertisement">Anzeige</option>
                <option value="instructions">Anleitung</option>
              </select>
            </div>
            <div class="text-sm text-gray-600">
              {{ filteredTexts.length }} {{ filteredTexts.length === 1 ? 'Text' : 'Texte' }} verfügbar
            </div>
          </div>
        </div>

        <!-- Text Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <TextCard 
            v-for="text in filteredTexts"
            :key="text.id"
            :text="text"
            @start-reading="openReader"
          />
        </div>

        <!-- Empty State -->
        <div v-if="filteredTexts.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Keine Texte gefunden
          </h3>
          <p class="text-gray-600 max-w-md mx-auto">
            Für den ausgewählten Filter sind keine Texte verfügbar. 
            Probieren Sie einen anderen Filter aus.
          </p>
        </div>
      </div>
    </div>

    <!-- Text Reader Modal -->
    <div v-if="selectedText && mode === 'reading'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="max-w-6xl w-full max-h-screen overflow-y-auto">
        <TextReader 
          :text="selectedText"
          @close="closeReader"
          @start-questions="startQuiz"
        />
      </div>
    </div>

    <!-- Quiz Session Modal -->
    <div v-if="selectedText && mode === 'quiz'" class="fixed inset-0 bg-black bg-opacity-50 z-50">
      <QuizSession 
        :text="selectedText"
        @exit="closeQuiz"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { germanTexts } from '~/data/german-texts'
import type { GermanText } from '~/utils/types'
import { useProgress } from '~/composables/useProgress'

// Page metadata
useHead({
  title: 'Reading Practice - German A2 Reading Trainer',
  meta: [
    { name: 'description', content: 'Practice German A2 reading comprehension with authentic texts' }
  ]
})

// Progress composable
const { getSession, clearSession, isTextCompleted, getBestScore } = useProgress()

// Reactive data
const selectedFilter = ref<string>('all')
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
  if (selectedFilter.value === 'all') {
    return germanTexts
  }
  return germanTexts.filter(text => text.textType === selectedFilter.value)
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
</script> 