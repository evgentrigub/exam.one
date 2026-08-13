<template>
  <div class="card bg-base-100 shadow h-full flex flex-col">
    <!-- Card Header -->
    <div class="bg-info/10 px-6 py-4 border-b flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center">
            <FileText :size="20" class="text-info" aria-hidden="true" />
          </div>
          <div>
            <h2 class="card-title text-lg">Description</h2>
            <p class="text-sm text-info">
              {{ getTopicTypeLabel(topic.topicType) }} • {{ topic.difficulty }}
            </p>
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
              <Zap v-if="mode.id === 'quick'" :size="16" aria-hidden="true" />
              <!-- Challenge Mode Icon -->
              <Clock v-else-if="mode.id === 'challenge'" :size="16" aria-hidden="true" />
              <!-- Model Help Icon -->
              <CircleHelp v-else-if="mode.id === 'model-help'" :size="16" aria-hidden="true" />
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
            <Clock :size="16" aria-hidden="true" />
            {{ topic.estimatedTime }} minutes
          </div>
          <div class="badge badge-outline gap-2">
            <FileText :size="16" aria-hidden="true" />
            {{ topic.wordCount.min }}-{{ topic.wordCount.max }} words
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-base-content opacity-70 mb-2 uppercase tracking-wide">
          What you should write
        </h4>
        <p class="text-base-content leading-relaxed text-sm">{{ topic.description }}</p>
      </div>

      <!-- Writing Tips (if available) -->
      <div
        v-if="writingTips.length > 0 && (currentMode === 'quick' || currentMode === 'model-help')"
        class="alert alert-warning shadow-sm items-start"
      >
        <Lightbulb :size="20" class="flex-shrink-0 mt-0.5" aria-hidden="true" />
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
import { CircleHelp, Clock, FileText, Lightbulb, Zap } from 'lucide-vue-next'
import type { WritingExercise } from '~/utils/types'
import type { WritingMode } from '~/composables/useWritingMode'
import { getWritingTips } from '~/data/writing/exerciseTips'

interface Props {
  topic: WritingExercise
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
    label: 'Quick',
  },
  {
    id: 'challenge',
    label: 'Challenge',
  },
  {
    id: 'model-help',
    label: 'Model Help',
  },
]

// Topic type labels in German
const topicTypeLabels = {
  email: 'E-Mail',
  letter: 'Brief',
  essay: 'Aufsatz',
  form: 'Formular',
  postcard: 'Postkarte',
  note: 'Notiz',
}

const writingTips = computed(() => {
  return getWritingTips(props.topic.difficulty, props.topic.testingPart)
})

function getTopicTypeLabel(type: string) {
  return topicTypeLabels[type as keyof typeof topicTypeLabels] || type
}
</script>
