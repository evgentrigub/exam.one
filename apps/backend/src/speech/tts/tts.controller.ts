import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type {
  AiResponse,
  DeleteListeningAudioData,
  GenerateListeningAudioData,
  TtsHealthData,
} from '@exam-one/contracts'
import {
  ApiErrorDto,
  DeleteListeningAudioResponseDto,
  GenerateListeningAudioResponseDto,
  TtsHealthResponseDto,
} from '../../core/dto/api-response.dto'
import { DeleteListeningAudioDto, GenerateListeningAudioDto } from './dto/tts.dto'
import { TtsService } from './tts.service'

@ApiTags('tts')
@ApiCookieAuth('exam_one_access')
@Controller('tts')
export class TtsController {
  constructor(private readonly tts: TtsService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Check Kokoro TTS availability',
    description:
      'Pings the local or Docker Kokoro TTS service container to ensure synthesis endpoints are responsive.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'TTS service availability status',
    type: TtsHealthResponseDto,
  })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  health(): Promise<AiResponse<TtsHealthData>> {
    return this.tts.health()
  }

  @Post('generate-listening-audio')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Synthesize listening WAVs and write them to the shared audio volume',
    description:
      'Generates speech WAV audio files for listening exercise segments and writes them to the persistent shared audio storage.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Generated audio paths or error message',
    type: GenerateListeningAudioResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid exercise payload', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  generateListeningAudio(
    @Body() body: GenerateListeningAudioDto
  ): Promise<AiResponse<GenerateListeningAudioData>> {
    return this.tts.generateListeningAudio(body.exercise)
  }

  @Post('delete-listening-audio')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Delete generated listening audio directories',
    description:
      'Purges generated audio directories and files for the specified exercise IDs from storage.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Count of deleted items or error message',
    type: DeleteListeningAudioResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid exercise IDs', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  deleteListeningAudio(
    @Body() body: DeleteListeningAudioDto
  ): Promise<AiResponse<DeleteListeningAudioData>> {
    return this.tts.deleteListeningAudio(body.exerciseIds ?? [])
  }
}
