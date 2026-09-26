<template>
  <main class="mx-auto max-w-[1180px] space-y-5 p-6">
    <NuxtLink to="/progress" class="btn btn-ghost btn-sm">{{ $t('pastExams.back') }}</NuxtLink>
    <h1 class="font-display text-3xl">{{ $t('pastExams.title') }}</h1>
    <p>{{ $t('pastExams.intro') }}</p>
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <section v-if="selected" class="card bg-base-100 border border-base-300 p-5 space-y-3">
      <SavedAttempt :attempt="selected" />
    </section>
    <button
      v-for="attempt in attempts"
      :key="attempt.id"
      class="card text-left w-full bg-base-100 border border-base-300 p-4"
      @click="open(attempt.id)"
    >
      {{ attempt.packId }} · {{ attempt.skill }} ·
      {{ new Date(attempt.submittedAt).toLocaleDateString() }}
    </button>
    <p v-if="!attempts.length">{{ $t('pastExams.empty') }}</p>
  </main>
</template>
<script setup lang="ts">
import type { AttemptDto } from '@exam-one/contracts'

/**
 * Rows the AI screens persist to cache their own output - a model answer, a review request.
 * They carry no learner response, so they are not attempts and must not be listed. They are
 * filtered here rather than server-side because `useModelAnswer` and `useWritingReview`
 * hydrate from these same rows.
 */
const ARTIFACT_KINDS = ['model-answer', 'writing-review', 'artifact']

function isAttempt(attempt: AttemptDto): boolean {
  const answers = attempt.answers
  if (typeof answers !== 'object' || answers === null) return true
  return !ARTIFACT_KINDS.includes(String((answers as Record<string, unknown>)['kind']))
}

const attempts = ref<AttemptDto[]>([])
const selected = ref<AttemptDto | null>(null)
const error = ref('')

async function open(id: string) {
  try {
    selected.value = await apiFetch<AttemptDto>(`/attempts/${encodeURIComponent(id)}`)
  } catch (e) {
    error.value = String(e)
  }
}

onMounted(async () => {
  try {
    const rows = await Promise.all(
      ['READING', 'WRITING', 'LISTENING', 'SPEAKING'].map(skill =>
        apiFetch<AttemptDto[]>('/attempts', { query: { skill, history: 'true' } })
      )
    )
    attempts.value = rows
      .flat()
      .filter(isAttempt)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  } catch (e) {
    error.value = String(e)
  }
})
</script>
