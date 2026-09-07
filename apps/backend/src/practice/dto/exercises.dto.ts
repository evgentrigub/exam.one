import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsObject, IsOptional } from 'class-validator'
import type { Skill } from '@exam-one/contracts'

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'] as const

export class ListExercisesQueryDto {
  @ApiProperty({
    description: 'Skill category filter',
    enum: SKILLS,
    example: 'READING',
  })
  @IsIn(SKILLS)
  skill!: Skill
}

export class CreateExerciseDto {
  @ApiProperty({
    description: 'Skill category for the new exercise',
    enum: SKILLS,
    example: 'READING',
  })
  @IsIn(SKILLS)
  skill!: Skill

  @ApiProperty({
    description: 'Pack-conforming exercise payload object containing tasks, questions, and texts',
    type: Object,
    example: {
      type: 'reading-part-1',
      title: 'E-Mail von Freunden',
      items: [],
    },
  })
  @IsObject()
  payload!: Record<string, unknown>
}

export class UpdateExerciseAudioDto {
  @ApiPropertyOptional({
    description: 'Map of question or item keys to generated audio file paths',
    type: Object,
    example: {
      shared: '/audio/listening/shared.wav',
      items: { 'q1': '/audio/listening/q1.wav' },
    },
  })
  @IsOptional()
  @IsObject()
  audio?: Record<string, unknown>
}
