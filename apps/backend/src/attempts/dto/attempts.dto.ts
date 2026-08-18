import { IsIn, IsObject, IsOptional, IsInt, Min, Max, ValidateNested, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import type { Skill } from '@exam-one/contracts'

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'] as const

export class ListAttemptsQueryDto {
  @IsIn(SKILLS)
  skill!: Skill
}

export class AttemptResultDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number | null

  @IsOptional()
  @IsInt()
  @Min(0)
  maxScore?: number | null

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percentage?: number | null

  @IsOptional()
  review?: unknown
}

export class CreateAttemptDto {
  @IsIn(SKILLS)
  skill!: Skill

  @IsOptional()
  @IsString()
  exerciseExternalId?: string

  @IsObject()
  answers!: Record<string, unknown>

  @IsOptional()
  @ValidateNested()
  @Type(() => AttemptResultDto)
  result?: AttemptResultDto
}

export class PatchAttemptDto {
  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>

  @IsOptional()
  @ValidateNested()
  @Type(() => AttemptResultDto)
  result?: AttemptResultDto
}
