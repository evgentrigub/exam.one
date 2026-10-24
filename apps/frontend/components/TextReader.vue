<template>
  <div class="max-w-4xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-base-200 px-6 py-4 border-b border-base-300">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="getTextTypeStyle(text.textType)"
          >
            {{ getTypeLabel(text.textType, t) }}
          </span>
          <div class="text-sm text-base-content/70">{{ t('reading.level', { level: text.difficulty }) }}</div>
        </div>
        <button
          class="p-2 hover:bg-base-300 rounded-lg transition-colors"
          :aria-label="t('reading.closeText')"
          @click="$emit('close')"
        >
          <svg
            class="w-5 h-5 text-base-content/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Text Content -->
    <div class="p-6 md:p-8">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-base-content mb-2">
          {{ text.title }}
        </h1>

        <!-- Metadata -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-base-content/70 mb-6">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ t('reading.minutesRead', { minutes: text.estimatedReadingTime }) }}
          </div>
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {{ text.wordCount }} {{ t('exercisesUi.words') }}
          </div>
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <div class="flex flex-wrap gap-1">
              <span v-for="(topic, index) in text.topics" :key="topic" class="text-base-content/70">
                {{ topic }}<span v-if="index < text.topics.length - 1">, </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Text Content -->
      <div class="prose prose-lg max-w-none text-content text-base-content">
        <div class="whitespace-pre-line text-lg leading-relaxed">
          {{ text.content }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 pt-6 border-t border-base-300 flex flex-col sm:flex-row gap-3">
        <button
          class="flex-1 px-6 py-3 bg-base-200 text-base-content rounded-lg font-medium hover:bg-base-300 transition-colors"
          @click="$emit('close')"
        >
          {{ t('reading.backToOverview') }}
        </button>
        <button
          class="flex-1 px-6 py-3 btn btn-primary text-primary-content rounded-lg font-medium transition-colors"
          :disabled="!text.questions || text.questions.length === 0"
          @click="$emit('startQuestions', text.id)"
        >
          {{
            text.questions && text.questions.length > 0
              ? t('reading.answerQuestions')
              : t('reading.noQuestions')
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReadingExercise } from '~/utils/exercises/reading'
import { getTypeLabel } from '~/utils/labels'

interface Props {
  text: ReadingExercise
}

defineProps<Props>()
defineEmits<{
  close: []
  startQuestions: [textId: string]
}>()

const { t } = useI18n()

// Text type styling
const textTypeStyles = {
  email: 'bg-info/20 text-info',
  notice: 'bg-warning/20 text-warning',
  article: 'bg-success/20 text-success',
  advertisement: 'bg-secondary/20 text-secondary',
  instructions: 'bg-accent/20 text-accent',
  announcement: 'bg-error/20 text-error',
}

function getTextTypeStyle(type: string) {
  return textTypeStyles[type as keyof typeof textTypeStyles] || 'bg-base-200 text-base-content'
}
</script>

<style scoped>
.text-content {
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
}

/* Responsive text sizing */
@media (max-width: 640px) {
  .text-content {
    font-size: 1rem;
    line-height: 1.6;
  }
}
</style>
