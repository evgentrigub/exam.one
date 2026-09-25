import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

export class SkillPromptPartDto {
  @ApiProperty({ description: 'Testing part number (1-based)', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  part!: number

  @ApiProperty({
    description: 'Pack-assembled prompt template for this specific part',
    example: 'Generate a Goethe A2 reading part 1 task...',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  prompt!: string
}

export class GenerateReadingDto {
  @ApiProperty({ description: 'Target CEFR difficulty level', example: 'A2' })
  @IsString()
  difficulty!: string

  @ApiPropertyOptional({
    description: 'Single-part prompt override for legacy or custom calls',
    example: 'Generate a reading exercise for Goethe A2...',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  prompt?: string

  @ApiPropertyOptional({
    description: 'Array of part-specific prompts for multi-part reading generation',
    type: [SkillPromptPartDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillPromptPartDto)
  prompts?: SkillPromptPartDto[]
}

export class GenerateListeningDto {
  @ApiProperty({ description: 'Target CEFR difficulty level', example: 'A2' })
  @IsString()
  difficulty!: string

  @ApiProperty({
    description: 'Prompts for all listening parts to generate',
    type: [SkillPromptPartDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SkillPromptPartDto)
  prompts!: SkillPromptPartDto[]
}

export class GenerateSpeakingDto {
  @ApiProperty({ description: 'Target CEFR difficulty level', example: 'A2' })
  @IsString()
  difficulty!: string

  @ApiProperty({
    description: 'Prompts for speaking parts (e.g. introductions, cards, negotiations)',
    type: [SkillPromptPartDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SkillPromptPartDto)
  prompts!: SkillPromptPartDto[]
}

export class GenerateTopicsDto {
  @ApiProperty({
    description: 'Prompt specification to generate a writing topic',
    example: 'Generate a Goethe A2 Part 1 writing prompt (informal SMS)...',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  prompt!: string

  @ApiProperty({ description: 'Writing part number (e.g. 1 for SMS, 2 for formal email)', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  part!: number

  @ApiPropertyOptional({ description: 'Target CEFR difficulty level', example: 'A2' })
  @IsOptional()
  @IsString()
  difficulty?: string
}

export class GenerateModelAnswerDto {
  @ApiProperty({
    description: 'Writing topic payload containing scenario, instructions, and bullet points',
    type: Object,
    example: {
      testingPart: 1,
      title: 'Einladung zum Geburtstag',
      promptPoints: ['Bedanken', 'Zusagen', 'Etwas mitbringen'],
    },
  })
  @IsObject()
  topic!: Record<string, unknown>

  @ApiProperty({
    description: 'Prompt instructing the LLM to generate an ideal model answer',
    example: 'Write an exemplary A2 German response covering all points...',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  prompt!: string

  @ApiPropertyOptional({
    description: 'Language for the feedback text. Defaults to English when omitted.',
    example: 'de',
  })
  @IsOptional()
  @IsString()
  outputLanguage?: string

}

export class ReviewWritingDto {
  @ApiPropertyOptional({
    description: 'User response answers object',
    type: Object,
    example: { answer: 'Hallo Maria, vielen Dank für die Einladung...' },
  })
  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>

  @ApiProperty({
    description: 'Writing task/topic against which submission is graded',
    type: Object,
    example: { testingPart: 1, title: 'Einladung', points: [] },
  })
  @IsObject()
  topic!: Record<string, unknown>

  @ApiProperty({
    description: 'The written user submission text',
    example: 'Hallo Maria, vielen Dank für die Einladung. Ich komme sehr gern zu deiner Party...',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  userContent!: string

  @ApiProperty({
    description: 'Prompt specification including rubric guidelines for grading',
    example: 'Evaluate this Goethe A2 writing submission across task fulfillment and language...',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  prompt!: string

  @ApiPropertyOptional({
    description: 'Language for the feedback text. Defaults to English when omitted.',
    example: 'de',
  })
  @IsOptional()
  @IsString()
  outputLanguage?: string

}

export class ReviewSpeakingDto {
  @ApiPropertyOptional({
    description: 'Speaking card or topic payload',
    type: Object,
    example: { testingPart: 2, topic: 'Wohnen', card: 'Wohnort' },
  })
  @IsOptional()
  @IsObject()
  topic?: Record<string, unknown>

  @ApiPropertyOptional({
    description: 'Transcribed user speech answers dictionary',
    type: Object,
    example: { transcript: 'Ich wohne in Berlin seit zwei Jahren.' },
  })
  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>

  @ApiProperty({
    description: 'Prompt specification with evaluation rubric',
    example: 'Grade this spoken response against Goethe A2 speaking criteria...',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  prompt!: string

  @ApiPropertyOptional({
    description: 'Language for the feedback text. Defaults to English when omitted.',
    example: 'de',
  })
  @IsOptional()
  @IsString()
  outputLanguage?: string

}

export class ReviewMockExamDto {
  @ApiProperty({
    description: 'Prompt containing complete multi-module mock exam results and aggregated scoring prompt',
    example: 'Produce an aggregate overview of the candidates performance across all 4 modules...',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  prompt!: string
}
