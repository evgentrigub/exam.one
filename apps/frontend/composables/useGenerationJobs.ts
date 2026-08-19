import type { GenerationJobDto, Skill } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'

export async function loadGenerationJob(kind: Skill): Promise<unknown | null> {
  const row = await apiFetch<GenerationJobDto | null>(`/generation-jobs/${kind}`)
  return row?.payload ?? null
}

export async function saveGenerationJob(kind: Skill, payload: unknown): Promise<void> {
  await apiFetch(`/generation-jobs/${kind}`, {
    method: 'PUT',
    body: { payload, status: 'IDLE' },
  })
}

export async function clearGenerationJob(kind: Skill): Promise<void> {
  await apiFetch(`/generation-jobs/${kind}`, { method: 'DELETE' })
}
