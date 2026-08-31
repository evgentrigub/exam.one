import type { GenerationJobDto, GenerationJobStatus, Skill } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function nestStatusFromPayload(kind: Skill, payload: unknown): GenerationJobStatus {
  if (!isRecord(payload)) return 'IDLE'
  if (kind === 'MOCK') {
    const status = payload['status']
    if (status === 'running' || status === 'queued') return 'RUNNING'
    if (status === 'failed') return 'FAILED'
    if (status === 'done') return 'COMPLETED'
    return 'IDLE'
  }
  const jobs = Array.isArray(payload['jobs']) ? payload['jobs'] : []
  const partStatus = jobs
    .map(job => (isRecord(job) ? String(job['status'] ?? '') : ''))
    .filter(Boolean)
  if (payload['isGenerating'] === true || partStatus.some(s => s === 'running' || s === 'queued')) {
    return 'RUNNING'
  }
  if (partStatus.some(s => s === 'failed')) return 'FAILED'
  if (partStatus.length > 0 && partStatus.every(s => s === 'done')) return 'COMPLETED'
  return 'IDLE'
}

export async function listGenerationJobs(): Promise<GenerationJobDto[]> {
  return apiFetch<GenerationJobDto[]>('/generation-jobs')
}

export async function loadGenerationJob(kind: Skill): Promise<unknown | null> {
  const row = await apiFetch<GenerationJobDto | null>(`/generation-jobs/${kind}`)
  return row?.payload ?? null
}

export async function saveGenerationJob(
  kind: Skill,
  payload: unknown,
  status?: GenerationJobStatus
): Promise<void> {
  await apiFetch(`/generation-jobs/${kind}`, {
    method: 'PUT',
    body: { payload, status: status ?? nestStatusFromPayload(kind, payload) },
  })
}

export async function clearGenerationJob(kind: Skill): Promise<void> {
  await apiFetch(`/generation-jobs/${kind}`, { method: 'DELETE' })
}
