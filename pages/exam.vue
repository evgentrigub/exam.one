<template>
  <div>
    <NuxtLayout name="exam">
      <template #timer>
        <div class="flex items-center space-x-2 text-red-500 font-mono text-xl">
          <Icon name="ph:timer-duotone" />
          <span>{{ timer.formattedTime.value }}</span>
        </div>
      </template>

      <div v-if="exam && currentPart" class="space-y-8">
        <ExamPartRenderer :part="currentPart" />

        <!-- Navigation -->
        <div class="flex justify-between items-center mt-8">
          <button
            :disabled="currentPartIndex === 0"
            class="px-6 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50"
            @click="prevPart"
          >
            Previous Part
          </button>
          <span class="text-sm text-gray-600">Part {{ currentPartIndex + 1 }} of {{ exam.parts.length }}</span>
          <button
            v-if="currentPartIndex < exam.parts.length - 1"
            class="px-6 py-2 bg-teal-600 text-white rounded-md"
            @click="nextPart"
          >
            Next Part
          </button>
          <button
            v-else
            class="px-6 py-2 bg-blue-600 text-white rounded-md"
            @click="finishExam"
          >
            Finish Exam
          </button>
        </div>
      </div>

      <div v-else>
        <p>Loading exam...</p>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { Exam } from '~/types/exam'
import ExamPartRenderer from '~/components/exam/ExamPartRenderer.vue'

const { fetchSampleExam } = useExamApi()
const exam = ref<Exam | null>(null)
const currentPartIndex = ref(0)

const currentPart = computed(() => {
  return exam.value?.parts[currentPartIndex.value]
})

// 30 minutes for the exam
const timer = useTimer(30 * 60)

const nextPart = () => {
  if (exam.value && currentPartIndex.value < exam.value.parts.length - 1) {
    currentPartIndex.value++
  }
}

const prevPart = () => {
  if (currentPartIndex.value > 0) {
    currentPartIndex.value--
  }
}

const finishExam = () => {
  timer.stop()
  console.log('Exam Finished!')
  // TODO: Navigate to results page
}

onMounted(async () => {
  exam.value = await fetchSampleExam()
  timer.start()
})
</script> 