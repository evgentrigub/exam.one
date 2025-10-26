<template>
  <div class="fixed inset-0 bg-white z-50 overflow-hidden">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <NuxtLink 
          to="/reading"
          class="btn btn-ghost btn-sm gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to selection
        </NuxtLink>
        <div class="flex items-center space-x-4">
          <span class="text-sm opacity-70">{{ text?.textType }} • A2 Level</span>
          <div class="badge badge-primary">
            Quiz Mode
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="h-full flex overflow-hidden" style="height: calc(100vh - 73px)">
      <!-- Text Panel (Left) -->
      <div class="w-1/2 bg-base-200 border-r">
        <div class="p-6">
          <div class="card bg-base-100 shadow overflow-hidden">
            <div class="card-body p-6 border-b">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h2 class="card-title">{{ text?.title }}</h2>
              </div>
            </div>
            <div class="overflow-y-auto p-6 bg-base-200">
              <div class="prose max-w-none">
                <div class="whitespace-pre-line leading-relaxed">{{ text?.content }}</div>
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
const quizId = computed(() => String(route.params['quizId'] || ''))
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
