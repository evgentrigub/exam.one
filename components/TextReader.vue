<template>
  <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span 
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="getTextTypeStyle(text.textType)"
          >
            {{ getTextTypeLabel(text.textType) }}
          </span>
          <div class="text-sm text-gray-600">
            {{ text.difficulty }} Level
          </div>
        </div>
        <button 
          class="p-2 hover:bg-white/50 rounded-lg transition-colors"
          aria-label="Text schließen"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Text Content -->
    <div class="p-6 md:p-8">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {{ text.title }}
        </h1>
        
        <!-- Metadata -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ text.estimatedReadingTime }} Min Lesezeit
          </div>
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ text.wordCount }} Wörter
          </div>
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="(topic, index) in text.topics" 
                :key="topic"
                class="text-gray-600"
              >
                {{ topic }}<span v-if="index < text.topics.length - 1">, </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Text Content -->
      <div class="prose prose-lg max-w-none text-content">
        <div class="whitespace-pre-line text-lg leading-relaxed text-gray-800">
          {{ text.content }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3">
        <button 
          class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          @click="$emit('close')"
        >
          Zurück zur Übersicht
        </button>
        <button 
          class="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          :disabled="!text.questions || text.questions.length === 0"
          @click="$emit('startQuestions', text.id)"
        >
          {{ text.questions && text.questions.length > 0 ? 'Fragen beantworten' : 'Keine Fragen verfügbar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GermanText } from '~/utils/types'

interface Props {
  text: GermanText
}

defineProps<Props>()
defineEmits<{
  close: []
  startQuestions: [textId: string]
}>()

// Text type styling
const textTypeStyles = {
  email: 'bg-blue-100 text-blue-800',
  notice: 'bg-yellow-100 text-yellow-800', 
  article: 'bg-green-100 text-green-800',
  advertisement: 'bg-purple-100 text-purple-800',
  instructions: 'bg-orange-100 text-orange-800',
  announcement: 'bg-red-100 text-red-800'
}

// Text type labels in German
const textTypeLabels = {
  email: 'E-Mail',
  notice: 'Hinweis',
  article: 'Artikel', 
  advertisement: 'Anzeige',
  instructions: 'Anleitung',
  announcement: 'Ankündigung'
}

function getTextTypeLabel(type: string) {
  return textTypeLabels[type as keyof typeof textTypeLabels] || type
}

function getTextTypeStyle(type: string) {
  return textTypeStyles[type as keyof typeof textTypeStyles] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.text-content {
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}

/* Responsive text sizing */
@media (max-width: 640px) {
  .text-content {
    font-size: 1rem;
    line-height: 1.6;
  }
}
</style> 