<template>
  <div class="space-y-4 text-sm">
    <div v-if="isLoading" class="text-center py-8 text-base-content/60">
      <span class="loading loading-spinner loading-md text-primary mb-3" />
      <p>Generating an ideal answer...</p>
    </div>

    <div v-else-if="modelAnswer" class="space-y-4">
      <div class="flex items-center gap-2">
        <Lightbulb :size="15" class="text-warning" aria-hidden="true" />
        <div class="font-semibold">Ideal answer</div>
        <span class="ml-auto text-xs px-2 py-1 rounded-full bg-base-200 text-base-content/70">
          {{ modelAnswer.wordCount }} words
        </span>
      </div>

      <div
        class="rounded-box bg-base-200/60 border border-base-300/70 p-4 whitespace-pre-line leading-relaxed text-base-content/85"
      >
        {{ modelAnswer.content }}
      </div>

      <div v-if="highlights.length" class="space-y-2">
        <div class="text-xs font-semibold uppercase tracking-wider text-base-content/50">
          What works well
        </div>
        <div
          v-for="highlight in highlights"
          :key="highlight.label"
          class="rounded-box border border-base-300/70 p-3"
        >
          <div class="flex items-center gap-2 text-xs font-semibold text-base-content/70">
            <CheckCircle2 :size="13" class="text-success" aria-hidden="true" />
            {{ highlight.label }}
          </div>
          <div class="mt-1 text-base-content/80">{{ highlight.value }}</div>
        </div>
      </div>

      <div v-if="keyPhrases.length" class="flex flex-wrap gap-2">
        <span
          v-for="phrase in keyPhrases"
          :key="phrase"
          class="badge badge-outline font-mono text-[11px]"
        >
          {{ phrase }}
        </span>
      </div>
    </div>

    <div v-else-if="errorMessage" class="text-center py-8">
      <Lightbulb :size="24" class="mx-auto text-base-content/30 mb-3" aria-hidden="true" />
      <p class="text-sm font-semibold text-base-content/75">Ideal answer unavailable</p>
      <p class="text-sm text-base-content/60 mt-1">{{ errorMessage }}</p>
      <button
        type="button"
        class="btn btn-outline btn-sm rounded-full gap-2 mt-4"
        @click="handleGenerateModelAnswer"
      >
        <Sparkles :size="14" aria-hidden="true" />
        Try again
      </button>
      <p class="text-[11px] text-base-content/50 mt-3">
        You can continue writing and submit without an AI example.
      </p>
    </div>

    <div v-else class="text-center py-8">
      <Lightbulb :size="24" class="mx-auto text-base-content/30 mb-3" aria-hidden="true" />
      <p class="text-sm text-base-content/60 mb-4">
        Generate an optional model answer for this task.
      </p>
      <button
        type="button"
        class="btn btn-primary btn-sm rounded-full gap-2"
        @click="handleGenerateModelAnswer"
      >
        <Sparkles :size="14" aria-hidden="true" />
        Generate ideal answer
      </button>
      <p class="text-[11px] text-base-content/50 mt-3">
        AI is optional. You can continue writing without this example.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, Lightbulb, Sparkles } from 'lucide-vue-next'
import type { WritingExercise, ModelAnswer } from '~/utils/types'
import { useModelAnswer } from '~/composables/useModelAnswer'

interface Props {
  topic: WritingExercise
}

const props = defineProps<Props>()

const {
  getModelAnswer,
  isGenerating,
  getModelAnswerError,
  generateModelAnswer,
  modelAnswerVersion,
} = useModelAnswer()

const modelAnswer = computed<ModelAnswer | null>(() => {
  void modelAnswerVersion.value
  return getModelAnswer(props.topic.id)
})

const isLoading = computed(() => {
  void modelAnswerVersion.value
  return isGenerating(props.topic.id)
})

const errorMessage = computed(() => {
  void modelAnswerVersion.value
  return getModelAnswerError(props.topic.id)
})

const highlights = computed(() => {
  const data = modelAnswer.value?.highlights
  if (!data) return []
  return [
    data.greeting ? { label: 'Greeting', value: data.greeting } : null,
    data.closing ? { label: 'Closing', value: data.closing } : null,
    ...(data.mainPoints || []).map((point, index) => ({
      label: `Point ${index + 1}`,
      value: point,
    })),
  ].filter((item): item is { label: string; value: string } => item !== null)
})

const keyPhrases = computed(() => modelAnswer.value?.highlights?.keyPhrases || [])

async function handleGenerateModelAnswer() {
  await generateModelAnswer(props.topic)
}
</script>
