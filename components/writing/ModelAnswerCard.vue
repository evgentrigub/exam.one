<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
    <!-- Card Header -->
    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200 rounded-t-xl flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">{{ $t('writing.modelAnswer.title') }}</h2>
            <p class="text-sm text-indigo-600">{{ $t('writing.modelAnswer.subtitle') }}</p>
          </div>
        </div>

        <!-- Word Count Badge -->
        <div v-if="!isLoading" class="bg-indigo-100 rounded-lg px-3 py-1">
          <span class="text-sm font-semibold text-indigo-700">{{ modelAnswer?.wordCount || 0 }} {{ $t('writing.modelAnswer.words') }}</span>
        </div>
        <div v-else class="bg-indigo-100 rounded-lg px-3 py-1">
          <span class="text-sm font-semibold text-indigo-700">...</span>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-6 flex-1 overflow-y-auto text-sm min-h-0">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p class="text-sm text-gray-600">{{ $t('writing.modelAnswer.generating') }}</p>
        </div>
      </div>

      <!-- Model Answer Content -->
      <div v-else-if="modelAnswer" class="space-y-4">
        <!-- Model Answer Text (Expandable) -->
        <div>
          <button 
            class="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
            @click="showModelAnswer = !showModelAnswer"
          >
            <span class="text-sm font-medium text-gray-700 flex items-center">
              <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {{ $t('writing.modelAnswer.modelText') }}
            </span>
            <svg 
                class="w-4 h-4 text-gray-400 transition-transform" 
                :class="{ 'rotate-180': showModelAnswer }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="showModelAnswer" class="mt-4">
            <div class="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-400">
              <div class="prose prose-sm max-w-none">
                <div class="whitespace-pre-line text-gray-800 leading-relaxed font-medium">{{ modelAnswer.content }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Features (Expandable) -->
        <div v-if="modelAnswer.highlights" class="border-t border-gray-200 pt-4">
          <button 
            class="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
            @click="showHighlights = !showHighlights"
          >
            <span class="text-sm font-medium text-gray-700 flex items-center">
              <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              {{ $t('writing.modelAnswer.keyFeatures') }}
            </span>
            <svg 
                class="w-4 h-4 text-gray-400 transition-transform" 
                :class="{ 'rotate-180': showHighlights }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="showHighlights" class="mt-4 space-y-3">
            <!-- Greeting -->
            <div v-if="modelAnswer.highlights.greeting" class="flex items-start">
              <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <span class="text-xs font-semibold text-green-700 uppercase tracking-wide">{{ $t('writing.modelAnswer.greeting') }}</span>
                <p class="text-sm text-gray-700 mt-1 font-mono bg-green-50 px-2 py-1 rounded">{{ modelAnswer.highlights.greeting }}</p>
              </div>
            </div>

            <!-- Main Points -->
            <div v-if="modelAnswer.highlights.mainPoints && modelAnswer.highlights.mainPoints.length > 0" class="flex items-start">
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <span class="text-xs font-semibold text-blue-700 uppercase tracking-wide">{{ $t('writing.modelAnswer.mainPoints') }}</span>
                <ul class="text-sm text-gray-700 mt-1 space-y-1">
                  <li 
                    v-for="point in modelAnswer.highlights.mainPoints" :key="point" 
                    class="bg-blue-50 px-2 py-1 rounded">
                    • {{ point }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Closing -->
            <div v-if="modelAnswer.highlights.closing" class="flex items-start">
              <div class="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <span class="text-xs font-semibold text-purple-700 uppercase tracking-wide">{{ $t('writing.modelAnswer.closing') }}</span>
                <p class="text-sm text-gray-700 mt-1 font-mono bg-purple-50 px-2 py-1 rounded">{{ modelAnswer.highlights.closing }}</p>
              </div>
            </div>

            <!-- Key Phrases -->
            <div v-if="modelAnswer.highlights.keyPhrases && modelAnswer.highlights.keyPhrases.length > 0" class="flex items-start">
              <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <span class="text-xs font-semibold text-yellow-700 uppercase tracking-wide">{{ $t('writing.modelAnswer.keyPhrases') }}</span>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span 
                    v-for="phrase in modelAnswer.highlights.keyPhrases" :key="phrase"
                    class="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full font-mono">
                    "{{ phrase }}"
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tips (Expandable) -->
        <div v-if="modelAnswer.highlights" class="border-t border-gray-200 pt-4">
          <button 
            class="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
            @click="showTips = !showTips"
          >
            <span class="text-sm font-medium text-gray-700 flex items-center">
              <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ $t('writing.modelAnswer.whyGoodExample') }}
            </span>
            <svg 
                class="w-4 h-4 text-gray-400 transition-transform" 
                :class="{ 'rotate-180': showTips }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="showTips" class="mt-4">
            <div class="bg-indigo-50 rounded-lg p-4">
              <ul class="space-y-1 text-sm text-indigo-700">
                <li class="flex items-center">
                  <span class="text-indigo-500 mr-2">•</span>
                  <span>{{ $t('writing.modelAnswer.tips.clearStructure') }}</span>
                </li>
                <li class="flex items-center">
                  <span class="text-indigo-500 mr-2">•</span>
                  <span>{{ $t('writing.modelAnswer.tips.appropriateWordCount') }}</span>
                </li>
                <li class="flex items-center">
                  <span class="text-indigo-500 mr-2">•</span>
                  <span>{{ $t('writing.modelAnswer.tips.politeLanguage') }}</span>
                </li>
                <li class="flex items-center">
                  <span class="text-indigo-500 mr-2">•</span>
                  <span>{{ $t('writing.modelAnswer.tips.allRequirements') }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Generate Model Answer -->
      <div v-else-if="shouldShowGenerate" class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <p class="text-sm mb-4">{{ $t('writing.modelAnswer.canGenerate') }}</p>
          <button 
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            @click="handleGenerateModelAnswer">
            {{ $t('writing.modelAnswer.generateButton') }}
          </button>
        </div>
      </div>

      <!-- No Model Answer Available -->
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm">{{ $t('writing.modelAnswer.noExample') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WritingTopic } from '~/utils/types'
import type { ModelAnswer } from '~/data/writing/modelAnswers'
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
