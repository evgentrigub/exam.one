<template>
  <article class="space-y-5">
    <header>
      <h2 class="font-display text-2xl">{{ packTitle }} · {{ attempt.skill.toLowerCase() }}</h2>
      <p>{{ new Date(attempt.submittedAt).toLocaleString() }}</p>
      <p class="text-lg font-semibold">
        {{
          attempt.result?.score == null
            ? $t('pastExams.ungraded')
            : `${attempt.result.score} / ${attempt.result.maxScore}`
        }}
      </p>
    </header>
    <template v-if="view">
      <h3 class="text-xl font-semibold">{{ view.title }}</h3>
      <p class="whitespace-pre-wrap">{{ view.text }}</p>
      <audio v-if="view.audio" :src="view.audio" controls />
      <section
        v-for="question in view.questions ?? []"
        :key="question.id"
        class="space-y-2 border-t border-base-300 pt-4"
      >
        <h4 class="font-semibold">{{ question.text }}</h4>
        <audio v-if="question.audio" :src="question.audio" controls />
        <p>{{ $t('pastExams.yourAnswer') }}: {{ answerLabel(question.id, question.options) }}</p>
        <p>
          {{ $t('pastExams.correctAnswer') }}: {{ question.options[question.correctAnswer] }}
        </p>
        <p>{{ question.explanation }}</p>
        <details v-if="question.transcript">
          <summary>{{ $t('pastExams.transcript') }}</summary>
          <p class="whitespace-pre-wrap">{{ question.transcript }}</p>
        </details>
      </section>
      <section v-for="field in view.fields ?? []" :key="field.id" class="space-y-2">
        <h4 class="font-semibold">{{ field.label }}</h4>
        <p>{{ field.prompt }}</p>
        <p class="whitespace-pre-wrap">{{ answers[field.id] ?? $t('pastExams.notAnswered') }}</p>
      </section>
      <section v-for="segment in view.segments ?? []" :key="segment.id" class="space-y-2">
        <h4 class="font-semibold">{{ segment.label }}</h4>
        <p class="whitespace-pre-wrap">{{ segment.prompt }}</p>
        <p class="whitespace-pre-wrap">{{ answers[segment.id] ?? $t('pastExams.notAnswered') }}</p>
      </section>
    </template>
    <template v-else>
      <section v-if="legacyPayload">
        <h3 class="font-semibold">{{ $t('pastExams.exercise') }}</h3>
        <SavedFeedback :value="legacyPayload" />
      </section>
      <section>
        <h3 class="font-semibold">{{ $t('pastExams.yourAnswers') }}</h3>
        <SavedFeedback :value="attempt.answers" />
      </section>
    </template>
    <section v-if="attempt.result?.review">
      <h3 class="text-lg font-semibold mb-3">{{ $t('pastExams.savedFeedback') }}</h3>
      <WritingReviewDetails
        v-if="review && attempt.skill === 'WRITING'"
        :review="review"
        :teil="snapshot?.part ?? 1"
      />
      <SpeakingReviewDetails v-else-if="review" :review="review" />
      <SavedFeedback v-else :value="attempt.result.review" />
    </section>
  </article>
</template>
<script setup lang="ts">
import type { AttemptDto } from '@exam-one/contracts'
import {
  getPack,
  resolveAnswers,
  type CriterionReview,
  type RuntimeSnapshot,
} from '@exam-one/exam-packs'
import SavedFeedback from '~/components/packs/SavedFeedback.vue'
import WritingReviewDetails from '~/components/writing/WritingReviewDetails.vue'
import SpeakingReviewDetails from '~/components/speaking/SpeakingReviewDetails.vue'

const props = defineProps<{ attempt: AttemptDto }>()
const { t } = useI18n()

const packTitle = computed(
  () =>
    getPack(props.attempt.packId)?.title ??
    (props.attempt.packId === 'legacy-history' ? 'Earlier exam' : props.attempt.packId)
)
const snapshot = computed(() => props.attempt.snapshot as RuntimeSnapshot | undefined)

/**
 * The structured view, when the attempt has one. `version: 0` snapshots have no view - the
 * exercise lookup failed when the attempt was written - so they keep the raw fallback.
 */
const view = computed(() => (snapshot.value?.version === 1 ? snapshot.value.view : undefined))
const legacyPayload = computed(
  () => (props.attempt.snapshot as { payload?: unknown } | undefined)?.payload
)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Answers are stored as a submission record, not a flat map, so they are resolved against the
 * view before rendering - the same helper the backend scores with.
 */
const answers = computed(() => {
  const stored = isRecord(props.attempt.answers) ? props.attempt.answers : {}
  return view.value ? resolveAnswers(view.value, stored) : stored
})

function answerLabel(id: string, options: string[]) {
  const value = answers.value[id]
  return typeof value === 'number' ? (options[value] ?? t('pastExams.notAnswered')) : t('pastExams.notAnswered')
}

function isCriterionReview(value: unknown): value is CriterionReview {
  return (
    isRecord(value) &&
    Array.isArray(value['criteria']) &&
    typeof value['totalPoints'] === 'number' &&
    typeof value['maxPoints'] === 'number'
  )
}

/**
 * Saved rubrics are stored under three different wrappers depending on which screen wrote
 * them. Anything unrecognised - a model answer, a pending request - falls back to the raw
 * renderer rather than rendering an empty card.
 */
const review = computed<CriterionReview | undefined>(() => {
  const stored = props.attempt.result?.review
  if (!isRecord(stored)) return undefined
  const writing = isRecord(stored['writingReview']) ? stored['writingReview']['responseData'] : undefined
  for (const candidate of [stored, stored['review'], writing]) {
    if (isCriterionReview(candidate)) return candidate
  }
  return undefined
})
</script>
