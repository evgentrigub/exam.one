import { IsIn, IsObject } from 'class-validator'
import type { Skill } from '@exam-one/contracts'

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'] as const

export class UpsertDraftDto {
  @IsObject()
  payload!: Record<string, unknown>
}

export class ListDraftsQueryDto {
  @IsIn(SKILLS)
  skill!: Skill
}
