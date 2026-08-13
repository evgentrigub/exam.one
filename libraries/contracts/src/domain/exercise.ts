import type { ExamLevel, Skill } from './enums'

export type ExerciseSource = 'seed' | 'generated'

export interface ExerciseDto {
  id: string
  skill: Skill
  level: ExamLevel
  source: ExerciseSource | string
  externalId: string | null
  payload: unknown
  createdAt: string
}
