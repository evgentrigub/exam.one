<template>
  <div
    class="modal modal-open"
    role="dialog"
    aria-modal="true"
    @keydown.esc.prevent.stop="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="modal-backdrop" @click="$emit('close')" />

    <!-- Panel -->
    <div class="modal-box w-11/12 max-w-4xl p-0">
      <!-- Header -->
      <div class="bg-base-200 px-6 py-4 border-b">
        <div class="flex items-center justify-between">
          <button
            class="btn btn-soft btn-primary btn-sm gap-2"
            @click="$emit('close')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ $t('practice.reading.backToSelection') }}
          </button>
          <div class="flex items-center gap-4 text-sm">
            <span class="badge badge-primary">{{ text.textType }}</span>
            <span class="text-base-content opacity-70">A2 • {{ text.wordCount }} Wörter</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-8">
        <div class="flex items-center mb-6">
          <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-base-content">{{ text.title }}</h2>
        </div>

        <div class="prose prose-lg max-w-none h-[55vh] overflow-y-auto border rounded-lg p-6 bg-base-200">
          <div class="whitespace-pre-line text-base-content leading-relaxed font-medium">{{ text.content }}</div>
        </div>

        <!-- Start Questions Button -->
        <div class="modal-action mt-8 pt-6 border-t">
          <div class="bg-primary/10 rounded-lg p-4 flex items-center justify-between w-full gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-base-content mb-1">Ready for the questions?</h3>
                <p class="text-base-content opacity-70">Test your text comprehension with {{ text.questions?.length || 4 }} multiple-choice questions.</p>
              </div>
            </div>
            <button
              class="btn btn-primary gap-2 flex-shrink-0"
              @click="$emit('start-quiz', text.id)"
            >
              {{ $t('practice.reading.startQuestions') }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
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
  'start-quiz': [textId: string]
}>()
</script>
