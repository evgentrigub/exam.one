<template>
  <div class="fixed inset-0 bg-white z-50 overflow-hidden">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <NuxtLink 
          to="/reading"
          class="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to selection
        </NuxtLink>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{ text?.textType }} • A2 Level</span>
          <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Quiz Mode
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="h-full flex overflow-hidden" style="height: calc(100vh - 73px)">
      <!-- Text Panel (Left) -->
      <div class="w-1/2 bg-gray-50 border-r border-gray-200">
        <div class="p-6">
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-gray-900">{{ text?.title }}</h2>
              </div>
            </div>
            <div class="overflow-y-auto p-6 bg-gray-50">
              <div class="prose max-w-none">
                <div class="whitespace-pre-line text-gray-800 leading-relaxed">{{ text?.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions Panel (Right) -->
      <div class="w-1/2 bg-white overflow-y-auto">
        <QuizSession 
          v-if="text"
          :text="text"
          :is-side-by-side="true"
          @exit="goBack"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { germanTexts } from '~/data/german-texts'
import type { GermanText } from '~/utils/types'
import QuizSession from '~/components/reading/QuizSession.vue'

const route = useRoute()
const router = useRouter()
const quizId = computed(() => String(route.params.quizId || ''))
const text = computed<GermanText | null>(() => germanTexts.find(t => t.id === quizId.value) || null)

if (!text.value) {
  // If invalid id, redirect back to list
  router.replace('/reading')
}

function goBack() {
  router.push('/reading')
}

// Page meta
useHead({
  title: text.value ? `${text.value.title} – Quiz` : 'Reading Quiz',
})

// Disable Nuxt route preloading
definePageMeta({ preload: false })
</script>
