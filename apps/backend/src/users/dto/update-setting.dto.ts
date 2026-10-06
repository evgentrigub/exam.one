import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateSettingDto {
  @ApiPropertyOptional({
    description: 'Selected exam pack identifier',
    example: 'cambridge-en-a2',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  packId?: string

  @ApiPropertyOptional({
    description: 'Deprecated and ignored: the level always follows the selected pack (packId)',
    deprecated: true,
    example: 'A2',
  })
  @IsOptional()
  @IsString()
  examLevel?: string

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
