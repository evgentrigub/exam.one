import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type {
  AiResponse,
  DeleteListeningAudioData,
  GenerateListeningAudioData,
  TtsHealthData,
} from '@exam-one/contracts'
import { DeleteListeningAudioDto, GenerateListeningAudioDto } from './dto/tts.dto'
import { TtsService } from './tts.service'

@ApiTags('tts')
@Controller('tts')
export class TtsController {
  constructor(private readonly tts: TtsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check Kokoro TTS availability' })
  health(): Promise<AiResponse<TtsHealthData>> {
    return this.tts.health()
  }

  @Post('generate-listening-audio')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Synthesize listening WAVs and write them to the shared audio volume' })
  generateListeningAudio(
    @Body() body: GenerateListeningAudioDto
  ): Promise<AiResponse<GenerateListeningAudioData>> {
    return this.tts.generateListeningAudio(body.exercise)
  }

  @Post('delete-listening-audio')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Delete generated listening audio directories' })
  deleteListeningAudio(
    @Body() body: DeleteListeningAudioDto
  ): Promise<AiResponse<DeleteListeningAudioData>> {
    return this.tts.deleteListeningAudio(body.exerciseIds ?? [])
  }
}
