import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator'

export class GenerateListeningAudioDto {
  @ApiProperty({
    description:
      'Listening exercise object containing audio transcript segments, speakers, and texts',
    type: Object,
    example: {
      id: 'goethe-a2-listen-1',
      items: [{ id: 'item-1', transcript: 'Guten Tag, hier ist die Praxis Dr. Müller...' }],
    },
  })
  @IsObject()
  exercise!: Record<string, unknown>
}

export class DeleteListeningAudioDto {
  @ApiPropertyOptional({
    description: 'Array of exercise IDs whose audio folders should be purged',
    type: [String],
    example: ['goethe-a2-listen-1', 'goethe-a2-listen-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exerciseIds?: string[]
}
