import type { ExerciseDto, Skill } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'

export function exercisePayloads<T extends { id?: string }>(rows: ExerciseDto[]): T[] {
  return rows.map(row => {
    const payload = (row.payload ?? {}) as T
    return { ...payload, id: payload.id ?? row.externalId }
  })
}

export async function fetchSkillExercises<T extends { id?: string }>(skill: Skill): Promise<T[]> {
  const rows = await apiFetch<ExerciseDto[]>(`/exercises?skill=${skill}`)
  return exercisePayloads<T>(rows)
}

export async function createSkillExercise<T extends { id: string }>(
  skill: Skill,
  payload: T
): Promise<T> {
  const row = await apiFetch<ExerciseDto>('/exercises', {
    method: 'POST',
    body: { skill, payload },
  })
  return exercisePayloads<T>([row])[0] ?? payload
}

export async function deleteSkillExercise(externalId: string): Promise<void> {
  await apiFetch(`/exercises/${encodeURIComponent(externalId)}`, { method: 'DELETE' })
}
