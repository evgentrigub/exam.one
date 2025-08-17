<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          ✍️ Writing Practice
        </h1>
        <p class="text-gray-600">
          Practice German writing with authentic topics and prompts
        </p>
      </header>

      <!-- Resume Writing Session Card (Stage 11) -->
      <div v-if="!selectedTopic && resumeSessions.length > 0" class="max-w-4xl mx-auto mb-8">
        <div class="bg-green-50 border border-green-200 rounded-xl p-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-green-900 mb-1">Resume Writing</h3>
              <p class="text-green-700 text-sm">
                You have {{ resumeSessions.length }} saved {{ resumeSessions.length === 1 ? 'draft' : 'drafts' }}. Continue where you left off!
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="session in resumeSessions.slice(0, 3)"
                  :key="session.topicId"
                  class="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  @click="resumeWriting(session.topicId)"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5l7 7-7 7"/>
                  </svg>
                  {{ getTopicTitle(session.topicId) }}
                </button>
                <button
                  v-if="resumeSessions.length > 3"
                  class="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                  @click="showAllDrafts = !showAllDrafts"
                >
                  {{ showAllDrafts ? 'Show Less' : `+${resumeSessions.length - 3} More` }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

              <!-- Task Part Filter -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Part:</label>
                <select 
                  v-model="selectedTaskPart"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Parts</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
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

    <!-- Three-Card Writing Interface -->
    <div v-if="selectedTopic" class="fixed inset-0 bg-gray-50 z-50 overflow-hidden">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <button 
            class="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium transition-colors"
            @click="closeWritingInterface"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Back to Topics
          </button>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ selectedTopic.topicType }} • A2 Level</span>
            <div class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Writing Mode
            </div>
          </div>
        </div>
      </div>

      <!-- Writing Session Content -->
      <div class="h-full overflow-y-auto" style="height: calc(100vh - 73px)">
        <WritingSession 
          :topic="selectedTopic"
          @exit="closeWritingInterface"
          @complete="handleWritingComplete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { writingTopics } from '../data/writing-topics'
import type { WritingTopic } from '../utils/types'
import { useProgress } from '../composables/useProgress'
import WritingSession from '../components/writing/WritingSession.vue'
import WritingTopicCard from '../components/writing/WritingTopicCard.vue'
import type { WritingSessionModel } from '../composables/useProgress'
import { useWritingReview } from '~/composables/useWritingReview'

// Page metadata
useHead({
  title: 'Writing Practice - German Writing Trainer',
  meta: [
    { name: 'description', content: 'Practice German writing with authentic topics and prompts' }
  ]
})

// Progress tracking composable (Stage 11)
const { 
  isWritingTopicCompleted, 
  // getWritingTopicProgress,
  getAllWritingSessions
} = useProgress()

// Progress functions now using real implementation
const isTopicCompleted = (topicId: string) => isWritingTopicCompleted(topicId)
// const getTopicProgress = (topicId: string) => getWritingTopicProgress(topicId)

// Reactive data
const selectedTypeFilter = ref<string>('all')
const selectedStatusFilter = ref<string>('all')
const selectedTaskPart = ref<string>('all')
const selectedSort = ref<string>('title')
const sortDirection = ref<'asc' | 'desc'>('asc')
const selectedTopic = ref<WritingTopic | null>(null)

// Global settings (exam level)
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)

// Resume functionality (Stage 11)
const resumeSessions = ref<WritingSessionModel[]>([])
const showAllDrafts = ref(false)

// AI review (mocked OpenAI) integration
const { requestReview } = useWritingReview()

// Check for writing drafts on mount
onMounted(() => {
  resumeSessions.value = getAllWritingSessions()
})

// Computed properties
const filteredTopics = computed(() => {
  let topics = writingTopics

  const difficulty = examLevel.value
  topics = topics.filter(topic => topic.difficulty === difficulty)

  // Filter by task part
  if (selectedTaskPart.value !== 'all') {
    topics = topics.filter(topic => topic.testingPart === parseInt(selectedTaskPart.value))
  }
  
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

async function handleWritingComplete(topicId: string, content: string, wordCount: number, timeSpent: number) {
  // Writing submission is already saved in WritingSession component (Stage 11)
  // This function can be used for additional UI updates if needed
  console.log('Writing completed:', {
    topicId,
    content: content.substring(0, 100) + '...', // Log first 100 chars
    wordCount,
    timeSpent
  })
  
  // Refresh resume sessions after completion
  resumeSessions.value = getAllWritingSessions()
  
  // Trigger AI review request (mocked) using topic definition
  const topic = writingTopics.find(t => t.id === topicId)
  if (topic) {
    console.log("🚀 ~ Requesting review for topic:", topic)
    await requestReview(topic as WritingTopic, content)
  }

  // Force reactivity update for completion indicators
  nextTick(() => {
    // The topic cards will automatically show completion status
    // due to reactive progress tracking
  })
}

// Resume functionality methods (Stage 11)
function resumeWriting(topicId: string) {
  const topic = writingTopics.find(t => t.id === topicId)
  if (topic) {
    selectedTopic.value = topic
  }
}

function getTopicTitle(topicId: string): string {
  const topic = writingTopics.find(t => t.id === topicId)
  return topic ? topic.title : 'Unknown Topic'
}
</script>
