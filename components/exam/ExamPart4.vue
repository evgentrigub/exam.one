<template>
  <div class="p-8 bg-white rounded-lg shadow-md">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
      Teil 4
    </h3>
    <p class="mb-6 text-gray-600 italic">
      {{ part.instructions }}
    </p>

    <div class="mb-8 p-6 border rounded-lg bg-gray-50">
      <p class="text-gray-700 whitespace-pre-line">
        {{ part.context }}
      </p>
    </div>

    <div class="space-y-6">
      <div v-for="statement in part.statements" :key="statement.id">
        <p class="font-semibold text-gray-800 mb-2">
          {{ statement.prompt }}
        </p>
        <div class="flex space-x-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" :name="`q-${statement.id}`" :value="true" class="form-radio text-teal-600">
            <span>Richtig</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" :name="`q-${statement.id}`" :value="false" class="form-radio text-teal-600">
            <span>Falsch</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamPart4 } from '~/types/exam'

defineProps<{
  part: ExamPart4
}>()
</script> 