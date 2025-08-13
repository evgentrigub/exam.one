<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
    <!-- Card Header -->
    <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200 rounded-t-xl flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">Instructions</h2>
            <p class="text-sm text-green-600">Your writing assignment</p>
          </div>
        </div>

        <!-- Challenge Mode Timer -->
        <div v-if="currentMode === 'challenge'" class="flex items-center bg-orange-100 rounded-lg px-3 py-2">
          <svg class="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-orange-600 font-mono font-semibold">{{ timerDisplay }}</span>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-6 flex-1 overflow-y-auto min-h-0">
      <!-- Writing Prompt -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Your Task</h4>
        <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
          <p class="text-gray-800 leading-relaxed font-medium text-sm">{{ topic.task }}</p>
        </div>
      </div>

      <!-- Requirements List -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Requirements</h4>
        <div class="space-y-1">
          <div 
            v-for="requirement in topic.requirements" 
            :key="requirement"
            class="flex items-center p-1 rounded"
          >
            <span class="text-orange-500 mr-2 flex-shrink-0">•</span>
            <span class="text-sm text-gray-700">{{ requirement }}</span>
          </div>
        </div>
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
  timerDisplay?: string
}

defineProps<Props>()
</script>
