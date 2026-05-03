<template>
  <div class="card bg-base-100 shadow h-full flex flex-col">
    <!-- Card Header -->
    <div class="bg-secondary/10 px-6 py-4 border-b flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h2 class="card-title text-lg">{{ $t('writing.modelAnswer.title') }}</h2>
            <p class="text-sm text-secondary">{{ $t('writing.modelAnswer.subtitle') }}</p>
          </div>
        </div>

        <!-- Word Count Badge -->
        <div v-if="!isLoading" class="badge badge-secondary font-semibold">
          {{ modelAnswer?.wordCount || 0 }} {{ $t('writing.modelAnswer.words') }}
        </div>
        <div v-else class="badge badge-ghost">
          <span class="loading loading-dots loading-xs"></span>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-body flex-1 overflow-y-auto text-sm min-h-0">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <span class="loading loading-spinner loading-lg text-secondary mb-4"></span>
          <p class="text-sm text-base-content opacity-70">{{ $t('writing.modelAnswer.generating') }}</p>
        </div>
      </div>

      <!-- Model Answer Content -->
      <div v-else-if="modelAnswer" class="space-y-4">
        <!-- Model Answer Text (Expandable) -->
        <div class="collapse collapse-arrow">
          <input v-model="showModelAnswer" type="checkbox" class="peer" />
          <div class="collapse-title text-sm font-medium flex items-center gap-2">
            <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ $t('writing.modelAnswer.modelText') }}
          </div>
          <div class="collapse-content">
            <div class="alert bg-info/10 mt-2">
              <div class="prose prose-sm max-w-none">
                <div class="whitespace-pre-line leading-relaxed font-medium">{{ modelAnswer.content }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Features (Expandable) -->
        <div v-if="modelAnswer.highlights" class="collapse collapse-arrow">
          <input v-model="showHighlights" type="checkbox" class="peer" />
          <div class="collapse-title text-sm font-medium flex items-center gap-2">
            <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            {{ $t('writing.modelAnswer.keyFeatures') }}
          </div>
          <div class="collapse-content">
            <div class="space-y-3 mt-2">
              <!-- Greeting -->
              <div v-if="modelAnswer.highlights.greeting" class="flex items-start">
                <div class="badge badge-success badge-sm mt-1 mr-3"></div>
                <div class="flex-1">
                  <span class="text-xs font-semibold text-success uppercase tracking-wide">{{ $t('writing.modelAnswer.greeting') }}</span>
                  <p class="text-sm text-base-content mt-1 font-mono bg-success/10 px-2 py-1 rounded">{{ modelAnswer.highlights.greeting }}</p>
                </div>
              </div>

              <!-- Main Points -->
              <div v-if="modelAnswer.highlights.mainPoints && modelAnswer.highlights.mainPoints.length > 0" class="flex items-start">
                <div class="badge badge-info badge-sm mt-1 mr-3"></div>
                <div class="flex-1">
                  <span class="text-xs font-semibold text-info uppercase tracking-wide">{{ $t('writing.modelAnswer.mainPoints') }}</span>
                  <ul class="text-sm text-base-content mt-1 space-y-1">
                    <li 
                      v-for="point in modelAnswer.highlights.mainPoints" :key="point" 
                      class="bg-info/10 px-2 py-1 rounded">
                      • {{ point }}
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Closing -->
              <div v-if="modelAnswer.highlights.closing" class="flex items-start">
                <div class="badge badge-secondary badge-sm mt-1 mr-3"></div>
                <div class="flex-1">
                  <span class="text-xs font-semibold text-secondary uppercase tracking-wide">{{ $t('writing.modelAnswer.closing') }}</span>
                  <p class="text-sm text-base-content mt-1 font-mono bg-secondary/10 px-2 py-1 rounded">{{ modelAnswer.highlights.closing }}</p>
                </div>
              </div>

              <!-- Key Phrases -->
              <div v-if="modelAnswer.highlights.keyPhrases && modelAnswer.highlights.keyPhrases.length > 0" class="flex items-start">
                <div class="badge badge-warning badge-sm mt-1 mr-3"></div>
                <div class="flex-1">
                  <span class="text-xs font-semibold text-warning uppercase tracking-wide">{{ $t('writing.modelAnswer.keyPhrases') }}</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span 
                      v-for="phrase in modelAnswer.highlights.keyPhrases" :key="phrase"
                      class="badge badge-warning badge-outline font-mono">
                      "{{ phrase }}"
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tips (Expandable) -->
        <div v-if="modelAnswer.highlights" class="collapse collapse-arrow">
          <input v-model="showTips" type="checkbox" class="peer" />
          <div class="collapse-title text-sm font-medium flex items-center gap-2">
            <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ $t('writing.modelAnswer.whyGoodExample') }}
          </div>
          <div class="collapse-content">
            <ul class="menu menu-compact bg-secondary/10 rounded-box mt-2">
              <li><span class="text-sm">{{ $t('writing.modelAnswer.tips.clearStructure') }}</span></li>
              <li><span class="text-sm">{{ $t('writing.modelAnswer.tips.appropriateWordCount') }}</span></li>
              <li><span class="text-sm">{{ $t('writing.modelAnswer.tips.politeLanguage') }}</span></li>
              <li><span class="text-sm">{{ $t('writing.modelAnswer.tips.allRequirements') }}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Generate Model Answer -->
      <div v-else-if="shouldShowGenerate" class="flex items-center justify-center h-full">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <p class="text-sm text-base-content opacity-70 mb-4">{{ $t('writing.modelAnswer.canGenerate') }}</p>
          <button 
            class="btn btn-secondary"
            @click="handleGenerateModelAnswer">
            {{ $t('writing.modelAnswer.generateButton') }}
          </button>
        </div>
      </div>

      <!-- No Model Answer Available -->
      <div v-else class="flex items-center justify-center h-full">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-4 text-base-content opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm text-base-content opacity-70">{{ $t('writing.modelAnswer.noExample') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WritingTopic, ModelAnswer } from '~/utils/types'
import { useModelAnswer } from '~/composables/useModelAnswer'

interface Props {
  topic: WritingTopic
}

const props = defineProps<Props>()

// Reactive state
const showModelAnswer = ref(false)
const showHighlights = ref(false)
const showTips = ref(false)

// Use model answer composable
const { 
  getModelAnswer,
  isGenerating, 
  generateModelAnswer,
  modelAnswerVersion 
} = useModelAnswer()

// Get or generate model answer for current topic
const modelAnswer = computed<ModelAnswer | null>(() => {
  // Trigger reactivity update when version changes
  const _version = modelAnswerVersion.value
  return getModelAnswer(props.topic.id)
})

const isLoading = computed(() => {
  // Trigger reactivity update when version changes
  const _version = modelAnswerVersion.value
  return isGenerating(props.topic.id)
})
const shouldShowGenerate = computed(() => 
  !modelAnswer.value && 
  !isLoading.value && 
  (props.topic.difficulty === 'C1') &&
  (props.topic.testingPart === 1 || props.topic.testingPart === 2)
)

async function handleGenerateModelAnswer() {
  try {
    console.log('🎯 Starting model answer generation for topic:', props.topic.id)
    await generateModelAnswer(props.topic)
    console.log('✅ Model answer generation completed')
  } catch (error) {
    console.error('❌ Failed to generate model answer:', error)
  }
}
</script>
