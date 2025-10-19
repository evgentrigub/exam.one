<template>
  <div class="card bg-base-100 shadow">
    <!-- Feedback Header -->
    <div class="bg-base-200 px-6 py-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="text-2xl">{{ displayInfo.icon }}</div>
          <div>
            <h3 class="card-title text-lg">{{ displayInfo.title }}</h3>
            <p class="text-sm opacity-75">Bewertung deines Textes</p>
          </div>
        </div>
        
        <!-- Overall Score -->
        <div class="stat place-items-center p-0">
          <div class="stat-value text-2xl" :class="scoreColor">{{ feedback.overallScore }}/5</div>
          <div class="stat-desc">Gesamtbewertung</div>
        </div>
      </div>
    </div>

    <!-- Feedback Content -->
    <div class="card-body">
      <!-- Score Breakdown -->
      <div class="stats stats-vertical md:stats-horizontal shadow mb-6 w-full">
        <!-- Word Count Status -->
        <div class="stat place-items-center">
          <div class="stat-figure" :class="feedback.wordCountValid ? 'text-success' : 'text-error'">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div class="stat-title">Wortanzahl</div>
          <div class="stat-value" :class="feedback.wordCountValid ? 'text-success' : 'text-error'">
            {{ feedback.wordCountValid ? '✓' : '✗' }}
          </div>
          <div class="stat-desc">{{ feedback.wordCountValid ? 'Perfekt!' : 'Prüfen' }}</div>
        </div>

        <!-- Structure Score -->
        <div class="stat place-items-center">
          <div class="stat-figure text-info">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div class="stat-title">Struktur</div>
          <div class="stat-value text-info">{{ feedback.structureScore }}/5</div>
        </div>

        <!-- Completeness Score -->
        <div class="stat place-items-center">
          <div class="stat-figure text-secondary">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-title">Vollständigkeit</div>
          <div class="stat-value text-secondary">{{ feedback.completenessScore }}/5</div>
        </div>
      </div>

      <!-- Suggestions Section -->
      <div class="mb-6">
        <h4 class="text-md font-semibold text-base-content mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          Verbesserungsvorschläge
        </h4>
        
        <div class="space-y-3">
          <div v-for="(suggestion, index) in feedback.suggestions" 
               :key="index"
               class="alert alert-warning">
            <div class="badge badge-warning badge-sm">{{ index + 1 }}</div>
            <p class="text-sm">{{ suggestion }}</p>
          </div>
        </div>
      </div>

      <!-- Analysis Details (Expandable) -->
      <div class="collapse collapse-arrow bg-base-200">
        <input v-model="showDetails" type="checkbox" class="peer" />
        <div class="collapse-title text-sm font-medium">
          Detaillierte Analyse
        </div>
        <div class="collapse-content">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
            <div>
              <h5 class="font-medium text-base-content mb-2">Textstatistiken</h5>
              <ul class="menu menu-compact bg-base-100 rounded-box">
                <li><span>Wörter: {{ analysisResult?.wordCount || 0 }}</span></li>
                <li><span>Sätze: {{ analysisResult?.sentenceCount || 0 }}</span></li>
                <li><span>Ø Satzlänge: {{ Math.round(analysisResult?.averageSentenceLength || 0) }} Wörter</span></li>
                <li><span>Absätze: {{ analysisResult?.structureElements?.paragraphCount || 0 }}</span></li>
              </ul>
            </div>
            <div>
              <h5 class="font-medium text-base-content mb-2">Strukturelemente</h5>
              <ul class="menu menu-compact bg-base-100 rounded-box">
                <li>
                  <span :class="analysisResult?.structureElements?.hasGreeting ? 'text-success' : 'text-error'">
                    {{ analysisResult?.structureElements?.hasGreeting ? '✓' : '✗' }}
                    Anrede/Begrüßung
                  </span>
                </li>
                <li>
                  <span :class="analysisResult?.structureElements?.hasClosing ? 'text-success' : 'text-error'">
                    {{ analysisResult?.structureElements?.hasClosing ? '✓' : '✗' }}
                    Gruß/Abschluss
                  </span>
                </li>
                <li>
                  <span :class="analysisResult?.structureElements?.hasMainContent ? 'text-success' : 'text-error'">
                    {{ analysisResult?.structureElements?.hasMainContent ? '✓' : '✗' }}
                    Hauptinhalt
                  </span>
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
import type { WritingFeedbackModel } from '~/utils/types'
import type { TextAnalysisResult } from '~/utils/textAnalysis'
import { formatFeedbackDisplay } from '~/utils/textAnalysis'

interface Props {
  feedback: WritingFeedbackModel
  analysisResult?: TextAnalysisResult | undefined
}

const props = defineProps<Props>()

// Reactive state
const showDetails = ref(false)

// Computed properties
const displayInfo = computed(() => formatFeedbackDisplay(props.feedback))

const scoreColor = computed(() => {
  const score = props.feedback.overallScore
  if (score >= 4) return 'text-success'
  if (score >= 3) return 'text-info'
  if (score >= 2) return 'text-warning'
  return 'text-error'
})
</script>
