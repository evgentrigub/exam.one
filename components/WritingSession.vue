<template>
  <div class="flex flex-col min-h-full">
    <!-- New Layout: Top row (2 equal cards) + Bottom row (full-width editor) -->
    <div class="max-w-7xl mx-auto w-full p-6 flex-1">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Left: Task Description -->
        <div class="lg:col-span-1 h-full">
          <TaskDescriptionCard :topic="topic" />
        </div>

        <!-- Top Right: Instructions -->
        <div class="lg:col-span-1 h-full">
          <InstructionsCard :topic="topic" />
        </div>

        <!-- Bottom Row: Text Editor (Full Width) -->
        <div class="lg:col-span-2">
          <TextEditorCard 
            :topic="topic"
            :initial-content="currentDraft"
            @submit="handleSubmit"
            @save-draft="handleSaveDraft"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Layout Toggle (for smaller screens) -->
    <div class="lg:hidden fixed bottom-4 right-4 z-10">
      <div class="bg-white rounded-full shadow-lg border border-gray-200">
        <button
          v-for="(tab, index) in mobileTabs"
          :key="tab.id"
          class="p-3 rounded-full transition-colors"
          :class="activeMobileTab === index 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100'"
          :title="tab.label"
          @click="activeMobileTab = index"
        >
          <component :is="tab.icon" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Single Card View -->
    <div class="lg:hidden">
      <div class="p-4">
        <!-- Tab Navigation -->
        <div class="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
          <button
            v-for="(tab, index) in mobileTabs"
            :key="tab.id"
            class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors"
            :class="activeMobileTab === index 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'"
            @click="activeMobileTab = index"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Active Card Content -->
        <div>
          <TaskDescriptionCard v-if="activeMobileTab === 0" :topic="topic" />
          <InstructionsCard v-if="activeMobileTab === 1" :topic="topic" />
          <TextEditorCard 
            v-if="activeMobileTab === 2"
            :topic="topic"
            :initial-content="currentDraft"
            @submit="handleSubmit"
            @save-draft="handleSaveDraft"
          />
        </div>
      </div>
    </div>

    <!-- Results Modal -->
    <div v-if="showResults" class="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Results Header -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Writing Submitted!</h2>
                <p class="text-sm text-green-600">{{ topic.title }}</p>
              </div>
            </div>
            <button 
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="closeResults"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Results Content -->
        <div class="p-6">
          <!-- Writing Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ submissionResults?.wordCount || 0 }}</div>
              <div class="text-sm text-blue-800">Words Written</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">{{ formatTime(submissionResults?.timeSpent || 0) }}</div>
              <div class="text-sm text-green-800">Time Spent</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">A2</div>
              <div class="text-sm text-purple-800">Level</div>
            </div>
          </div>

          <!-- Completion Message -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 class="font-semibold text-green-800 mb-2">Great work!</h3>
            <p class="text-green-700 text-sm">
              You've successfully completed this writing task. Your text has been saved and you can review it anytime in your dashboard.
            </p>
          </div>

          <!-- Next Steps -->
          <div class="flex space-x-3">
            <button
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              @click="tryAnotherTopic"
            >
              Try Another Topic
            </button>
            <button
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              @click="viewDashboard"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WritingTopic } from '~/utils/types'
import { useProgress } from '~/composables/useProgress'

interface Props {
  topic: WritingTopic
}

const props = defineProps<Props>()

const emit = defineEmits<{
  exit: []
  complete: [topicId: string, content: string, wordCount: number, timeSpent: number]
}>()

// Progress tracking composable
const { 
  saveWritingSubmission, 
  saveWritingDraft, 
  getWritingSession, 
  clearWritingSession: _clearWritingSession 
} = useProgress()

// Reactive state
const currentDraft = ref('')
const showResults = ref(false)
const activeMobileTab = ref(0)
const submissionResults = ref<{
  wordCount: number
  timeSpent: number
} | null>(null)

// Mobile tab configuration
const mobileTabs = [
  {
    id: 'description',
    label: 'Task',
    icon: 'svg' // Will be replaced with actual icon component
  },
  {
    id: 'instructions',
    label: 'Instructions',
    icon: 'svg'
  },
  {
    id: 'editor',
    label: 'Write',
    icon: 'svg'
  }
]

// Methods
function handleSaveDraft(content: string, wordCount: number) {
  currentDraft.value = content
  
  // Save draft to localStorage (Stage 11)
  saveWritingDraft(props.topic.id, content, wordCount)
  
  // Show success feedback
  const notification = document.createElement('div')
  notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
  notification.textContent = 'Draft saved!'
  document.body.appendChild(notification)
  
  setTimeout(() => {
    document.body.removeChild(notification)
  }, 2000)
}

function handleSubmit(content: string, wordCount: number, timeSpent: number) {
  submissionResults.value = { wordCount, timeSpent }
  
  // Save writing submission to localStorage (Stage 11)
  saveWritingSubmission(props.topic.id, content, wordCount, timeSpent)
  
  showResults.value = true
  
  // Emit completion event for parent component
  emit('complete', props.topic.id, content, wordCount, timeSpent)
}

function closeResults() {
  showResults.value = false
  submissionResults.value = null
}

function tryAnotherTopic() {
  closeResults()
  emit('exit')
}

function viewDashboard() {
  closeResults()
  navigateTo('/dashboard')
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Load any existing draft on mount
onMounted(() => {
  // Load existing draft from localStorage (Stage 11)
  const existingSession = getWritingSession(props.topic.id)
  if (existingSession) {
    currentDraft.value = existingSession.content
  }
})
</script>
