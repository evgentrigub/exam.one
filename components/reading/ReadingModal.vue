<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    @keydown.esc.prevent.stop="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />

    <!-- Panel -->
    <div class="relative z-10 w-full max-w-4xl mx-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <button
            @click="$emit('close')"
            class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('practice.reading.backToSelection') }}
          </button>
          <div class="flex items-center space-x-4 text-sm text-gray-600">
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{{ text.textType }}</span>
            <span>A2 • {{ text.wordCount }} Wörter</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-8">
        <div class="flex items-center mb-6">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">{{ text.title }}</h2>
        </div>

        <div class="prose prose-lg max-w-none h-[55vh] overflow-y-auto border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div class="whitespace-pre-line text-gray-800 leading-relaxed font-medium">{{ text.content }}</div>
        </div>

        <!-- Start Questions Button -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <div class="bg-blue-50 rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">Ready for the questions?</h3>
                  <p class="text-gray-600">Test your text comprehension with {{ text.questions?.length || 4 }} multiple-choice questions.</p>
                </div>
              </div>
              <button
                @click="$emit('startQuiz', text.id)"
                class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
              >
                {{ $t('practice.reading.startQuestions') }}
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Close (X) button for additional accessibility -->
      <button
        class="absolute top-3 right-3 p-2 rounded-md text-gray-600 hover:bg-gray-100"
        aria-label="Close"
        @click="$emit('close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GermanText } from '~/utils/types'

interface Props {
  text: GermanText
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  startQuiz: [textId: string]
}>()
</script>
