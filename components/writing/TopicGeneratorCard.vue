<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-[380px] border-2 border-dashed border-blue-300">
    <!-- Error State -->
    <div v-if="generationError" class="p-6 flex flex-col items-center justify-center h-full">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2 text-center">Generation Failed</h3>
      <p class="text-sm text-gray-600 text-center mb-4 px-4">{{ generationError }}</p>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          @click="$emit('retry')"
        >
          Retry
        </button>
        <button
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          @click="$emit('dismiss')"
        >
          Dismiss
        </button>
      </div>
    </div>

    <!-- Generating State -->
    <div v-else-if="isGenerating" class="p-6 flex flex-col items-center justify-center h-full">
      <div class="relative w-20 h-20 mb-6">
        <div class="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">Generating Topics...</h3>
      <p class="text-sm text-gray-600 text-center">
        Creating {{ generatingPart === 1 ? 'Teil 1' : 'Teil 2' }} topics using AI
      </p>
      <p class="text-xs text-gray-500 mt-4 text-center px-4">
        This may take 10-30 seconds. Please don't close this page.
      </p>
    </div>

    <!-- Default State: Generator Buttons -->
    <div v-else class="p-6 flex flex-col items-center justify-center h-full">
      <!-- Icon -->
      <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-bold text-gray-900 mb-2 text-center">Generate New Topics</h3>
      <p class="text-sm text-gray-600 text-center mb-6 px-4">
        Use AI to create new C1 writing exercises
      </p>

      <!-- Generation Buttons -->
      <div class="flex flex-col gap-3 w-full px-4">
        <button
          class="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
          @click="$emit('generate', 1)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Generate Teil 1 (Forum)
        </button>

        <button
          class="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md"
          @click="$emit('generate', 2)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Generate Teil 2 (E-Mail)
        </button>
      </div>

      <!-- Info Text -->
      <p class="text-xs text-gray-500 mt-4 text-center px-4">
        Each generation creates 3 new topics
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isGenerating: boolean
  generatingPart: 1 | 2 | null
  generationError: string | null
}

defineProps<Props>()

defineEmits<{
  generate: [part: 1 | 2]
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

