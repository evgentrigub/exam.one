import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator'

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Updated display name',
    example: 'Ada Lovelace',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @ApiPropertyOptional({
    description: 'Updated email address',
    example: 'ada.lovelace@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({
    description: 'Target exam ISO date or null to clear',
    example: '2026-12-15T00:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString()
  examTargetDate?: string | null
}
