import { IsDateString, IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString()
  examTargetDate?: string | null
}
