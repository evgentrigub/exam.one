<template>
  <main class="mx-auto max-w-[1180px] space-y-5 p-6">
    <NuxtLink to="/progress" class="btn btn-ghost btn-sm">Back to progress</NuxtLink>
    <h1 class="font-display text-3xl">Past exams</h1>
    <p>Saved attempts across your exams. Historical attempts are read-only.</p>
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <section v-if="selected" class="card bg-base-100 border border-base-300 p-5 space-y-3">
      <SavedAttempt :attempt="selected" />
    </section>
    <button v-for="attempt in attempts" :key="attempt.id" class="card text-left w-full bg-base-100 border border-base-300 p-4" @click="open(attempt.id)">
      {{ attempt.packId }} · {{ attempt.skill }} · {{ new Date(attempt.submittedAt).toLocaleDateString() }}
    </button>
    <p v-if="!attempts.length">No saved attempts yet.</p>
  </main>
</template>
<script setup lang="ts">
import type { AttemptDto } from '@exam-one/contracts'
const attempts = ref<AttemptDto[]>([])
const selected = ref<AttemptDto | null>(null)
const error = ref('')
async function open(id: string) { try { selected.value = await apiFetch<AttemptDto>(`/attempts/${encodeURIComponent(id)}`) } catch (e) { error.value = String(e) } }
onMounted(async () => {
  try {
    const rows = await Promise.all(['READING', 'WRITING', 'LISTENING', 'SPEAKING'].map(skill => apiFetch<AttemptDto[]>('/attempts', { query: { skill, history: 'true' } })))
    attempts.value = rows.flat().sort((a,b) => b.submittedAt.localeCompare(a.submittedAt))
  } catch (e) { error.value = String(e) }
})
</script>
