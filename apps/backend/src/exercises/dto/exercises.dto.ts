import { IsIn, IsObject, IsOptional } from 'class-validator'
import type { Skill } from '@exam-one/contracts'

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'] as const

export class ListExercisesQueryDto {
  @IsIn(SKILLS)
  skill!: Skill
}

export class CreateExerciseDto {
  @IsIn(SKILLS)
  skill!: Skill

  @IsObject()
  payload!: Record<string, unknown>
}

export class UpdateExerciseAudioDto {
  @IsOptional()
  @IsObject()
  audio?: Record<string, unknown>
}
