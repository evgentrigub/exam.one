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
  @IsInt()
  @Min(1)
  part!: number

  @IsString()
  @MinLength(1)
  prompt!: string
}

export class GenerateReadingDto {
  @IsString()
  difficulty!: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  prompt?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillPromptPartDto)
  prompts?: SkillPromptPartDto[]
}

export class GenerateListeningDto {
  @IsString()
  difficulty!: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SkillPromptPartDto)
  prompts!: SkillPromptPartDto[]
}

export class GenerateSpeakingDto {
  @IsString()
  difficulty!: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SkillPromptPartDto)
  prompts!: SkillPromptPartDto[]
}

export class GenerateTopicsDto {
  @IsString()
  @MinLength(1)
  prompt!: string

  @IsInt()
  @Min(1)
  part!: number

  @IsOptional()
  @IsString()
  difficulty?: string
}

export class GenerateModelAnswerDto {
  @IsObject()
  topic!: Record<string, unknown>

  @IsString()
  @MinLength(1)
  prompt!: string
}

export class ReviewWritingDto {
  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>

  @IsObject()
  topic!: Record<string, unknown>

  @IsString()
  @MinLength(1)
  userContent!: string

  @IsString()
  @MinLength(1)
  prompt!: string
}

export class ReviewSpeakingDto {
  @IsOptional()
  @IsObject()
  topic?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>

  @IsString()
  @MinLength(1)
  prompt!: string
}

export class ReviewMockExamDto {
  @IsString()
  @MinLength(1)
  prompt!: string
}
