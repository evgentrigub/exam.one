<template>
  <div class="card bg-base-100 shadow h-full flex flex-col">
    <!-- Card Header -->
    <div class="bg-info/10 px-6 py-4 border-b flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <h2 class="card-title text-lg">Description</h2>
            <p class="text-sm text-info">{{ getTopicTypeLabel(topic.topicType) }} • {{ topic.difficulty }}</p>
          </div>
        </div>

        <!-- Writing Mode Buttons -->
        <div class="join">
          <button
            v-for="mode in writingModes"
            :key="mode.id"
            class="join-item btn btn-outline btn-primary btn-sm"
            :class="currentMode === mode.id ? 'btn-active' : 'btn-ghost'"
            @click="$emit('mode-change', mode.id as WritingMode)"
          >
            <div class="flex items-center space-x-1">
              <!-- Quick Mode Icon -->
              <svg v-if="mode.id === 'quick'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <!-- Challenge Mode Icon -->
              <svg v-else-if="mode.id === 'challenge'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <!-- Model Help Icon -->
              <svg v-else-if="mode.id === 'model-help'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ mode.label }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-body flex-1 overflow-y-auto min-h-0">
      <!-- Topic Title -->
      <div class="mb-4">
        <h3 class="text-xl font-bold text-base-content mb-2">{{ topic.title }}</h3>
        <div class="flex items-center gap-4 text-sm">
          <div class="badge badge-outline gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ topic.estimatedTime }} minutes
          </div>
          <div class="badge badge-outline gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ topic.wordCount.min }}-{{ topic.wordCount.max }} words
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-base-content opacity-70 mb-2 uppercase tracking-wide">What you should write</h4>
        <p class="text-base-content leading-relaxed text-sm">{{ topic.description }}</p>
      </div>

      <!-- Writing Tips (if available) -->
      <div v-if="writingTips.length > 0 && (currentMode === 'quick' || currentMode === 'model-help')" class="alert alert-warning shadow-sm items-start">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <div class="w-full">
            <h4 class="text-sm font-semibold mb-2">Writing Tips</h4>
            <ul class="space-y-2">
              <li v-for="tip in writingTips" :key="tip" class="flex items-start text-sm">
                <span class="mr-2">•</span>
                <span>{{ tip }}</span>
              </li>
            </ul>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WritingTopic } from '~/utils/types'
import type { WritingMode } from '~/composables/useWritingMode'
import { writingTipsC1Teil1, writingTipsC1Teil2 } from '~/data/writing/exerciseTopicsWriting'

interface Props {
  topic: WritingTopic
  currentMode?: WritingMode
}

const props = defineProps<Props>()

defineEmits<{
  'mode-change': [mode: WritingMode]
}>()

// Writing modes configuration
const writingModes = [
  {
    id: 'quick',
    label: 'Quick'
  },
  {
    id: 'challenge',
    label: 'Challenge'
  },
  {
    id: 'model-help',
    label: 'Model Help'
  }
]

// Topic type labels in German
const topicTypeLabels = {
  email: 'E-Mail',
  letter: 'Brief',
  essay: 'Aufsatz',
  form: 'Formular',
  postcard: 'Postkarte',
  note: 'Notiz'
}

const writingTips = computed(() => {
  return props.topic.testingPart === 1 ? writingTipsC1Teil1 : writingTipsC1Teil2
})

function getTopicTypeLabel(type: string) {
  return topicTypeLabels[type as keyof typeof topicTypeLabels] || type
}
</script>
