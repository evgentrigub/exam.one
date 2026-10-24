import type { ExamLevel, Skill } from './enums'

export type ExerciseSource = 'seed' | 'generated'

export type ExerciseVisibility = 'PRACTICE' | 'EXAM_ONLY'

export type ExerciseScope = 'practice' | 'all'

export interface ExerciseDto {
  id: string
  packId: string
  skill: Skill
  level: ExamLevel
  source: ExerciseSource | string
  visibility: ExerciseVisibility | string
  externalId: string
  payload: unknown
  createdAt: string
}

export interface CreateExerciseRequest {
  skill: Skill
  payload: unknown
}

export interface UpdateExerciseAudioRequest {
  audio: unknown
}
