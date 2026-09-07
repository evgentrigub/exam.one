import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MAX_LENGTH } from '../auth.constants'

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current active account password',
    example: 'OldPass123!',
    minLength: 1,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(PASSWORD_MAX_LENGTH)
  currentPassword!: string

  @ApiProperty({
    description: 'New desired password (minimum 8 characters)',
    example: 'NewPass123!',
    minLength: 8,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(PASSWORD_MAX_LENGTH)
  newPassword!: string
}
