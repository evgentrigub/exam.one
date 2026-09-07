import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MAX_LENGTH } from '../auth.constants'

export class RegisterDto {
  @ApiProperty({ description: 'User full name', example: 'Ada Lovelace', minLength: 1 })
  @IsString()
  @MinLength(1)
  name!: string

  @ApiProperty({ description: 'Unique email address', example: 'ada@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({
    description: 'Account password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string
}
