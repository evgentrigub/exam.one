import type { Skill } from './enums'

export type GenerationJobStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface GenerationJobDto {
  id: string
  userId: string
  kind: Skill
  status: GenerationJobStatus | string
  payload: unknown
  updatedAt: string
}

export interface UpsertGenerationJobRequest {
  status?: GenerationJobStatus
  payload: unknown
}
