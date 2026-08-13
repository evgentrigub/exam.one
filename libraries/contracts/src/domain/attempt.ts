import type { Skill } from './enums'

export interface AttemptDto {
  id: string
  userId: string
  exerciseId: string | null
  skill: Skill
  answers: unknown
  submittedAt: string
}
