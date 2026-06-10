<template>
  <div class="card bg-base-200 border-2 border-dashed border-primary shadow-md hover:shadow-lg transition-all">
    <!-- Error State -->
    <div v-if="generationError" class="card-body flex flex-col items-center justify-center">
      <div class="alert alert-error mb-4">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <h3 class="font-bold">Generation Failed</h3>
          <div class="text-sm">{{ generationError }}</div>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          class="btn btn-primary btn-sm"
          @click="$emit('retry')"
        >
          Retry
        </button>
        <button
          class="btn btn-ghost btn-sm"
          @click="$emit('dismiss')"
        >
          Dismiss
        </button>
      </div>
    </div>

    <!-- Generating State -->
    <div v-else-if="isGenerating" class="card-body flex flex-col items-center justify-center">
      <span class="loading loading-spinner loading-lg text-primary mb-6"></span>
      <h3 class="text-lg font-bold text-base-content mb-2">Generating Reading Exercises...</h3>
      <p class="text-sm text-base-content opacity-70 text-center">
        Creating {{ generatingDifficulty }} level reading exercises with AI
      </p>
      <p class="text-xs text-base-content opacity-50 mt-4 text-center px-4">
        This may take 15-40 seconds. Please don't close this page.
      </p>
    </div>

    <!-- Default State: Generator Button -->
    <div v-else class="card-body p-4 flex flex-col items-center justify-center">
      <!-- Icon -->
      <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-bold text-base-content mb-2 text-center">Generate New Reading Exercises</h3>
      <p class="text-sm text-base-content opacity-70 text-center mb-6 px-4">
        AI creates new reading comprehension exercises for {{ currentDifficulty }} level
      </p>

      <!-- Generation Button -->
      <div class="w-full px-4">
        <button
          class="btn btn-primary w-full gap-2"
          @click="$emit('generate')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Generate exercises
        </button>
      </div>

      <!-- Info Text -->
      <p class="text-xs text-base-content opacity-50 mt-4 text-center px-4">
        {{ currentDifficulty === 'A2'
          ? 'Creates one exercise per exam part (Teil 1–4)'
          : 'Each generation creates new exercises' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isGenerating: boolean
  generatingDifficulty: 'A2' | 'C1' | null
  generationError: string | null
  currentDifficulty: 'A2' | 'C1'
}

defineProps<Props>()

defineEmits<{
  generate: []
  retry: []
  dismiss: []
}>()
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

