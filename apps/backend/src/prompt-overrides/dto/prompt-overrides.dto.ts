import { IsIn, IsInt, IsString, Max, Min, MinLength } from 'class-validator'
import { Type } from 'class-transformer'
import type { ExamLevel, PromptKind, Skill } from '@exam-one/contracts'

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'] as const
const LEVELS = ['A2'] as const
const KINDS = ['GENERATOR', 'ANSWER', 'REVIEW'] as const

export class UpsertPromptOverrideDto {
  @IsIn(SKILLS)
  skill!: Skill

  @IsIn(LEVELS)
  level!: ExamLevel

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  part!: number

  @IsIn(KINDS)
  kind!: PromptKind

  @IsString()
  @MinLength(1)
  body!: string
}

export class PromptOverrideSlotParamDto {
  @IsIn(SKILLS)
  skill!: Skill

  @IsIn(LEVELS)
  level!: ExamLevel

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  part!: number

  @IsIn(KINDS)
  kind!: PromptKind
}
