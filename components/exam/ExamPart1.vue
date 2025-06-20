<template>
  <div class="p-8 bg-white rounded-lg shadow-md">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
      Teil 1
    </h3>
    <p class="mb-6 text-gray-600 italic">
      {{ part.instructions }}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Situations -->
      <div class="space-y-4">
        <div v-for="(situation, index) in part.situations" :key="situation.id" class="flex items-start">
          <span class="font-bold mr-2">{{ index + 1 }}.</span>
          <div class="flex-grow">
            <p class="text-gray-800">{{ situation.text }}</p>
            <select class="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
              <option value="">Wählen Sie eine Anzeige...</option>
              <option v-for="ad in part.ads" :key="ad.id" :value="ad.id">
                Anzeige {{ ad.id.toUpperCase() }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Ads -->
      <div class="space-y-4">
        <div v-for="ad in part.ads" :key="ad.id" class="p-4 border rounded-lg bg-gray-50">
          <p class="font-bold text-gray-800 mb-2">Anzeige {{ ad.id.toUpperCase() }}</p>
          <p class="text-gray-700">{{ ad.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamPart1 } from '~/types/exam'

defineProps<{
  part: ExamPart1
}>()
</script> 