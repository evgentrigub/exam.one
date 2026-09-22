<template>
  <div class="space-y-5">
    <div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.teil') }}</div>
        <div class="mt-1 font-semibold">{{ review.teil }}</div>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.words') }}</div>
        <div class="mt-1 font-semibold">{{ formattedWordCount }}</div>
      </div>
      <div v-if="isA2" class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.messPoints') }}</div>
        <div class="mt-1 font-semibold">{{ a2Review?.teil_points_mess }}/{{ rawMax }}</div>
      </div>
      <div v-if="isA2" class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">
          {{ $t('writing.reviewDetails.resultPoints') }}
        </div>
        <div class="mt-1 font-semibold">{{ a2Review?.teil_points_result }}/{{ resultMax }}</div>
      </div>
      <div v-if="!isA2" class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.teilPoints') }}</div>
        <div class="mt-1 font-semibold">{{ c1Review?.teil_points }}</div>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.rule') }}</div>
        <div class="mt-1 font-semibold uppercase">{{ review.teil_rule_applied }}</div>
      </div>
      <div v-if="isA2" class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.register') }}</div>
        <div class="mt-1 font-semibold">{{ registerLabel }}</div>
      </div>
      <div v-if="isA2" class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">
          {{ $t('writing.reviewDetails.contentPoints') }}
        </div>
        <div class="mt-1 font-semibold">{{ contentPointsLabel }}</div>
      </div>
      <div v-if="!isA2" class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">
          {{ $t('writing.reviewDetails.passedModule') }}
        </div>
        <div class="mt-1 font-semibold">
          {{
            c1Review?.passed_module
              ? $t('writing.reviewDetails.yes')
              : $t('writing.reviewDetails.no')
          }}
        </div>
      </div>
    </div>

    <section>
      <h4 class="text-sm font-semibold">{{ $t('writing.reviewDetails.criteria') }}</h4>
      <div class="mt-2 hidden overflow-x-auto sm:block">
        <table class="table table-zebra table-sm w-full">
          <thead>
            <tr>
              <th>{{ $t('writing.reviewDetails.criterion') }}</th>
              <th>{{ $t('writing.reviewDetails.grade') }}</th>
              <th>{{ $t('writing.reviewDetails.points') }}</th>
              <th>{{ $t('writing.reviewDetails.comment') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="criterion in criteria" :key="criterion.label">
              <td class="font-medium">{{ criterion.label }}</td>
              <td>{{ criterion.grade }}</td>
              <td class="font-mono">{{ criterion.points }}</td>
              <td class="min-w-64">{{ criterion.comment }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-2 space-y-2 sm:hidden">
        <article
          v-for="criterion in criteria"
          :key="criterion.label"
          class="rounded-box border border-base-300 p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="font-medium">{{ criterion.label }}</div>
              <div class="mt-1 text-xs text-base-content/55">{{ criterion.comment }}</div>
            </div>
            <span class="badge badge-primary badge-outline shrink-0"
              >{{ criterion.points }} · {{ criterion.grade }}</span
            >
          </div>
        </article>
      </div>
    </section>

    <div
      v-if="review.priority_fixes?.length"
      class="rounded-box border border-warning/30 bg-warning/5 p-4"
    >
      <h4 class="text-sm font-semibold text-warning">
        {{ $t('writing.reviewDetails.priorityFixes') }}
      </h4>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li v-for="fix in review.priority_fixes" :key="fix">{{ fix }}</li>
      </ul>
    </div>

    <section v-if="review.examples?.length">
      <h4 class="text-sm font-semibold">{{ $t('writing.reviewDetails.examples') }}</h4>
      <div class="mt-2 grid gap-2">
        <article
          v-for="example in review.examples"
          :key="`${example.error}-${example.correction}`"
          class="rounded-box border border-base-300 p-3 text-sm"
        >
          <div class="grid gap-3 sm:grid-cols-3">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-error">
                {{ $t('writing.reviewDetails.error') }}
              </div>
              <div class="mt-1">{{ example.error }}</div>
            </div>
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-success">
                {{ $t('writing.reviewDetails.correction') }}
              </div>
              <div class="mt-1">{{ example.correction }}</div>
            </div>
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-base-content/45">
                {{ $t('writing.reviewDetails.rule') }}
              </div>
              <div class="mt-1">{{ example.rule }}</div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="rounded-box border border-base-300 bg-base-200/40 p-4">
      <h4 class="text-sm font-semibold">{{ $t('writing.reviewDetails.report') }}</h4>
      <p class="mt-2 whitespace-pre-wrap text-sm leading-6">{{ review.report }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import type {
  AiReviewCriteriaItem,
  AiReviewData,
  AiReviewDataA2,
  AiReviewDataC1,
} from '~/utils/types'
import { isA2Review } from '~/utils/types'

const props = defineProps<{ review: AiReviewData }>()
const { t } = useI18n()

const { pack } = useActivePack()
const writingRules = computed(() => {
  const teil = Number(props.review.teil) || 1
  return pack.value.structure
    .find(module => module.id === 'writing')
    ?.parts.find(part => part.n === teil)?.runtime
})
const rawMax = computed(() => writingRules.value?.maxPoints ?? 10)
const resultMax = computed(() => {
  const value = rawMax.value * (writingRules.value?.multiplier ?? 1.25)
  return Number.isInteger(value) ? String(value) : String(value)
})
const isA2 = computed(() => isA2Review(props.review))
const a2Review = computed<AiReviewDataA2 | null>(() =>
  isA2Review(props.review) ? props.review : null
)
const c1Review = computed<AiReviewDataC1 | null>(() =>
  isA2Review(props.review) ? null : props.review
)
const formattedWordCount = computed(() =>
  isA2.value
    ? `${props.review.word_count} / ${(props.review as AiReviewDataA2).required_word_count.min}-${(props.review as AiReviewDataA2).required_word_count.max}`
    : `${props.review.word_count} / ${(props.review as AiReviewDataC1).required_word_count}`
)
const registerLabel = computed(() => {
  const check = a2Review.value?.register_check
  return check ? `${check.detected} (${check.ok ? '✓' : '✗'})` : '—'
})
const contentPointsLabel = computed(() => {
  const points = a2Review.value?.content_points_covered
  return points ? `${points.covered} / ${points.required}` : '—'
})

interface CriterionRow extends AiReviewCriteriaItem {
  label: string
}

const criteria = computed<CriterionRow[]>(() => {
  const rows: CriterionRow[] = [
    {
      label: t('writing.reviewDetails.taskFulfillment'),
      ...props.review.criteria.aufgabenerfuellung,
    },
  ]
  if (a2Review.value) {
    rows.push({ label: t('writing.reviewDetails.language'), ...a2Review.value.criteria.sprache })
  } else if (c1Review.value) {
    rows.push(
      { label: t('writing.reviewDetails.coherence'), ...c1Review.value.criteria.kohaerenz },
      { label: t('writing.reviewDetails.vocabulary'), ...c1Review.value.criteria.wortschatz },
      { label: t('writing.reviewDetails.structures'), ...c1Review.value.criteria.strukturen }
    )
  }
  return rows
})
</script>
