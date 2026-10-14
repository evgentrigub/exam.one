import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import type { LlmProvider, LlmReasoningEffort, UpdateLlmSettingsInput } from '@exam-one/contracts'
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'
import { LLM_PROVIDERS, LLM_REASONING_EFFORTS, MAX_LLM_FALLBACK_MODELS } from '../llm-options'

const MAX_MODEL_ID_LENGTH = 200
/** Keys go into an HTTP header, so only visible ASCII is accepted. */
const PRINTABLE_ASCII = /^[\x21-\x7E]+$/
const NO_WHITESPACE = /^\S+$/

function trim(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value
}

export class LlmProviderParamDto {
  @ApiProperty({ enum: LLM_PROVIDERS, example: 'openrouter' })
  @IsIn(LLM_PROVIDERS)
  provider!: LlmProvider
}

export class SaveLlmKeyDto {
  @ApiProperty({ description: 'Provider API key; stored encrypted and never returned', example: 'sk-or-v1-…' })
  @Transform(({ value }) => trim(value))
  @IsString()
  @Length(8, 512)
  @Matches(PRINTABLE_ASCII, { message: 'apiKey must be printable ASCII without spaces' })
  apiKey!: string
}

export class UpdateLlmSettingsDto implements UpdateLlmSettingsInput {
  @ApiProperty({ enum: LLM_PROVIDERS, example: 'openrouter' })
  @IsIn(LLM_PROVIDERS)
  provider!: LlmProvider

  @ApiProperty({ example: 'google/gemma-4-31b-it:free', maxLength: MAX_MODEL_ID_LENGTH })
  @Transform(({ value }) => trim(value))
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_MODEL_ID_LENGTH)
  @Matches(NO_WHITESPACE)
  model!: string

  @ApiPropertyOptional({
    description: `Tried in order when the main model is rate-limited or unavailable (max ${MAX_LLM_FALLBACK_MODELS})`,
    type: [String],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value.map(trim) : value))
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_LLM_FALLBACK_MODELS)
  @IsString({ each: true })
  @MaxLength(MAX_MODEL_ID_LENGTH, { each: true })
  @Matches(NO_WHITESPACE, { each: true })
  fallbackModels?: string[]

  @ApiPropertyOptional({ enum: LLM_REASONING_EFFORTS, default: 'medium' })
  @IsOptional()
  @IsIn(LLM_REASONING_EFFORTS)
  reasoningEffort?: LlmReasoningEffort
}
