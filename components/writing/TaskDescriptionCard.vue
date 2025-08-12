<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
    <!-- Card Header -->
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200 rounded-t-xl flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">Description</h2>
            <p class="text-sm text-blue-600">{{ getTopicTypeLabel(topic.topicType) }} • {{ topic.difficulty }}</p>
          </div>
        </div>

        <!-- Writing Mode Buttons -->
        <div class="flex rounded-lg bg-gray-100 p-1">
          <button
            v-for="mode in writingModes"
            :key="mode.id"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            :class="currentMode === mode.id 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'"
            @click="$emit('mode-change', mode.id as WritingMode)"
          >
            <div class="flex items-center space-x-1">
              <!-- Quick Mode Icon -->
              <svg v-if="mode.id === 'quick'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <!-- Challenge Mode Icon -->
              <svg v-else-if="mode.id === 'challenge'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <!-- Model Help Icon -->
              <svg v-else-if="mode.id === 'model-help'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ mode.label }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-6 flex-1 overflow-y-auto min-h-0">
      <!-- Topic Title -->
      <div class="mb-4">
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ topic.title }}</h3>
        <div class="flex items-center space-x-4 text-sm text-gray-600">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ topic.estimatedTime }} minutes
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ topic.wordCount.min }}-{{ topic.wordCount.max }} words
          </span>
        </div>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">What you should write</h4>
        <p class="text-gray-800 leading-relaxed text-sm">{{ topic.description }}</p>
      </div>

      <!-- Writing Tips (if available) -->
      <div v-if="topic.tips && topic.tips.length > 0" class="bg-yellow-50 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          Writing Tips
        </h4>
        <ul class="space-y-1">
          <li v-for="tip in topic.tips" :key="tip" class="flex items-center text-sm text-yellow-700">
            <span class="text-yellow-500 mr-2 flex-shrink-0">•</span>
            <span>{{ tip }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WritingTopic } from '~/utils/types'
import type { WritingMode } from '~/composables/useWritingMode'

interface Props {
  topic: WritingTopic
  currentMode?: WritingMode
}

defineProps<Props>()

defineEmits<{
  'mode-change': [mode: WritingMode]
}>()

// Writing modes configuration
const writingModes = [
  {
    id: 'quick',
    label: 'Quick'
  },
  {
    id: 'challenge',
    label: 'Challenge'
  },
  {
    id: 'model-help',
    label: 'Model Help'
  }
]

// Topic type labels in German
const topicTypeLabels = {
  email: 'E-Mail',
  letter: 'Brief',
  essay: 'Aufsatz',
  form: 'Formular',
  postcard: 'Postkarte',
  note: 'Notiz'
}

function getTopicTypeLabel(type: string) {
  return topicTypeLabels[type as keyof typeof topicTypeLabels] || type
}
</script>
