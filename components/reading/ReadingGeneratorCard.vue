<template>
  <div class="bg-base-100 border border-primary/30 ring-soft rounded-box overflow-hidden card-hov">
    <!-- Error State -->
    <div v-if="generationError" class="p-5 sm:p-6">
      <div class="alert alert-error mb-4 items-start">
        <CircleAlert :size="22" class="shrink-0" />
        <div>
          <h3 class="font-bold">{{ $t('generation.failed') }}</h3>
          <div class="text-sm">{{ generationError }}</div>
        </div>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          class="btn btn-primary btn-sm gap-1.5"
          @click="$emit('retry')"
        >
          <RotateCcw :size="13" />
          {{ $t('generation.retry') }}
        </button>
        <button
          class="btn btn-ghost btn-sm"
          @click="$emit('dismiss')"
        >
          {{ $t('generation.dismiss') }}
        </button>
      </div>
    </div>

    <!-- Generating State -->
    <div v-else-if="isGenerating" class="p-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <span class="loading loading-spinner loading-lg text-primary shrink-0" />
        <div>
          <h3 class="font-display text-xl font-bold text-base-content">{{ $t('generation.readingTitle') }}</h3>
          <p class="text-sm text-base-content/70 mt-1">
            {{ $t('generation.readingDescription', { level: generatingDifficulty }) }}
          </p>
        </div>
      </div>

      <div v-if="generationJobs && generationJobs.length > 0" class="space-y-2">
        <div
          v-for="job in generationJobs"
          :key="job.part"
          class="flex items-center justify-between rounded-box border border-base-300 bg-base-200/40 px-3 py-2"
        >
          <span class="text-sm font-medium text-base-content">{{ $t('exercisesUi.part') }} {{ job.part }}</span>
          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded-selector uppercase"
            :class="statusClass(job.status)"
          >
            {{ $t(statusKey(job.status)) }}
          </span>
        </div>
      </div>

      <p class="text-xs text-base-content/50 mt-3">
        {{ $t('generation.hintResumable') }}
      </p>
    </div>

    <!-- Resume State -->
    <div v-else-if="canResumeGeneration" class="p-5 sm:p-6">
      <div class="flex items-start gap-3 mb-4">
        <div class="w-12 h-12 rounded-box bg-reading-soft text-reading grid place-items-center shrink-0">
          <BookOpen :size="22" />
        </div>
        <div>
          <div class="text-[11px] font-medium uppercase tracking-wider text-base-content/50">{{ $t('generation.aiLabel') }}</div>
          <h3 class="font-display text-xl font-bold text-base-content mt-1">{{ $t('generation.resumeTitle') }}</h3>
          <p class="text-sm text-base-content/70 mt-1">
            {{ $t('generation.resumeDescription', { count: remainingJobsCount }) }}
          </p>
        </div>
      </div>

      <div v-if="generationJobs && generationJobs.length > 0" class="space-y-2 mb-4">
        <div
          v-for="job in generationJobs"
          :key="job.part"
          class="flex items-center justify-between rounded-box border border-base-300 bg-base-200/40 px-3 py-2"
        >
          <span class="text-sm font-medium text-base-content">{{ $t('exercisesUi.part') }} {{ job.part }}</span>
          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded-selector uppercase"
            :class="statusClass(job.status)"
          >
            {{ $t(statusKey(job.status)) }}
          </span>
        </div>
      </div>

      <div class="flex gap-2 flex-wrap">
        <button
          class="btn btn-primary btn-sm gap-1.5"
          @click="$emit('resume')"
        >
          <Play :size="13" />
          {{ $t('generation.resume') }}
        </button>
        <button
          class="btn btn-ghost btn-sm"
          @click="$emit('dismiss')"
        >
          {{ $t('generation.dismiss') }}
        </button>
      </div>
    </div>

    <!-- Default State: Generator Button -->
    <div v-else class="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-5">
      <div class="w-12 h-12 rounded-box bg-reading-soft text-reading grid place-items-center shrink-0">
        <BookOpen :size="22" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="text-[11px] font-medium uppercase tracking-wider text-base-content/50">{{ $t('generation.aiLabel') }}</div>
        <h3 class="font-display text-xl font-bold text-base-content mt-1">{{ $t('generation.generateReadingTitle') }}</h3>
        <p class="text-sm text-base-content/70 mt-1">
          {{ $t('generation.generateReadingDescription', { level: currentDifficulty }) }}
        </p>
        <p class="text-xs text-base-content/50 mt-2">
          {{ currentDifficulty === 'A2'
            ? $t('generation.a2PartsHint', { part: $t('exercisesUi.part') })
            : $t('generation.otherPartsHint') }}
        </p>
      </div>

      <button
        class="btn btn-primary btn-sm gap-1.5 shrink-0"
        @click="$emit('generate')"
      >
        <Plus :size="14" />
        {{ $t('generation.generateExercises') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, CircleAlert, Play, Plus, RotateCcw } from 'lucide-vue-next'
import { computed } from 'vue'
import type { PartGenerationJob } from '~/utils/generation/partJobs'

interface Props {
  isGenerating: boolean
  generatingDifficulty: 'A2' | 'C1' | null
  generationError: string | null
  currentDifficulty: 'A2' | 'C1'
  generationJobs?: PartGenerationJob[]
  canResumeGeneration?: boolean
}

const props = defineProps<Props>()

const remainingJobsCount = computed(() =>
  (props.generationJobs ?? []).filter(job => job.status === 'queued' || job.status === 'failed').length
)

function statusKey(status: PartGenerationJob['status']) {
  const keys: Record<PartGenerationJob['status'], string> = {
    queued: 'generation.statusQueued',
    running: 'generation.statusRunning',
    done: 'generation.statusDone',
    failed: 'generation.statusFailed'
  }
  return keys[status]
}

function statusClass(status: PartGenerationJob['status']) {
  const classes: Record<PartGenerationJob['status'], string> = {
    queued: 'bg-base-300 text-base-content/70',
    running: 'bg-primary text-primary-content',
    done: 'bg-success text-success-content',
    failed: 'bg-error text-error-content'
  }
  return classes[status]
}

defineEmits<{
  generate: []
  resume: []
  retry: []
  dismiss: []
}>()
</script>
