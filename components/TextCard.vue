<template>
  <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <!-- Text Type Badge -->
    <div class="px-4 pt-4">
      <div class="flex items-center justify-between mb-3">
        <span 
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          :class="textTypeStyles[text.textType]"
        >
          <component :is="getTextTypeIcon(text.textType)" class="w-3 h-3 mr-1" />
          {{ getTextTypeLabel(text.textType) }}
        </span>
        <div class="flex items-center text-xs text-gray-500">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {{ text.estimatedReadingTime }} Min
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 pb-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        {{ text.title }}
      </h3>
      
      <!-- Preview of content -->
      <p class="text-gray-600 text-sm mb-4 line-clamp-3">
        {{ getContentPreview(text.content) }}
      </p>

      <!-- Metadata -->
      <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div class="flex items-center">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 0 1 2 0v2h6V2a1 1 0 0 1 2 0v2h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4z"></path>
          </svg>
          {{ formatDate(text.createdAt) }}
        </div>
        <div class="flex items-center">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          {{ text.wordCount }} Wörter
        </div>
      </div>

      <!-- Topics -->
      <div class="flex flex-wrap gap-1 mb-4">
        <span 
          v-for="topic in text.topics" 
          :key="topic"
          class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
        >
          {{ topic }}
        </span>
      </div>

      <!-- Action Button -->
      <button 
        @click="$emit('startReading', text.id)"
        class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
      >
        Text lesen
      </button>
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
  startReading: [textId: string]
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

function getTextTypeIcon(type: string) {
  const icons = {
    email: 'svg',
    notice: 'svg', 
    article: 'svg',
    advertisement: 'svg',
    instructions: 'svg',
    announcement: 'svg'
  }
  // Return a default icon component for now
  return 'svg'
}

function getContentPreview(content: string): string {
  // Remove extra whitespace and get first 120 characters
  const cleanContent = content.replace(/\s+/g, ' ').trim()
  return cleanContent.length > 120 ? cleanContent.substring(0, 120) + '...' : cleanContent
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 