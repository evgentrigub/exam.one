import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import type { GenerationJobStatus } from '@exam-one/contracts'

const STATUSES = ['IDLE', 'RUNNING', 'COMPLETED', 'FAILED'] as const

export class MockExamSetBodyDto {
  @IsOptional()
  @IsObject()
  rules?: Record<string, unknown>

  @IsString()
  id!: string

  @IsString()
  examId!: string

  @IsString()
  level!: string

  @IsString()
  title!: string

  @IsBoolean()
  generated!: boolean

  @IsString()
  createdAt!: string

  @IsDefined()
  modules!: unknown

  @IsDefined()
  content!: unknown
}

export class CreateMockExamSetDto {
  @ValidateNested()
  @Type(() => MockExamSetBodyDto)
  set!: MockExamSetBodyDto
}

export class UpsertMockExamAttemptDto {
  @IsObject()
  state!: Record<string, unknown>
}

export class UpsertMockGenerationDto {
  @IsOptional()
  @IsIn(STATUSES)
  status?: GenerationJobStatus

  @IsObject()
  payload!: Record<string, unknown>
}
