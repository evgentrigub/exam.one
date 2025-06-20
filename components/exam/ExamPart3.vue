<template>
  <div class="p-8 bg-white rounded-lg shadow-md">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
      Teil 3
    </h3>
    <p class="mb-6 text-gray-600 italic">
      {{ part.instructions }}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Opinions -->
      <div class="space-y-4">
        <div v-for="(opinion, index) in part.opinions" :key="opinion.id" class="flex items-start">
          <span class="font-bold mr-2">{{ index + 11 }}.</span>
          <div class="flex-grow">
            <p class="text-gray-800">{{ opinion.text }}</p>
            <select class="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
              <option value="">Wählen Sie eine Webseite...</option>
              <option v-for="website in part.websites" :key="website.id" :value="website.id">
                Webseite {{ website.id.replace('w', '').toUpperCase() }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Websites -->
      <div class="space-y-4">
        <div v-for="website in part.websites" :key="website.id" class="p-4 border rounded-lg bg-gray-50">
          <p class="font-bold text-gray-800 mb-2">Webseite {{ website.id.replace('w', '').toUpperCase() }}</p>
          <a :href="`//${website.url}`" target="_blank" class="text-teal-600 hover:underline">{{ website.url }}</a>
          <h4 class="font-semibold mt-1">{{ website.title }}</h4>
          <p class="text-gray-700 text-sm mt-1">{{ website.snippet }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamPart3 } from '~/types/exam'

defineProps<{
  part: ExamPart3
}>()
</script> 