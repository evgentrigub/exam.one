<template>
  <main class="mx-auto max-w-[1240px] space-y-5 p-6">
    <h1 class="font-display text-3xl">{{ pack.title }}</h1>
    <p v-if="error" role="alert" class="alert alert-error">{{ error }}</p>
    <section
      v-for="module in pack.structure"
      :key="module.id"
      class="card border border-base-300 bg-base-100 p-5 space-y-4"
    >
      <h2 class="text-xl font-semibold">{{ module.label }}</h2>
      <button
        v-if="pending[module.id]"
        class="btn btn-outline btn-sm"
        :disabled="busy"
        @click="generate(module.id, pending[module.id]!.part, pending[module.id]!.payloads)"
      >
        Resume interrupted generation
      </button>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="part in module.parts.filter(p => p.available !== false)"
          :key="part.n"
          class="btn btn-primary btn-sm"
          :disabled="busy"
          @click="generate(module.id, part.n)"
        >
          {{ busy ? 'Generating…' : `Generate · ${part.title}` }}
        </button>
      </div>
      <NuxtLink
        v-for="exercise in catalogs[module.id] ?? []"
        :key="exercise.externalId"
        :to="`/practice/${module.id}/${encodeURIComponent(exercise.externalId)}`"
        class="card border border-base-300 p-4 hover:bg-base-200"
      >
        {{ title(exercise) }} <span class="text-sm opacity-60">{{ pack.cefr }}</span>
      </NuxtLink>
      <p v-if="!catalogs[module.id]?.length" class="text-base-content/60">
        Generate an exercise to start practising.
      </p>
    </section>
    <p v-if="!pack.createMockSet" class="text-base-content/60">
      Mock exams are not available for this exam pack.
    </p>
  </main>
</template>
<script setup lang="ts">
import type { ExerciseDto, GenerationJobDto } from '@exam-one/contracts'
import { getLivePack, type SkillId } from '@exam-one/exam-packs'
const props = defineProps<{ packId: string }>()
const pack = getLivePack(props.packId)
const requestPackId = props.packId
const { apiFetch, aiFetch } = usePackRequest(requestPackId)
const catalogs = ref<Partial<Record<SkillId, ExerciseDto[]>>>({})
const busy = ref(false)
const error = ref('')
const pending = ref<Partial<Record<SkillId, { part: number; payloads?: unknown[] }>>>({})
let disposed = false
onBeforeUnmount(() => {
  disposed = true
})
function title(row: ExerciseDto) {
  return String((row.payload as Record<string, unknown>)['title'] ?? row.externalId)
}
async function load() {
  const jobs = await apiFetch<GenerationJobDto[]>('/generation-jobs', { packId: requestPackId })
  if (disposed) return
  pending.value = {}
  for (const job of jobs) {
    const saved = job.payload as { part?: number; payloads?: unknown[] } | undefined
    const skill = job.kind.toLowerCase() as SkillId
    if (
      (job.status === 'RUNNING' || job.status === 'FAILED') &&
      saved?.part &&
      pack.structure.find(module => module.id === skill)?.parts.some(part => part.n === saved.part)
    ) {
      pending.value[skill] = {
        part: saved.part,
        ...(saved.payloads ? { payloads: saved.payloads } : {}),
      }
    }
  }
  for (const module of pack.structure) {
    const rows = await apiFetch<ExerciseDto[]>('/exercises', {
      packId: requestPackId,
      query: { skill: module.id.toUpperCase() },
    })
    if (!disposed) catalogs.value[module.id] = rows
  }
}
async function generate(skill: SkillId, part: number, restored?: unknown[]) {
  busy.value = true
  error.value = ''
  let payloads = restored
  try {
    await apiFetch<GenerationJobDto>(`/generation-jobs/${skill.toUpperCase()}`, {
      packId: requestPackId,
      method: 'PUT',
      body: { status: 'RUNNING', payload: { part, payloads } },
    })
    const endpoint = skill === 'writing' ? 'generate-topics' : `generate-${skill}`
    const body =
      skill === 'writing'
        ? { difficulty: pack.cefr, part, prompt: 'pack default' }
        : { difficulty: pack.cefr, prompts: [{ part, prompt: 'pack default' }] }
    if (!payloads) {
      const response = await aiFetch<unknown[]>(`/llm/${endpoint}`, {
        packId: requestPackId,
        method: 'POST',
        body,
      })
      if (response.error || !response.data) throw new Error(response.error ?? 'Generation failed')
      payloads = response.data
      await apiFetch(`/generation-jobs/${skill.toUpperCase()}`, {
        packId: requestPackId,
        method: 'PUT',
        body: { status: 'RUNNING', payload: { part, payloads } },
      })
    }
    for (const payload of payloads)
      await apiFetch('/exercises', {
        packId: requestPackId,
        method: 'POST',
        body: { skill: skill.toUpperCase(), payload },
      })
    await apiFetch(`/generation-jobs/${skill.toUpperCase()}`, {
      packId: requestPackId,
      method: 'PUT',
      body: { status: 'COMPLETED', payload: { part } },
    })
    if (!disposed) await load()
  } catch (e) {
    await apiFetch(`/generation-jobs/${skill.toUpperCase()}`, {
      packId: requestPackId,
      method: 'PUT',
      body: { status: 'FAILED', payload: { part, payloads, error: String(e) } },
    }).catch(() => {})
    if (!disposed) pending.value[skill] = { part, ...(payloads ? { payloads } : {}) }
    if (!disposed) error.value = e instanceof Error ? e.message : 'Generation failed'
  } finally {
    if (!disposed) busy.value = false
  }
}
onMounted(() => {
  void load().catch(e => {
    error.value = String(e)
  })
})
</script>
