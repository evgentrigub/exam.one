import { IsObject } from 'class-validator'

export class PracticeImportDto {
  @IsObject()
  entries!: Record<string, unknown>
}
