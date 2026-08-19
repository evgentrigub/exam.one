import type { Skill } from './enums'
import type { ResultDto } from './result'

export interface AttemptDto {
  id: string
  userId: string
  exerciseId: string | null
  exerciseExternalId: string | null
  skill: Skill
  answers: unknown
  result: ResultDto | null
  submittedAt: string
}

export interface CreateAttemptRequest {
  skill: Skill
  exerciseExternalId: string
  answers: unknown
  result?: {
    score?: number | null
    maxScore?: number | null
    percentage?: number | null
    review?: unknown
  }
}
