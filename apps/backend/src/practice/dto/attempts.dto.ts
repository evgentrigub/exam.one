import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsIn,
  IsObject,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsString,
} from 'class-validator'
import { Type } from 'class-transformer'
import type { Skill } from '@exam-one/contracts'

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'] as const

export class ListAttemptsQueryDto {
  @ApiPropertyOptional({
    description:
      'When true, includes historical attempts across all packs rather than just active pack',
    enum: ['true', 'false'],
    example: 'false',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  history?: string

  @ApiProperty({
    description: 'Skill category filter',
    enum: SKILLS,
    example: 'READING',
  })
  @IsIn(SKILLS)
  skill!: Skill
}

export class AttemptResultDto {
  @ApiPropertyOptional({
    description: 'Calculated score points',
    type: Number,
    nullable: true,
    example: 4.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number | null

  @ApiPropertyOptional({
    description: 'Maximum attainable score points',
    type: Number,
    nullable: true,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number | null

  @ApiPropertyOptional({
    description: 'Score percentage (0-100)',
    type: Number,
    nullable: true,
    example: 90,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percentage?: number | null

  @ApiPropertyOptional({
    description: 'Criterion review or evaluation feedback JSON',
    type: Object,
    nullable: true,
  })
  @IsOptional()
  review?: unknown
}

export class CreateAttemptDto {
  @ApiProperty({
    description: 'Skill practiced in this attempt',
    enum: SKILLS,
    example: 'READING',
  })
  @IsIn(SKILLS)
  skill!: Skill

  @ApiPropertyOptional({
    description: 'External ID of the exercise attempted',
    example: 'goethe-a2-reading-part-1',
  })
  @IsOptional()
  @IsString()
  exerciseExternalId?: string

  @ApiProperty({
    description: 'Dictionary of user answers matching exercise question keys',
    type: Object,
    example: { q1: 0, q2: 2 },
  })
  @IsObject()
  answers!: Record<string, unknown>

  @ApiPropertyOptional({
    description: 'Initial scoring result if graded on client/submission',
    type: () => AttemptResultDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AttemptResultDto)
  result?: AttemptResultDto
}

export class PatchAttemptDto {
  @ApiPropertyOptional({
    description: 'Updated user answers dictionary',
    type: Object,
    example: { q1: 1, q2: 2 },
  })
  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>

  @ApiPropertyOptional({
    description: 'Updated score, percentage, or AI review',
    type: () => AttemptResultDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AttemptResultDto)
  result?: AttemptResultDto
}
