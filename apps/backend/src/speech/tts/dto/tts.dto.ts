import { IsArray, IsObject, IsOptional, IsString } from 'class-validator'

export class GenerateListeningAudioDto {
  @IsObject()
  exercise!: Record<string, unknown>
}

export class DeleteListeningAudioDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exerciseIds?: string[]
}
