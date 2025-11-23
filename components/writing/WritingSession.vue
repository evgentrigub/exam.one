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
      <div class="btn-group btn-group-vertical">
        <button
          v-for="(tab, index) in mobileTabs"
          :key="tab.id"
          class="btn btn-sm"
          :class="activeMobileTab === index ? 'btn-primary' : 'btn-ghost'"
          :title="tab.label"
          @click="activeMobileTab = index"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Mobile Single Card View -->
    <div class="lg:hidden">
      <div class="p-4">
        <!-- Tab Navigation -->
        <div class="tabs tabs-boxed mb-4">
          <a
            v-for="(tab, index) in mobileTabs"
            :key="tab.id"
            class="tab flex-1"
            :class="activeMobileTab === index ? 'tab-active' : ''"
            @click="activeMobileTab = index"
          >
            {{ tab.label }}
          </a>
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
    <div v-if="showResults" class="modal modal-open">
      <div class="modal-box max-w-2xl p-0">
        <!-- Results Header -->
        <div class="bg-base-200 px-6 py-4 border-b flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-success rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-success-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-base-content">Writing Submitted!</h2>
              <p class="text-sm text-success">{{ topic.title }}</p>
            </div>
          </div>
          <button 
            class="btn btn-ghost btn-circle btn-sm"
            @click="closeResults"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
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
          <div class="stats stats-vertical md:stats-horizontal shadow w-full mb-6">
            <div class="stat place-items-center">
              <div class="stat-figure text-info">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="stat-title">Wörter geschrieben</div>
              <div class="stat-value text-info">{{ submissionResults?.wordCount || 0 }}</div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-figure text-success">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="stat-title">Zeit verwendet</div>
              <div class="stat-value text-success">{{ formatTime(submissionResults?.timeSpent || 0) }}</div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-figure text-secondary">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="stat-title">Niveau</div>
              <div class="stat-value text-secondary">A2</div>
            </div>
          </div>

          <!-- Completion Message -->
          <div class="alert alert-success mb-6">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <h3 class="font-semibold">Gut gemacht!</h3>
              <p class="text-sm">
                You have successfully completed this writing task. 
                Your text was sent for review and once it is done, you can open it in the writing page.
              </p>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="modal-action">
            <button
              class="btn btn-primary flex-1"
              @click="tryAnotherTopic"
            >
              Back to writing
            </button>
            <button
              class="btn btn-ghost flex-1"
              @click="viewDashboard"
            >
              Check your progress
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
  notification.className = 'alert alert-success fixed top-4 right-4 w-auto shadow-lg z-50'
  notification.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>Draft saved!</span>
  `
  document.body.appendChild(notification)
  
  setTimeout(() => {
    document.body.removeChild(notification)
  }, 2000)
}

function handleSubmit(content: string, wordCount: number, timeSpent: number) {
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
