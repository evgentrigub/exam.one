<template>
  <div class="min-h-screen bg-base-200">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-base-content mb-2">📚 {{ $t('practice.title') }}</h1>
        <p class="text-base-content/70">
          {{ $t('practice.subtitle') }}
        </p>
      </header>

      <!-- Practice Content -->
      <div v-if="!selectedText" class="max-w-6xl mx-auto">
        <!-- Enhanced Filter and Sort Bar -->
        <div class="mb-6 bg-base-100 rounded-lg shadow-sm p-4">
          <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <!-- Filters -->
            <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <!-- Text Type Filter -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-base-content"
                  >{{ $t('practice.type') }}:</label
                >
                <select v-model="selectedTypeFilter" class="select select-bordered select-sm">
                  <option value="all">{{ $t('practice.allTypes') }}</option>
                  <option value="email">{{ $t('exerciseType.email') }}</option>
                  <option value="notice">{{ $t('exerciseType.notice') }}</option>
                  <option value="article">{{ $t('exerciseType.article') }}</option>
                  <option value="advertisement">{{ $t('exerciseType.advertisement') }}</option>
                  <option value="instructions">{{ $t('exerciseType.instructions') }}</option>
                </select>
              </div>

              <!-- Completion Status Filter -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-base-content"
                  >{{ $t('practice.status') }}:</label
                >
                <select v-model="selectedStatusFilter" class="select select-bordered select-sm">
                  <option value="all">{{ $t('practice.allTopics') }}</option>
                  <option value="completed">{{ $t('practice.completed') }}</option>
                  <option value="incomplete">{{ $t('practice.notCompleted') }}</option>
                </select>
              </div>
            </div>

            <!-- Sort Options -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-base-content w-25"
                  >{{ $t('practice.sortBy') }}:</label
                >
                <select v-model="selectedSort" class="select select-bordered select-sm">
                  <option value="title">{{ $t('practice.titleSort') }}</option>
                  <option value="type">{{ $t('practice.type') }}</option>
                  <option value="difficulty">{{ $t('practice.difficulty') }}</option>
                  <option value="completion">{{ $t('practice.completionStatus') }}</option>
                  <option value="score">{{ $t('practice.bestScore') }}</option>
                  <option value="wordCount">{{ $t('practice.wordCount') }}</option>
                </select>
              </div>

              <!-- Sort Direction -->
              <button
                class="btn btn-square btn-sm"
                :title="
                  sortDirection === 'asc'
                    ? $t('practice.sortAscending')
                    : $t('practice.sortDescending')
                "
                @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
              >
                <svg
                  class="w-4 h-4 transition-transform"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
              </button>
            </div>

            <!-- Results Count -->
            <div class="text-sm text-base-content/70 whitespace-nowrap">
              {{
                filteredAndSortedTexts.length === 1
                  ? $t('practice.textFound', { count: filteredAndSortedTexts.length })
                  : $t('practice.textsFound', { count: filteredAndSortedTexts.length })
              }}
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
            @delete-text="handleDeleteText"
          />

          <!-- Reading Generator Card -->
          <ReadingGeneratorCard
            :is-generating="isGenerating"
            :generating-difficulty="generatingDifficulty"
            :generation-error="generationError"
            :current-difficulty="examLevel"
            :generation-jobs="generationJobs"
            :can-resume-generation="canResumeGeneration"
            @generate="handleGenerate"
            @resume="handleResume"
            @retry="handleRetry"
            @dismiss="handleDismissError"
          />
        </div>

        <!-- Enhanced Empty State -->
        <div v-if="filteredAndSortedTexts.length === 0" class="text-center py-12">
          <div
            class="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              class="w-10 h-10 text-base-content/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-base-content mb-2">
            {{ $t('practice.noTextsFound') }}
          </h3>
          <p class="text-base-content/70 max-w-md mx-auto mb-4">
            {{ $t('practice.noTextsMatch') }}
          </p>
          <button class="btn btn-primary gap-2" @click="resetFilters">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ $t('practice.resetFilters') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reading Modal -->
    <ReadingModal
      v-if="selectedText"
      :text="selectedText"
      @close="closeReader"
      @start-quiz="startQuiz"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import ReadingGeneratorCard from '~/components/reading/ReadingGeneratorCard.vue'
