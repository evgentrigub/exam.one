<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          German A2 Reading Trainer
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Master German reading comprehension with authentic A2-level texts. 
          Practice with exam-style questions and track your progress.
        </p>
      </header>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Start Practice Card -->
          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div class="text-center">
              <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">
                Start Reading Practice
              </h2>
              <p class="text-gray-600 mb-6">
                Practice with authentic German texts designed for A2 level learners.
              </p>
              <NuxtLink 
                to="/practice" 
                class="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Begin Practice
              </NuxtLink>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="bg-white rounded-xl shadow-lg p-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">
                Track Progress
              </h2>
              <p class="text-gray-600 mb-6">
                View your learning analytics and identify areas for improvement.
              </p>
              <button 
                class="inline-block bg-secondary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary-700 transition-colors"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="mt-16">
          <h3 class="text-2xl font-semibold text-center text-gray-900 mb-8">
            Why Choose Our Trainer?
          </h3>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center p-6">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">Authentic Texts</h4>
              <p class="text-sm text-gray-600">Real German texts matching A2 exam format</p>
            </div>
            <div class="text-center p-6">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">Instant Feedback</h4>
              <p class="text-sm text-gray-600">Get immediate results and explanations</p>
            </div>
            <div class="text-center p-6">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 mb-2">Progress Tracking</h4>
              <p class="text-sm text-gray-600">Monitor improvement over time</p>
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
  title: 'German A2 Reading Trainer - Home',
  meta: [
    { name: 'description', content: 'Practice German A2 reading comprehension with authentic exam-style texts' }
  ]
})
</script> 