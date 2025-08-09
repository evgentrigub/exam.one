<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          ✍️ Writing Practice
        </h1>
        <p class="text-gray-600">
          Practice German writing with authentic A2-level topics and prompts
        </p>
      </header>

      <!-- Writing Topic Selection -->
      <div v-if="!selectedTopic" class="max-w-6xl mx-auto">

        <!-- Enhanced Filter and Sort Bar -->
        <div class="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <!-- Filters -->
            <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <!-- Topic Type Filter -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Type:</label>
                <select 
                  v-model="selectedTypeFilter"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="email">E-Mail</option>
                  <option value="letter">Brief</option>
                  <option value="essay">Aufsatz</option>
                  <option value="form">Formular</option>
                  <option value="postcard">Postkarte</option>
                  <option value="note">Notiz</option>
                </select>
              </div>
              
              <!-- Completion Status Filter -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Status:</label>
                <select 
                  v-model="selectedStatusFilter"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Topics</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Not Completed</option>
                </select>
              </div>
            </div>
            
            <!-- Sort Options -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Sort by:</label>
                <select 
                  v-model="selectedSort"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="title">Title</option>
                  <option value="type">Type</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="time">Time Required</option>
                  <option value="wordCount">Word Count</option>
                  <option value="completion">Completion Status</option>
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
              {{ filteredAndSortedTopics.length }} {{ filteredAndSortedTopics.length === 1 ? 'topic' : 'topics' }} found
            </div>
          </div>
        </div>

        <!-- Topic Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <WritingTopicCard 
            v-for="topic in filteredAndSortedTopics"
            :key="topic.id"
            :topic="topic"
            @start-writing="openWritingInterface"
          />
        </div>

        <!-- Enhanced Empty State -->
        <div v-if="filteredAndSortedTopics.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No topics found
          </h3>
          <p class="text-gray-600 max-w-md mx-auto mb-4">
            No writing topics match your current filters. Try adjusting your search criteria.
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

    <!-- Writing Interface Placeholder (Stage 10) -->
    <div v-if="selectedTopic" class="fixed inset-0 bg-white z-50 overflow-hidden">
      <!-- Temporary placeholder - will be implemented in Stage 10 -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <button 
            @click="closeWritingInterface"
            class="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Back to Topics
          </button>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ selectedTopic.topicType }} • A2 Level</span>
            <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Writing Mode
            </div>
          </div>
        </div>
      </div>

      <!-- Placeholder Content -->
      <div class="h-full flex items-center justify-center" style="height: calc(100vh - 73px)">
        <div class="text-center p-8">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ selectedTopic.title }}</h2>
          <p class="text-gray-600 mb-6 max-w-md">
            Three-card writing interface will be implemented in Stage 10
          </p>
          <div class="bg-blue-50 rounded-lg p-4 max-w-lg mx-auto">
            <p class="text-sm text-blue-800">
              <strong>Coming Soon:</strong> Description card, Instructions card, and Writing editor with word count and submit functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { writingTopics } from '~/data/writing-topics'
import type { WritingTopic } from '~/utils/types'

// Page metadata
useHead({
  title: 'Writing Practice - German Writing Trainer',
  meta: [
    { name: 'description', content: 'Practice German writing with authentic A2-level topics and prompts' }
  ]
})

// Mock progress functions (will be implemented in Stage 11)
const isTopicCompleted = (_topicId: string) => false
const _getTopicProgress = (_topicId: string) => null

// Reactive data
const selectedTypeFilter = ref<string>('all')
const selectedStatusFilter = ref<string>('all')
const selectedSort = ref<string>('title')
const sortDirection = ref<'asc' | 'desc'>('asc')
const selectedTopic = ref<WritingTopic | null>(null)

// Computed properties
const filteredTopics = computed(() => {
  let topics = writingTopics
  
  // Filter by topic type
  if (selectedTypeFilter.value !== 'all') {
    topics = topics.filter(topic => topic.topicType === selectedTypeFilter.value)
  }
  
  // Filter by completion status
  if (selectedStatusFilter.value === 'completed') {
    topics = topics.filter(topic => isTopicCompleted(topic.id))
  } else if (selectedStatusFilter.value === 'incomplete') {
    topics = topics.filter(topic => !isTopicCompleted(topic.id))
  }
  
  return topics
})

const filteredAndSortedTopics = computed(() => {
  const sortedTopics = [...filteredTopics.value]
  
  sortedTopics.sort((a, b) => {
    let comparison = 0
    
    if (selectedSort.value === 'title') {
      comparison = a.title.localeCompare(b.title)
    } else if (selectedSort.value === 'type') {
      comparison = a.topicType.localeCompare(b.topicType)
    } else if (selectedSort.value === 'difficulty') {
      comparison = a.difficulty.localeCompare(b.difficulty)
    } else if (selectedSort.value === 'time') {
      comparison = a.estimatedTime - b.estimatedTime
    } else if (selectedSort.value === 'wordCount') {
      comparison = a.wordCount.min - b.wordCount.min
    } else if (selectedSort.value === 'completion') {
      const aCompleted = isTopicCompleted(a.id)
      const bCompleted = isTopicCompleted(b.id)
      comparison = aCompleted === bCompleted ? 0 : (aCompleted ? -1 : 1)
    }
    
    return sortDirection.value === 'desc' ? -comparison : comparison
  })

  return sortedTopics
})

// Methods
function openWritingInterface(topicId: string) {
  const topic = writingTopics.find(t => t.id === topicId)
  if (topic) {
    selectedTopic.value = topic
  }
}

function closeWritingInterface() {
  selectedTopic.value = null
}

function resetFilters() {
  selectedTypeFilter.value = 'all'
  selectedStatusFilter.value = 'all'
  selectedSort.value = 'title'
  sortDirection.value = 'asc'
}
</script>