import ReadingModal from '~/components/reading/ReadingModal.vue'
import TextCard from '~/components/reading/TextCard.vue'
import { useProgress } from '~/composables/useProgress'
import { useReadingGeneration } from '~/composables/useReadingGeneration'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useSettingsStore } from '~/stores/settings'
import type { ReadingExercise } from '~/utils/exercises/reading'

// Page metadata
useHead({
  title: 'Reading Practice - Exam.one',
  meta: [{ name: 'description', content: 'Practice reading with authentic exam-style texts' }],
})

// i18n
const { t } = useI18n()

// Progress composable
const { getSession, isTextCompleted, getBestScore } = useProgress()

// Reading texts management (API-backed)
const { getTexts, addTexts, deleteText } = useReadingTexts()

// Reading generation management
const {
  isGenerating,
  generatingDifficulty,
  generationError,
  generationJobs,
  canResumeGeneration,
  generateReading,
  resumeGeneration,
  retryGeneration,
  dismissError,
} = useReadingGeneration()

// Global settings (exam level)
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)

// Reactive data
const selectedTypeFilter = ref<string>('all')
const selectedStatusFilter = ref<string>('all')
const selectedSort = ref<string>('title')
const sortDirection = ref<'asc' | 'desc'>('asc')
const selectedText = ref<ReadingExercise | null>(null)

const router = useRouter()
const route = useRoute()

// Check for resume session on mount -> redirect to quiz route
onMounted(() => {
  if (route.query['resume'] === 'true') {
    const session = getSession()
    if (session?.textId) {
      router.replace({ path: `/reading/${session.textId}` })
    }
  }
})

// Computed properties
const filteredTexts = computed(() => {
  let texts = getTexts()

  // Filter by current exam level
  const difficulty = examLevel.value
  texts = texts.filter(text => text.difficulty === difficulty)

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
      comparison = aCompleted === bCompleted ? 0 : aCompleted ? -1 : 1
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
  const text = getTexts().find(t => t.id === textId)
  if (text) {
    selectedText.value = text
  }
}

function closeReader() {
  selectedText.value = null
}

function startQuiz(textId: string) {
  const text = getTexts().find(t => t.id === textId)
  if (text && text.questions && text.questions.length > 0) {
    router.push({ path: `/reading/${text.id}` })
    selectedText.value = null
  }
}

function resetFilters() {
  selectedTypeFilter.value = 'all'
  selectedStatusFilter.value = 'all'
  selectedSort.value = 'title'
  sortDirection.value = 'asc'
}

// Generate reading exercises handler
async function handleGenerate() {
  try {
    console.log(`🤖 Generating ${examLevel.value} reading exercises...`)
    const newTexts = await generateReading(examLevel.value, {
      onPartComplete: items => void addTexts(items),
    })

    console.log(
      `✅ Successfully generated ${newTexts.length} new reading exercises for ${examLevel.value}`
    )
  } catch (error: unknown) {
    console.error('Failed to generate reading exercises:', error)
    alert(error instanceof Error ? error.message : t('generation.readingErrorFallback'))
  }
}

// Retry generation handler
async function handleRetry() {
  try {
    const newTexts = await retryGeneration(items => void addTexts(items))
    console.log(`✅ Successfully generated ${newTexts.length} new reading exercises on retry`)
  } catch (error: unknown) {
    console.error('Failed to retry generation:', error)
    alert(error instanceof Error ? error.message : t('generation.retryErrorFallback'))
  }
}

// Resume interrupted generation
async function handleResume() {
  try {
    const newTexts = await resumeGeneration()
    await addTexts(newTexts)
    console.log(`✅ Successfully resumed and generated ${newTexts.length} new reading exercises`)
  } catch (error: unknown) {
    console.error('Failed to resume generation:', error)
    alert(error instanceof Error ? error.message : t('generation.resumeErrorFallback'))
  }
}

// Dismiss error handler
function handleDismissError() {
  dismissError()
}

// Delete text handler with confirmation
async function handleDeleteText(textId: string) {
  const text = getTexts().find(t => t.id === textId)
  if (!text) return

  const confirmed = confirm(t('practice.deleteConfirm', { title: text.title }))

  if (confirmed) {
    const success = await deleteText(textId)
    if (success) {
      console.log(`✅ Text "${text.title}" deleted successfully`)
    }
  }
}
</script>
