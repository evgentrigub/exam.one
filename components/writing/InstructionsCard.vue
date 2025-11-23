<template>
  <div class="card bg-base-100 shadow h-full flex flex-col">
    <!-- Card Header -->
    <div class="bg-success/10 px-6 py-4 border-b flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
          <div>
            <h2 class="card-title text-lg">Instructions</h2>
            <p class="text-sm text-success">Your writing assignment</p>
          </div>
        </div>

        <!-- Challenge Mode Timer -->
        <div v-if="currentMode === 'challenge'" class="badge badge-warning gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="font-mono font-semibold">{{ timerDisplay }}</span>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-body flex-1 overflow-y-auto min-h-0">
      <!-- Writing Prompt -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-base-content opacity-70 mb-3 uppercase tracking-wide">Your Task</h4>
        <div class="alert alert-success shadow-sm flex items-start gap-3">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="leading-relaxed font-medium text-sm">{{ topic.task }}</p>
        </div>
      </div>

      <!-- Requirements List -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-base-content opacity-70 mb-3 uppercase tracking-wide">Requirements</h4>
        <ul class="menu menu-compact bg-base-200 rounded-box">
          <li 
            v-for="requirement in topic.requirements" 
            :key="requirement"
          >
            <span class="text-sm">{{ requirement }}</span>
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
  timerDisplay?: string
}

defineProps<Props>()
</script>
