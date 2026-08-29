import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MAX_LENGTH } from '../auth.constants'

export class RegisterDto {
  @IsString()
  @MinLength(1)
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string
}
