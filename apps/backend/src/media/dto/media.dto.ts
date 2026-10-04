import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, IsArray, IsIn, IsString, Matches, MaxLength } from 'class-validator'

const MAX_DELETE_IDS = 500

export class DeleteMediaAudioDto {
  @ApiProperty({
    description: 'Row ids from GET /media/audio (`kind:packId:exerciseId`)',
    example: ['generated:cambridge-en-a2:listening-key-part1-001'],
    type: [String],
  })
  @IsArray()
  @ArrayMaxSize(MAX_DELETE_IDS)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  ids!: string[]
}

export class SetDefaultVoiceDto {
  @ApiProperty({ description: 'TTS language', example: 'en' })
  @IsIn(['de', 'en', 'pl', 'es'])
  lang!: string

  @ApiProperty({ description: 'Installed voice id of that language', example: 'bf_emma' })
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{1,40}$/)
  voiceId!: string
}
