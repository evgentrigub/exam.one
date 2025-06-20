<template>
  <div class="flex flex-col items-center justify-center py-12 md:py-24">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900">
        German A2 Reading Trainer
      </h1>
      <p class="mt-2 text-lg text-gray-600">
        Goethe Institut Exam Preparation
      </p>
    </div>

    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 text-center">
      <div class="inline-block p-4 bg-blue-100 rounded-full mb-4">
        <Icon name="ph:book-open-duotone" class="w-10 h-10 text-blue-600" />
      </div>

      <h2 class="text-3xl font-bold text-gray-900">
        Improve Your Reading Comprehension
      </h2>
      <p class="mt-2 text-gray-600">
        Practice German reading comprehension with authentic A2-level texts
        designed for Goethe Institut exam preparation.
      </p>

      <NuxtLink
        to="/login"
        class="mt-8 inline-block w-full max-w-xs py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        Start Reading Practice &rarr;
      </NuxtLink>

      <div class="mt-8 flex justify-center space-x-6 text-sm text-gray-500">
        <span class="flex items-center">
          <Icon name="ph:check-circle-duotone" class="w-5 h-5 text-green-500 mr-1.5" />
          Offline Practice
        </span>
        <span class="flex items-center">
          <Icon name="ph:check-circle-duotone" class="w-5 h-5 text-green-500 mr-1.5" />
          Instant Feedback
        </span>
        <span class="flex items-center">
          <Icon name="ph:check-circle-duotone" class="w-5 h-5 text-green-500 mr-1.5" />
          Progress Tracking
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script> 