import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MAX_LENGTH } from '../auth.constants'

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Secure password reset token received via email',
    example: 'rst_abc123xyz',
  })
  @IsString()
  @MinLength(1)
  token!: string

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'NewSecurePass123!',
    minLength: 8,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string
}
