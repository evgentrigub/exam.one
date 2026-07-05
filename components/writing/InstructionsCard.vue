<template>
  <div class="card bg-base-100 shadow h-full flex flex-col">
    <!-- Card Header -->
    <div class="bg-success/10 px-6 py-4 border-b flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
            <ClipboardList :size="20" class="text-success" aria-hidden="true" />
          </div>
          <div>
            <h2 class="card-title text-lg">Instructions</h2>
            <p class="text-sm text-success">Your writing assignment</p>
          </div>
        </div>

        <!-- Challenge Mode Timer -->
        <div v-if="currentMode === 'challenge'" class="badge badge-warning gap-2">
          <Clock :size="16" aria-hidden="true" />
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
          <CheckCircle2 :size="20" class="flex-shrink-0 mt-0.5" aria-hidden="true" />
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
import { CheckCircle2, ClipboardList, Clock } from 'lucide-vue-next'
import type { WritingExercise } from '~/utils/types'
import type { WritingMode } from '~/composables/useWritingMode'

interface Props {
  topic: WritingExercise
  currentMode?: WritingMode
  timerDisplay?: string
}

defineProps<Props>()
</script>
