<template>
  <div class="space-y-5">
    <div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.teil') }}</div>
        <div class="mt-1 font-semibold">{{ teil }}</div>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.formFill.correctEntries') }}</div>
        <div class="mt-1 font-semibold">{{ review.totalPoints }}/{{ review.maxPoints }}</div>
      </div>
    </div>

    <section>
      <h4 class="text-sm font-semibold">{{ $t('writing.formFill.entries') }}</h4>
      <ol class="mt-2 divide-y divide-base-300/70 rounded-box border border-base-300">
        <li v-for="(row, index) in rows" :key="row.id" class="flex items-start gap-3 p-3">
          <span
            class="mt-0.5 w-5 h-5 rounded-full grid place-items-center shrink-0"
            :class="row.correct ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
            :aria-label="row.correct ? $t('writing.formFill.correct') : $t('writing.formFill.wrong')"
          >
            <Check v-if="row.correct" :size="12" aria-hidden="true" />
            <X v-else :size="12" aria-hidden="true" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="text-xs text-base-content/55">
              <span class="font-mono">{{ index + 1 }}</span> · {{ row.label }}
            </div>
            <div class="mt-0.5 text-[15px] font-medium">
              {{ row.answer || $t('pastExams.notAnswered') }}
            </div>
            <div v-if="row.comment" class="mt-1 text-sm text-base-content/70">{{ row.comment }}</div>
          </div>
          <span class="badge badge-outline shrink-0 font-mono">{{ row.points }}/{{ row.maxPoints }}</span>
        </li>
      </ol>
    </section>

    <section v-if="review.summary" class="rounded-box border border-base-300 bg-base-200/40 p-4">
      <p class="text-sm leading-6">{{ review.summary }}</p>
    </section>

    <div class="grid gap-3 sm:grid-cols-2">
      <section v-if="review.strengths?.length" class="rounded-box border border-success/30 bg-success/5 p-4">
        <h4 class="text-sm font-semibold text-success">{{ $t('writing.formFill.strengths') }}</h4>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li v-for="item in review.strengths" :key="item">{{ item }}</li>
        </ul>
      </section>
      <section
        v-if="review.improvements?.length"
        class="rounded-box border border-warning/30 bg-warning/5 p-4"
      >
        <h4 class="text-sm font-semibold text-warning">{{ $t('writing.formFill.improvements') }}</h4>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li v-for="item in review.improvements" :key="item">{{ item }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeepReadonly } from 'vue'
import { Check, X } from 'lucide-vue-next'
import type { CriterionReview } from '@exam-one/exam-packs'

/**
 * The rubric of a form-fill task: one criterion per entry, 1 point or 0. Each entry is shown
 * with the form's own label, never the rubric's, and with the learner's answer beside it.
 */
const props = defineProps<{
  review: DeepReadonly<CriterionReview>
  entries: readonly { id: string; label: string; answer: string }[]
  teil: number
}>()

const rows = computed(() =>
  props.entries.map(entry => {
    const criterion = props.review.criteria.find(item => item.id === entry.id)
    const points = criterion?.points ?? 0
    const maxPoints = criterion?.maxPoints ?? 1
    return {
      ...entry,
      points,
      maxPoints,
      correct: points >= maxPoints,
      comment: criterion?.comment ?? '',
    }
  })
)
</script>
