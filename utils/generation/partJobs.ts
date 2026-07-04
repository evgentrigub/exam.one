import type { Difficulty } from '~/utils/types'

export type PartJobStatus = 'queued' | 'running' | 'done' | 'failed'

export interface PartGenerationJob {
  part: number
  status: PartJobStatus
  error?: string
}

export interface PartGenerationState {
  isGenerating: boolean
  difficulty: Difficulty | null
  startedAt: string | null
  error: string | null
  jobs: PartGenerationJob[]
}

export function parseSkillPartKeys(skill: string, keys: string[]): number[] {
  const prefix = `${skill}:`
  return keys
    .filter(key => key.startsWith(prefix))
    .map(key => Number(key.slice(prefix.length)))
    .filter(n => Number.isFinite(n) && n > 0)
}

export function filterJobsByParts<T extends { part: number }>(
  allParts: T[],
  selectedParts?: number[]
): T[] {
  if (!selectedParts || selectedParts.length === 0) return allParts
  const selectedSet = new Set(selectedParts)
  return allParts.filter(item => selectedSet.has(item.part))
}
