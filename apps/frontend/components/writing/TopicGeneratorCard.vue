<template>
  <div class="bg-base-100 border border-base-300/70 rounded-box p-5 sm:p-6">
    <div v-if="generationError" class="space-y-4">
      <div class="alert alert-error items-start">
        <AlertCircle :size="18" class="shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 class="font-bold">{{ t('generation.failed') }}</h3>
          <div class="text-sm">{{ generationError }}</div>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary btn-sm" type="button" @click="$emit('retry')">
          {{ t('generation.retry') }}
        </button>
        <button class="btn btn-ghost btn-sm" type="button" @click="$emit('dismiss')">
          {{ t('generation.dismiss') }}
        </button>
      </div>
    </div>

    <div v-else-if="isGenerating" class="py-7 text-center">
      <span class="loading loading-spinner loading-md text-primary mb-4" />
      <h3 class="text-lg font-bold text-base-content mb-2">
        {{ t('writing.topicGenerator.generating') }}
      </h3>
      <p class="text-sm text-base-content/70">
        {{
          t('writing.topicGenerator.creating', {
            part: t('writing.common.partN', { n: generatingPart === 1 ? 1 : 2 }),
            level: currentDifficulty,
          })
        }}
      </p>
    </div>

    <div v-else class="flex flex-col lg:flex-row lg:items-center gap-5">
      <div
        class="w-12 h-12 rounded-field bg-primary/10 text-primary grid place-items-center shrink-0"
      >
        <Sparkles :size="22" aria-hidden="true" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-display text-lg font-bold">
          {{ t('writing.topicGenerator.title') }}
        </h3>
        <p class="text-sm text-base-content/60 mt-1">
          {{ t('writing.topicGenerator.description', { level: currentDifficulty }) }}
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          class="btn btn-primary btn-sm rounded-full gap-2"
          type="button"
          @click="$emit('generate', 1)"
        >
          <Plus :size="14" aria-hidden="true" />
          {{ t('writing.common.partN', { n: 1 }) }}
        </button>
        <button
          class="btn btn-outline btn-sm rounded-full gap-2"
          type="button"
          @click="$emit('generate', 2)"
        >
          <Plus :size="14" aria-hidden="true" />
          {{ t('writing.common.partN', { n: 2 }) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Plus, Sparkles } from 'lucide-vue-next'

interface Props {
  isGenerating: boolean
  generatingPart: 1 | 2 | null
  generationError: string | null
  currentDifficulty: 'A2' | 'C1'
}

defineProps<Props>()
const { t } = useI18n()

defineEmits<{
  generate: [part: 1 | 2]
  retry: []
  dismiss: []
}>()
</script>
