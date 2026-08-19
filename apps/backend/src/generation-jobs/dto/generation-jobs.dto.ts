import { IsIn, IsObject, IsOptional } from 'class-validator'
import type { GenerationJobStatus, Skill } from '@exam-one/contracts'

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING', 'MOCK'] as const
const STATUSES = ['IDLE', 'RUNNING', 'COMPLETED', 'FAILED'] as const

export class UpsertGenerationJobDto {
  @IsOptional()
  @IsIn(STATUSES)
  status?: GenerationJobStatus

  @IsObject()
  payload!: Record<string, unknown>
}

export class GenerationKindParamDto {
  @IsIn(SKILLS)
  kind!: Skill
}
