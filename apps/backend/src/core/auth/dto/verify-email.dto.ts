import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Length } from 'class-validator'

export class VerifyEmailDto {
  @ApiProperty({ description: 'User email address to verify', example: 'ada@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({
    description: '6-digit verification code sent via email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  code!: string
}
