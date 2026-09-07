<template>
  <article class="space-y-5">
    <header>
      <h2 class="font-display text-2xl">{{ packTitle }} · {{ attempt.skill.toLowerCase() }}</h2>
      <p>{{ new Date(attempt.submittedAt).toLocaleString() }}</p>
      <p class="text-lg font-semibold">
        {{
          attempt.result?.score == null
            ? 'Ungraded'
            : `${attempt.result.score} / ${attempt.result.maxScore}`
        }}
      </p>
    </header>
    <template v-if="snapshot?.version === 1 && !snapshot.compatibility">
      <h3 class="text-xl font-semibold">{{ snapshot.view.title }}</h3>
      <p class="whitespace-pre-wrap">{{ snapshot.view.text }}</p>
      <audio v-if="snapshot.view.audio" :src="snapshot.view.audio" controls />
      <section
        v-for="question in snapshot.view.questions ?? []"
        :key="question.id"
        class="space-y-2 border-t border-base-300 pt-4"
      >
        <h4 class="font-semibold">{{ question.text }}</h4>
        <audio v-if="question.audio" :src="question.audio" controls />
        <p>Your answer: {{ answerLabel(question.id, question.options) }}</p>
        <p>Correct answer: {{ question.options[question.correctAnswer] }}</p>
        <p>{{ question.explanation }}</p>
        <details v-if="question.transcript">
          <summary>Transcript</summary>
          <p class="whitespace-pre-wrap">{{ question.transcript }}</p>
        </details>
      </section>
      <section v-for="field in snapshot.view.fields ?? []" :key="field.id" class="space-y-2">
        <h4 class="font-semibold">{{ field.label }}</h4>
        <p>{{ field.prompt }}</p>
        <p class="whitespace-pre-wrap">{{ answers[field.id] ?? 'Not answered' }}</p>
      </section>
      <section v-for="segment in snapshot.view.segments ?? []" :key="segment.id" class="space-y-2">
        <h4 class="font-semibold">{{ segment.label }}</h4>
        <p class="whitespace-pre-wrap">{{ segment.prompt }}</p>
        <p class="whitespace-pre-wrap">{{ answers[segment.id] ?? 'Not answered' }}</p>
      </section>
    </template>
    <template v-else>
      <section v-if="legacyPayload">
        <h3 class="font-semibold">Exercise</h3>
        <SavedFeedback :value="legacyPayload" />
      </section>
      <section>
        <h3 class="font-semibold">Your answers</h3>
        <SavedFeedback :value="attempt.answers" />
      </section>
    </template>
    <section>
      <h3 class="text-lg font-semibold mb-3">Saved feedback</h3>
      <SavedFeedback :value="attempt.result?.review" />
    </section>
  </article>
</template>
<script setup lang="ts">
import type { AttemptDto } from '@exam-one/contracts'
import { getPack, type RuntimeSnapshot } from '@exam-one/exam-packs'
const props = defineProps<{ attempt: AttemptDto }>()
const packTitle = computed(
  () =>
    getPack(props.attempt.packId)?.title ??
    (props.attempt.packId === 'legacy-history' ? 'Earlier exam' : props.attempt.packId)
)
const snapshot = computed(() => props.attempt.snapshot as RuntimeSnapshot | undefined)
const legacyPayload = computed(
  () => (props.attempt.snapshot as { payload?: unknown } | undefined)?.payload
)
const answers = computed(() => props.attempt.answers as Record<string, unknown>)
function answerLabel(id: string, options: string[]) {
  const value = answers.value[id]
  return typeof value === 'number' ? (options[value] ?? 'Not answered') : 'Not answered'
}
</script>
