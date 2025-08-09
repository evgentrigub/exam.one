<template>
  <div class="bg-gradient-to-br from-blue-50 to-cyan-50">
    <div class="container mx-auto px-4 py-16">
      <!-- Hero Section -->
      <header class="text-center mb-16">
        <h1 class="text-5xl font-bold text-gray-900 mb-6">
          {{ $t('home.title') }}
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          {{ $t('home.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <NuxtLink 
            to="/reading" 
            class="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg shadow-lg"
          >
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
            </svg>
            {{ $t('home.startPractice') }}
          </NuxtLink>
          <NuxtLink 
            to="/dashboard" 
            class="inline-flex items-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
          >
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            {{ $t('home.viewDashboard') }}
          </NuxtLink>
        </div>
      </header>

      <!-- Features Section -->
      <div class="max-w-6xl mx-auto mb-16">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          {{ $t('home.features.title') }}
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Authentic Texts -->
          <div class="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('home.features.authentic.title') }}</h3>
            <p class="text-gray-600">
              {{ $t('home.features.authentic.description') }}
            </p>
          </div>

          <!-- Instant Feedback -->
          <div class="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('home.features.feedback.title') }}</h3>
            <p class="text-gray-600">
              {{ $t('home.features.feedback.description') }}
            </p>
          </div>

          <!-- Progress Tracking -->
          <div class="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('home.features.progress.title') }}</h3>
            <p class="text-gray-600">
              {{ $t('home.features.progress.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="max-w-4xl mx-auto mb-16">
        <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">
            {{ $t('home.benefits.title') }}
          </h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ $t('home.benefits.items.comprehensive') }}</h4>
                  <p class="text-gray-600 text-sm">{{ $t('home.benefits.items.comprehensive') }}</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ $t('home.benefits.items.timing') }}</h4>
                  <p class="text-gray-600 text-sm">{{ $t('home.benefits.items.timing') }}</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ $t('home.benefits.items.improvement') }}</h4>
                  <p class="text-gray-600 text-sm">{{ $t('home.benefits.items.improvement') }}</p>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ $t('home.benefits.items.offline') }}</h4>
                  <p class="text-gray-600 text-sm">{{ $t('home.benefits.items.offline') }}</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ $t('home.benefits.items.timing') }}</h4>
                  <p class="text-gray-600 text-sm">{{ $t('home.benefits.items.timing') }}</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ $t('home.benefits.items.offline') }}</h4>
                  <p class="text-gray-600 text-sm">{{ $t('home.benefits.items.offline') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Page metadata for SEO
useHead({
  title: computed(() => `${t('home.title')} - ${t('home.subtitle')}`),
  meta: [
    { 
      name: 'description', 
      content: computed(() => t('home.description'))
    },
    {
      name: 'keywords',
      content: 'German A2, reading comprehension, Goethe Institut, German exam preparation, A2 practice, German language learning'
    }
  ]
})
</script> 