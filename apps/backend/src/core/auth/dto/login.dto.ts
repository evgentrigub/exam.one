import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MAX_LENGTH } from '../auth.constants'

export class LoginDto {
  @ApiProperty({ description: 'Registered user email', example: 'ada@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({
    description: 'Account password',
    example: 'SecurePass123!',
    minLength: 1,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string

  @ApiPropertyOptional({
    description: 'Whether to extend session cookie expiration beyond default browser session',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  remember?: boolean
}
