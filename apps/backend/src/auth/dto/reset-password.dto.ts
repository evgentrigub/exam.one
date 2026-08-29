import { IsString, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MAX_LENGTH } from '../auth.constants'

export class ResetPasswordDto {
  @IsString()
  @MinLength(1)
  token!: string

  @IsString()
  @MinLength(8)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string
}
