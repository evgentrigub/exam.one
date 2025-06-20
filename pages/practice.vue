<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              Reading Practice
            </h1>
            <p class="text-gray-600">
              Choose a text to practice your German reading comprehension
            </p>
          </div>
          <NuxtLink 
            to="/" 
            class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Home
          </NuxtLink>
        </div>
      </header>

      <!-- Practice Content -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="text-center py-12">
            <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">
              Practice Texts Coming Soon
            </h2>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">
              We're preparing authentic A2-level German texts for your practice. 
              Check back soon to start improving your reading comprehension!
            </p>
            <div class="inline-flex items-center text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Stage 2 - Text Display System (Next)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Reading Practice - German A2 Reading Trainer',
  meta: [
    { name: 'description', content: 'Practice German A2 reading comprehension with authentic texts' }
  ]
})
</script> 