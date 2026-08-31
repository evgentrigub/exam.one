import type { ExamLevel, Skill } from './enums'

export type PromptKind = 'GENERATOR' | 'ANSWER' | 'REVIEW'

export interface PromptOverrideDto {
  id: string
  userId: string
  skill: Skill
  level: ExamLevel
  part: number
  kind: PromptKind
  body: string
  updatedAt: string
}

export interface UpsertPromptOverrideRequest {
  skill: Skill
  level: ExamLevel
  part: number
  kind: PromptKind
  body: string
}
