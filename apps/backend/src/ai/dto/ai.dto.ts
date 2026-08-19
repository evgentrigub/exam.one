import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

export class SkillPromptPartDto {
  @IsInt()
  @Min(1)
  @Max(4)
  part!: number

  @IsString()
  @MinLength(1)
  prompt!: string
}

export class GenerateReadingDto {
  @IsIn(['A2', 'C1'])
  difficulty!: 'A2' | 'C1'

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
  @IsIn(['A2', 'C1'])
  difficulty!: 'A2' | 'C1'

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SkillPromptPartDto)
  prompts!: SkillPromptPartDto[]
}

export class GenerateSpeakingDto {
  @IsIn(['A2', 'C1'])
  difficulty!: 'A2' | 'C1'

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
  @Max(2)
  part!: 1 | 2

  @IsOptional()
  @IsIn(['A2', 'C1'])
  difficulty?: 'A2' | 'C1'
}

export class GenerateModelAnswerDto {
  @IsObject()
  topic!: Record<string, unknown>

  @IsString()
  @MinLength(1)
  prompt!: string
}

export class ReviewWritingDto {
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
  @IsString()
  @MinLength(1)
  prompt!: string
}

export class ReviewMockExamDto {
  @IsString()
  @MinLength(1)
  prompt!: string
}
