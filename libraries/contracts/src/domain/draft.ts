import type { Skill } from './enums'

export interface DraftDto {
  id: string
  userId: string
  skill: Skill
  topicId: string
  payload: unknown
  updatedAt: string
}
