<template>
  <div class="flex flex-col h-full">
    <!-- Layout: Changes based on writing mode -->
    <div class="max-w-7xl mx-auto w-full p-6 flex-1">
      <!-- Model Help Mode: 2x2 Grid -->
      <div v-if="currentMode === 'model-help'" class="grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-6 min-h-[600px]" style="grid-template-rows: 1fr 1fr; height: max(600px, calc(100vh - 200px));">
        <!-- Top Left: Task Description -->
        <div class="h-full">
          <TaskDescriptionCard 
            :topic="topic" 
            :current-mode="currentMode"
            @mode-change="handleModeChange"
          />
        </div>

        <!-- Top Right: Instructions -->
        <div class="h-full">
          <InstructionsCard 
            :topic="topic" 
            :current-mode="currentMode"
            :timer-display="timerDisplay"
          />
        </div>

        <!-- Bottom Left: Text Editor -->
        <div class="h-full">
          <TextEditorCard 
            :topic="topic"
            :initial-content="currentDraft"
            @submit="handleSubmit"
            @save-draft="handleSaveDraft"
          />
        </div>

        <!-- Bottom Right: Model Answer -->
        <div class="h-full">
          <ModelAnswerCard :topic="topic" />
        </div>
      </div>

      <!-- Quick/Challenge Mode: Original Layout -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Left: Task Description -->
        <div class="lg:col-span-1 h-full">
          <TaskDescriptionCard 
            :topic="topic" 
            :current-mode="currentMode"
            @mode-change="handleModeChange"
          />
        </div>

        <!-- Top Right: Instructions -->
        <div class="lg:col-span-1 h-full">
          <InstructionsCard 
            :topic="topic" 
            :current-mode="currentMode"
            :timer-display="timerDisplay"
          />
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
          <TaskDescriptionCard 
            v-if="activeMobileTab === 0" 
            :topic="topic"
            :current-mode="currentMode"
            @mode-change="handleModeChange"
          />
          <InstructionsCard 
            v-if="activeMobileTab === 1" 
            :topic="topic"
            :current-mode="currentMode"
            :timer-display="timerDisplay"
          />
          <TextEditorCard 
            v-if="activeMobileTab === 2"
            :topic="topic"
            :initial-content="currentDraft"
            @submit="handleSubmit"
            @save-draft="handleSaveDraft"
          />
          <ModelAnswerCard 
            v-if="activeMobileTab === 3 && currentMode === 'model-help'"
            :topic="topic"
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
          <!-- Writing Feedback Component (Stage 12) -->
          <div v-if="submissionResults?.feedback" class="mb-6">
            <WritingFeedback 
              :feedback="submissionResults.feedback"
              :analysis-result="submissionResults.analysisResult"
            />
          </div>

          <!-- Writing Statistics (Basic) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ submissionResults?.wordCount || 0 }}</div>
              <div class="text-sm text-blue-800">Wörter geschrieben</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">{{ formatTime(submissionResults?.timeSpent || 0) }}</div>
              <div class="text-sm text-green-800">Zeit verwendet</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-purple-600">A2</div>
              <div class="text-sm text-purple-800">Niveau</div>
            </div>
          </div>

          <!-- Completion Message -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 class="font-semibold text-green-800 mb-2">Gut gemacht!</h3>
            <p class="text-green-700 text-sm">
              Du hast diese Schreibaufgabe erfolgreich abgeschlossen. Dein Text wurde gespeichert und du kannst ihn jederzeit in deinem Dashboard ansehen.
            </p>
          </div>

          <!-- Next Steps -->
          <div class="flex space-x-3">
            <button
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              @click="tryAnotherTopic"
            >
              Neues Thema versuchen
            </button>
            <button
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              @click="viewDashboard"
            >
              Dashboard anzeigen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WritingTopic, WritingFeedbackModel } from '~/utils/types'
import type { TextAnalysisResult } from '~/utils/textAnalysis'
import { analyzeGermanText, createWritingFeedback } from '~/utils/textAnalysis'
import { useProgress } from '~/composables/useProgress'
import { useWritingMode } from '~/composables/useWritingMode'
import type { WritingMode } from '~/composables/useWritingMode'
import TaskDescriptionCard from './TaskDescriptionCard.vue'
import InstructionsCard from './InstructionsCard.vue'
import TextEditorCard from './TextEditorCard.vue'
import WritingFeedback from './WritingFeedback.vue'
import ModelAnswerCard from './ModelAnswerCard.vue'

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

// Writing mode composable
const {
  currentMode,
  timerDisplay,
  changeMode
} = useWritingMode()

// Reactive state
const currentDraft = ref('')
const showResults = ref(false)
const activeMobileTab = ref(0)
const submissionResults = ref<{
  wordCount: number
  timeSpent: number
  feedback?: WritingFeedbackModel
  analysisResult?: TextAnalysisResult | undefined
} | null>(null)

// Mobile tab configuration (dynamic based on mode)
const mobileTabs = computed(() => {
  const baseTabs = [
    {
      id: 'description',
      label: 'Task',
      icon: 'svg'
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

  // Add Model Answer tab in Model Help mode
  if (currentMode.value === 'model-help') {
    baseTabs.push({
      id: 'model',
      label: 'Model',
      icon: 'svg'
    })
  }

  return baseTabs
})

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
  // Stage 12: Analyze text and create feedback
  const analysisResult = analyzeGermanText(content, props.topic)
  const feedback = createWritingFeedback(analysisResult, props.topic)
  
  submissionResults.value = { 
    wordCount, 
    timeSpent, 
    feedback, 
    analysisResult 
  }
  
  // Save writing submission with feedback to localStorage (Stage 12)
  saveWritingSubmission(props.topic.id, content, wordCount, timeSpent, feedback)
  
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

// Handle writing mode change
function handleModeChange(mode: WritingMode) {
  changeMode(mode)
  // Reset mobile tab when switching modes to avoid index issues
  activeMobileTab.value = 0
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
