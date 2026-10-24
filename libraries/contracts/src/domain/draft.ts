import type { Skill } from './enums'

export interface DraftDto {
  packId: string
  id: string
  userId: string
  skill: Skill
  topicId: string
  payload: unknown
  updatedAt: string
}

export interface UpsertDraftRequest {
  payload: unknown
}
