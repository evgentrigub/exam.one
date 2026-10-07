<template>
  <div class="space-y-5">
    <div
      class="flex flex-wrap items-center gap-3 rounded-box border border-warning/30 bg-warning/5 p-4"
    >
      <div>
        <div class="text-xs text-base-content/55">{{ $t('speakingReview.totalPoints') }}</div>
        <div class="mt-1 font-mono text-2xl font-bold">
          {{ review.totalPoints }}/{{ review.maxPoints }}
        </div>
      </div>
      <p class="min-w-0 flex-1 text-sm leading-6 sm:ml-3">{{ review.summary }}</p>
    </div>

    <section>
      <h4 class="text-sm font-semibold">{{ $t('speakingReview.criteria') }}</h4>
      <div class="mt-2 divide-y divide-base-200 overflow-hidden rounded-box border border-base-300">
        <div
          v-for="criterion in criteria"
          :key="criterion.id"
          class="flex items-start justify-between gap-4 p-4"
        >
          <div>
            <p class="text-sm font-medium">{{ criterion.label }}</p>
            <p class="mt-1 text-xs leading-5 text-base-content/55">{{ criterion.comment }}</p>
          </div>
          <span class="badge badge-warning shrink-0"
            >{{ criterion.points }}/{{ criterion.maxPoints }}</span
          >
        </div>
      </div>
    </section>

    <div class="grid gap-4 sm:grid-cols-2">
      <section class="rounded-box border border-success/30 bg-success/5 p-4">
        <h4 class="text-sm font-semibold text-success">{{ $t('speakingReview.strengths') }}</h4>
        <ul v-if="review.strengths.length" class="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li v-for="item in review.strengths" :key="item">{{ item }}</li>
        </ul>
        <p v-else class="mt-2 text-sm text-base-content/55">
          {{ $t('speakingReview.noStrengths') }}
        </p>
      </section>
      <section class="rounded-box border border-warning/30 bg-warning/5 p-4">
        <h4 class="text-sm font-semibold text-warning">{{ $t('speakingReview.improvements') }}</h4>
        <ul v-if="review.improvements.length" class="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li v-for="item in review.improvements" :key="item">{{ item }}</li>
        </ul>
        <p v-else class="mt-2 text-sm text-base-content/55">
          {{ $t('speakingReview.noImprovements') }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeepReadonly } from 'vue'
import type { CriterionReview } from '@exam-one/exam-packs'

// The card only reads; the deep-readonly form lets the mock state pass its stored rubric
// straight through, as the writing card already does.
const props = defineProps<{ review: DeepReadonly<CriterionReview> }>()
const { t } = useI18n()

/**
 * Criterion labels come from i18n by criterion id, never from the payload.
 * The rubric echoes English labels back, so rendering them would strip German for German
 * users - this card has in fact never been localised. An unknown id keeps the pack's label.
 */
const CRITERION_LABELS: Record<string, string> = {
  answers: 'speakingReview.answers',
  questions: 'speakingReview.questions',
  taskCompletion: 'speakingReview.taskCompletion',
  language: 'speakingReview.language',
  ...Object.fromEntries(
    [
      'introduction',
      'spelling',
      'number',
      'ask1',
      'answer1',
      'ask2',
      'answer2',
      'request1',
      'response1',
      'request2',
      'response2',
      'grammarVocabulary',
      'discourseManagement',
      'interactiveCommunication',
      'globalAchievement',
      'vocabulary',
      'grammar',
      'coherence',
      'accuracy',
      'range',
      'structures',
    ].map(id => [id, `speakingReview.${id}`])
  ),
}

const criteria = computed(() =>
  props.review.criteria.map(criterion => ({
    ...criterion,
    label: CRITERION_LABELS[criterion.id] ? t(CRITERION_LABELS[criterion.id]!) : criterion.label,
  }))
)
</script>
