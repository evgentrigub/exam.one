import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsObject } from 'class-validator'
import type { Skill } from '@exam-one/contracts'

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'] as const

export class UpsertDraftDto {
  @ApiProperty({
    description: 'Arbitrary draft state payload (e.g. form fields, text, current progress)',
    type: Object,
    example: { text: 'Sehr geehrte Damen und Herren,\n' },
  })
  @IsObject()
  payload!: Record<string, unknown>
}

export class ListDraftsQueryDto {
  @ApiProperty({
    description: 'Skill category filter',
    enum: SKILLS,
    example: 'WRITING',
  })
  @IsIn(SKILLS)
  skill!: Skill
}
