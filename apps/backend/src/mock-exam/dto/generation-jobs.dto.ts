import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsObject, IsOptional } from 'class-validator'
import type { GenerationJobStatus, Skill } from '@exam-one/contracts'

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING', 'MOCK'] as const
const STATUSES = ['IDLE', 'RUNNING', 'COMPLETED', 'FAILED'] as const

export class UpsertGenerationJobDto {
  @ApiPropertyOptional({
    description: 'Current execution status of the job',
    enum: STATUSES,
    example: 'RUNNING',
  })
  @IsOptional()
  @IsIn(STATUSES)
  status?: GenerationJobStatus

  @ApiProperty({
    description: 'Arbitrary state and progress payload of the ongoing generation process',
    type: Object,
    example: { step: 1, totalSteps: 4, generatedParts: [] },
  })
  @IsObject()
  payload!: Record<string, unknown>
}

export class GenerationKindParamDto {
  @ApiProperty({
    description: 'Skill or mock domain kind for the generation job',
    enum: SKILLS,
    example: 'READING',
  })
  @IsIn(SKILLS)
  kind!: Skill
}
