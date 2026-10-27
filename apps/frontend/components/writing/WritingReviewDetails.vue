<template>
  <div class="space-y-5">
    <div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.teil') }}</div>
        <div class="mt-1 font-semibold">{{ teil }}</div>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.words') }}</div>
        <div class="mt-1 font-semibold">{{ formattedWordCount }}</div>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.messPoints') }}</div>
        <div class="mt-1 font-semibold">{{ review.totalPoints }}/{{ rawMax }}</div>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">
          {{ $t('writing.reviewDetails.resultPoints') }}
        </div>
        <div class="mt-1 font-semibold">{{ resultPoints }}/{{ resultMax }}</div>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.rule') }}</div>
        <div class="mt-1 font-semibold uppercase">{{ review.ruleApplied }}</div>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">{{ $t('writing.reviewDetails.register') }}</div>
        <div class="mt-1 font-semibold">{{ registerLabel }}</div>
      </div>
      <div class="rounded-box border border-base-300 bg-base-200/40 p-3">
        <div class="text-xs text-base-content/55">
          {{ $t('writing.reviewDetails.contentPoints') }}
        </div>
        <div class="mt-1 font-semibold">{{ contentPointsLabel }}</div>
      </div>
    </div>

    <section>
      <h4 class="text-sm font-semibold">{{ $t('writing.reviewDetails.criteria') }}</h4>
      <div class="mt-2 hidden overflow-x-auto sm:block">
        <table class="table table-zebra table-sm w-full">
          <thead>
            <tr>
              <th>{{ $t('writing.reviewDetails.criterion') }}</th>
              <th v-if="hasGrades">{{ $t('writing.reviewDetails.grade') }}</th>
              <th>{{ $t('writing.reviewDetails.points') }}</th>
              <th>{{ $t('writing.reviewDetails.comment') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="criterion in criteria" :key="criterion.id">
              <td class="font-medium">{{ criterion.label }}</td>
              <td v-if="hasGrades">{{ criterion.grade }}</td>
              <td class="font-mono">{{ criterion.points }}</td>
              <td class="min-w-64">{{ criterion.comment }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-2 space-y-2 sm:hidden">
        <article
          v-for="criterion in criteria"
          :key="criterion.id"
          class="rounded-box border border-base-300 p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="font-medium">{{ criterion.label }}</div>
              <div class="mt-1 text-xs text-base-content/55">{{ criterion.comment }}</div>
            </div>
            <span class="badge badge-primary badge-outline shrink-0"
              >{{ criterion.points }}{{ criterion.grade ? ` · ${criterion.grade}` : '' }}</span
            >
          </div>
        </article>
      </div>
    </section>

    <div
      v-if="review.priorityFixes?.length"
      class="rounded-box border border-warning/30 bg-warning/5 p-4"
    >
      <h4 class="text-sm font-semibold text-warning">
        {{ $t('writing.reviewDetails.priorityFixes') }}
      </h4>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li v-for="fix in review.priorityFixes" :key="fix">{{ fix }}</li>
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
import type { DeepReadonly } from 'vue'
import type { CriterionReview } from '@exam-one/exam-packs'

// The card only reads; accepting the deep-readonly form lets the mock state pass
// its stored rubric straight through without a cast.
const props = defineProps<{ review: DeepReadonly<CriterionReview>; teil: number }>()
const { t } = useI18n()

/**
 * Criterion labels are resolved from i18n by criterion id, never from the payload.
 * The rubric echoes an English `label` back, so rendering it would strip German for
 * German users. An unknown id falls back to whatever the pack named it.
 */
const CRITERION_LABELS: Record<string, string> = {
  aufgabenerfuellung: 'writing.reviewDetails.taskFulfillment',
  sprache: 'writing.reviewDetails.language',
  content1: 'writing.reviewDetails.contentPoint1',
  content2: 'writing.reviewDetails.contentPoint2',
  content3: 'writing.reviewDetails.contentPoint3',
  communication: 'writing.reviewDetails.communication',
  content: 'writing.reviewDetails.content',
  organisation: 'writing.reviewDetails.organisation',
  language: 'writing.reviewDetails.language',
  taskCompletion: 'writing.reviewDetails.taskFulfillment',
  range: 'writing.reviewDetails.range',
  accuracy: 'writing.reviewDetails.accuracy',
  communicativeDesign: 'writing.reviewDetails.communicativeDesign',
  communicativeAchievement: 'writing.reviewDetails.communicativeAchievement',
  genreAdequacy: 'writing.reviewDetails.genreAdequacy',
  coherence: 'writing.reviewDetails.coherence',
  vocabulary: 'writing.reviewDetails.vocabulary',
  structures: 'writing.reviewDetails.structures',
}

const { pack } = useActivePack()
const writingRules = computed(
  () =>
    pack.value.structure
      .find(module => module.id === 'writing')
      ?.parts.find(part => part.n === (Number(props.teil) || 1))?.runtime
)
const rawMax = computed(() => props.review.maxPoints || (writingRules.value?.maxPoints ?? 10))
const multiplier = computed(() => writingRules.value?.multiplier ?? 1.25)
const resultPoints = computed(() =>
  Number((props.review.totalPoints * multiplier.value).toFixed(2))
)
const resultMax = computed(() => String(rawMax.value * multiplier.value))

const formattedWordCount = computed(() => {
  const words = props.review.wordCount
  if (!words) return '—'
  const range = [words.min, words.max].every(value => typeof value === 'number')
    ? ` / ${words.min}-${words.max}`
    : ''
  return `${words.actual}${range}`
})

const check = (id: string) => computed(() => props.review.checks?.find(item => item.id === id))
const register = check('register')
const contentPoints = check('contentPoints')

const registerLabel = computed(() =>
  register.value?.detected ? `${register.value.detected} (${register.value.ok ? '✓' : '✗'})` : '—'
)
const contentPointsLabel = computed(() =>
  contentPoints.value ? `${contentPoints.value.covered} / ${contentPoints.value.required}` : '—'
)

/** A2 grades every criterion A–E; a rubric without grades (A1) drops the empty column. */
const hasGrades = computed(() => props.review.criteria.some(criterion => criterion.grade))

const criteria = computed(() =>
  props.review.criteria.map(criterion => ({
    ...criterion,
    label: CRITERION_LABELS[criterion.id] ? t(CRITERION_LABELS[criterion.id]!) : criterion.label,
  }))
)
</script>
