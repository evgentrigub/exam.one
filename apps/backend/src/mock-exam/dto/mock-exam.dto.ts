import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
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
  @ApiPropertyOptional({
    description: 'Exam rules including timing, replay allowances, and passing scores',
    type: Object,
    example: { passPercentage: 60, moduleTimeLimitsMinutes: { reading: 30, writing: 30 } },
  })
  @IsOptional()
  @IsObject()
  rules?: Record<string, unknown>

  @ApiProperty({ description: 'Unique mock set external identifier', example: 'goethe-a2-set-custom-1' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Exam type identifier', example: 'goethe-a2' })
  @IsString()
  examId!: string

  @ApiProperty({ description: 'Target CEFR proficiency level', example: 'A2' })
  @IsString()
  level!: string

  @ApiProperty({ description: 'Title of the mock exam set', example: 'Goethe-Zertifikat A2 Mock Set 2' })
  @IsString()
  title!: string

  @ApiProperty({ description: 'Whether this set was generated dynamically by AI', example: true })
  @IsBoolean()
  generated!: boolean

  @ApiProperty({ description: 'Creation ISO timestamp string', example: '2026-01-01T12:00:00.000Z' })
  @IsString()
  createdAt!: string

  @ApiProperty({ description: 'Module definitions and time limits', type: Object })
  @IsDefined()
  modules!: unknown

  @ApiProperty({ description: 'Exercise content for each module (reading, writing, listening, speaking)', type: Object })
  @IsDefined()
  content!: unknown
}

export class CreateMockExamSetDto {
  @ApiProperty({ type: MockExamSetBodyDto, description: 'Mock exam set factory payload' })
  @ValidateNested()
  @Type(() => MockExamSetBodyDto)
  set!: MockExamSetBodyDto
}

export class UpsertMockExamAttemptDto {
  @ApiProperty({
    description: 'Complete mock exam attempt state across all modules, including answers and timer states',
    type: Object,
    example: {
      currentModule: 'READING',
      answers: {},
      scores: {},
      completed: false,
    },
  })
  @IsObject()
  state!: Record<string, unknown>
}

export class UpsertMockGenerationDto {
  @ApiPropertyOptional({
    description: 'Job execution status',
    enum: STATUSES,
    example: 'RUNNING',
  })
  @IsOptional()
  @IsIn(STATUSES)
  status?: GenerationJobStatus

  @ApiProperty({
    description: 'Resumable generation pipeline state',
    type: Object,
    example: { step: 'reading', progress: 25 },
  })
  @IsObject()
  payload!: Record<string, unknown>
}
