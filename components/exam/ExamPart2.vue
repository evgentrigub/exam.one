<template>
  <div class="p-8 bg-white rounded-lg shadow-md">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
      Teil 2
    </h3>
    <p class="mb-6 text-gray-600 italic">
      {{ part.instructions }}
    </p>

    <div class="mb-8 p-6 border rounded-lg bg-gray-50">
      <h4 class="font-bold text-gray-800 mb-2">
        {{ part.article.title }}
      </h4>
      <p class="text-gray-700 whitespace-pre-line">
        {{ part.article.content }}
      </p>
    </div>

    <div class="space-y-6">
      <div v-for="question in part.questions" :key="question.id">
        <p class="font-semibold text-gray-800 mb-2">
          {{ question.prompt }}
        </p>
        <div class="flex space-x-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" :name="`q-${question.id}`" value="richtig" class="form-radio text-teal-600">
            <span>Richtig</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" :name="`q-${question.id}`" value="falsch" class="form-radio text-teal-600">
            <span>Falsch</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamPart2 } from '~/types/exam'

defineProps<{
  part: ExamPart2
}>()
</script> 