import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

export class ResendVerificationDto {
  @ApiProperty({ description: 'User email address to resend confirmation code to', example: 'ada@example.com' })
  @IsEmail()
  email!: string
}
