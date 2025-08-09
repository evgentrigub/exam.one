<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200">
    <!-- Feedback Header -->
    <div class="px-6 py-4 border-b border-gray-200 rounded-t-xl"
         :class="headerClasses">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="text-2xl mr-3">{{ displayInfo.icon }}</div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ displayInfo.title }}</h3>
            <p class="text-sm opacity-75">Bewertung deines Textes</p>
          </div>
        </div>
        
        <!-- Overall Score -->
        <div class="text-right">
          <div class="text-2xl font-bold" :class="scoreColor">{{ feedback.overallScore }}/5</div>
          <div class="text-xs opacity-75">Gesamtbewertung</div>
        </div>
      </div>
    </div>

    <!-- Feedback Content -->
    <div class="p-6">
      <!-- Score Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Word Count Status -->
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="flex items-center justify-center mb-2">
            <svg class="w-5 h-5 mr-2" :class="feedback.wordCountValid ? 'text-green-600' : 'text-red-600'" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="font-medium" :class="feedback.wordCountValid ? 'text-green-600' : 'text-red-600'">
              Wortanzahl
            </span>
          </div>
          <div class="text-sm text-gray-600">
            {{ feedback.wordCountValid ? 'Perfekt!' : 'Prüfen' }}
          </div>
        </div>

        <!-- Structure Score -->
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="flex items-center justify-center mb-2">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <span class="font-medium text-blue-600">Struktur</span>
          </div>
          <div class="text-lg font-bold text-blue-600">{{ feedback.structureScore }}/5</div>
        </div>

        <!-- Completeness Score -->
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="flex items-center justify-center mb-2">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="font-medium text-purple-600">Vollständigkeit</span>
          </div>
          <div class="text-lg font-bold text-purple-600">{{ feedback.completenessScore }}/5</div>
        </div>
      </div>

      <!-- Suggestions Section -->
      <div class="mb-6">
        <h4 class="text-md font-semibold text-gray-900 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          Verbesserungsvorschläge
        </h4>
        
        <div class="space-y-3">
          <div v-for="(suggestion, index) in feedback.suggestions" 
               :key="index"
               class="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span class="text-xs font-semibold text-yellow-800">{{ index + 1 }}</span>
            </div>
            <p class="text-sm text-yellow-800">{{ suggestion }}</p>
          </div>
        </div>
      </div>

      <!-- Analysis Details (Expandable) -->
      <div class="border-t border-gray-200 pt-4">
        <button 
          @click="showDetails = !showDetails"
          class="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span class="text-sm font-medium text-gray-700">Detaillierte Analyse</span>
          <svg class="w-4 h-4 text-gray-400 transition-transform" 
               :class="{ 'rotate-180': showDetails }"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <div v-if="showDetails" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 class="font-medium text-gray-900 mb-2">Textstatistiken</h5>
              <ul class="space-y-1 text-gray-600">
                <li>Wörter: {{ analysisResult?.wordCount || 0 }}</li>
                <li>Sätze: {{ analysisResult?.sentenceCount || 0 }}</li>
                <li>Ø Satzlänge: {{ Math.round(analysisResult?.averageSentenceLength || 0) }} Wörter</li>
                <li>Absätze: {{ analysisResult?.structureElements?.paragraphCount || 0 }}</li>
              </ul>
            </div>
            <div>
              <h5 class="font-medium text-gray-900 mb-2">Strukturelemente</h5>
              <ul class="space-y-1 text-gray-600">
                <li class="flex items-center">
                  <span :class="analysisResult?.structureElements?.hasGreeting ? 'text-green-600' : 'text-red-600'">
                    {{ analysisResult?.structureElements?.hasGreeting ? '✓' : '✗' }}
                  </span>
                  <span class="ml-2">Anrede/Begrüßung</span>
                </li>
                <li class="flex items-center">
                  <span :class="analysisResult?.structureElements?.hasClosing ? 'text-green-600' : 'text-red-600'">
                    {{ analysisResult?.structureElements?.hasClosing ? '✓' : '✗' }}
                  </span>
                  <span class="ml-2">Gruß/Abschluss</span>
                </li>
                <li class="flex items-center">
                  <span :class="analysisResult?.structureElements?.hasMainContent ? 'text-green-600' : 'text-red-600'">
                    {{ analysisResult?.structureElements?.hasMainContent ? '✓' : '✗' }}
                  </span>
                  <span class="ml-2">Hauptinhalt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WritingFeedback } from '~/utils/types'
import type { TextAnalysisResult } from '~/utils/textAnalysis'
import { formatFeedbackDisplay } from '~/utils/textAnalysis'

interface Props {
  feedback: WritingFeedback
  analysisResult?: TextAnalysisResult | undefined
}

const props = defineProps<Props>()

// Reactive state
const showDetails = ref(false)

// Computed properties
const displayInfo = computed(() => formatFeedbackDisplay(props.feedback))

const headerClasses = computed(() => {
  const baseClasses = 'bg-gradient-to-r'
  switch (displayInfo.value.color) {
    case 'green':
      return `${baseClasses} from-green-50 to-emerald-50`
    case 'blue':
      return `${baseClasses} from-blue-50 to-cyan-50`
    case 'yellow':
      return `${baseClasses} from-yellow-50 to-orange-50`
    case 'red':
      return `${baseClasses} from-red-50 to-pink-50`
    default:
      return `${baseClasses} from-gray-50 to-slate-50`
  }
})

const scoreColor = computed(() => {
  const score = props.feedback.overallScore
  if (score >= 4) return 'text-green-600'
  if (score >= 3) return 'text-blue-600'
  if (score >= 2) return 'text-yellow-600'
  return 'text-red-600'
})
</script>
