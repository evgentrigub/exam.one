import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(1)
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  password!: string
}
