import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateSettingDto {
  @ApiPropertyOptional({
    description: 'Selected exam pack identifier',
    example: 'goethe-de-a2',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  packId?: string

  @ApiPropertyOptional({
    description: 'Exam CEFR proficiency level',
    enum: ['A2', 'C1'],
    example: 'A2',
  })
  @IsOptional()
  @IsIn(['A2', 'C1'])
  examLevel?: 'A2' | 'C1'

  @ApiPropertyOptional({
    description: 'Target language code',
    example: 'de',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  targetLanguage?: string

  @ApiPropertyOptional({ description: 'Email when a generated mock exam set is ready' })
  @IsOptional()
  @IsBoolean()
  notifyMockReadyEmail?: boolean
}
