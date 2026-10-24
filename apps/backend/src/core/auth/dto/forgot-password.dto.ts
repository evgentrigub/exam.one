import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Registered email address to request password reset link for', example: 'ada@example.com' })
  @IsEmail()
  email!: string
}
