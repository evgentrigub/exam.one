import { IsBoolean, IsDefined, IsObject, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class MockExamSetBodyDto {
  @IsString()
  id!: string

  @IsString()
  examId!: string

  @IsString()
  level!: string

  @IsString()
  title!: string

  @IsBoolean()
  generated!: boolean

  @IsString()
  createdAt!: string

  @IsDefined()
  modules!: unknown

  @IsDefined()
  content!: unknown
}

export class CreateMockExamSetDto {
  @ValidateNested()
  @Type(() => MockExamSetBodyDto)
  set!: MockExamSetBodyDto
}

export class UpsertMockExamAttemptDto {
  @IsObject()
  state!: Record<string, unknown>
}

export class UpsertMockGenerationDto {
  @IsObject()
  payload!: Record<string, unknown>
}
