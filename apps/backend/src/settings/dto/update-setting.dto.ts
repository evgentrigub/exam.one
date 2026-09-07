import { IsIn, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  packId?: string

  @IsOptional()
  @IsIn(['A2', 'C1'])
  examLevel?: 'A2' | 'C1'

  @IsOptional()
  @IsString()
  @MinLength(2)
  targetLanguage?: string
}
