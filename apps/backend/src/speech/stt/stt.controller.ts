import { Controller, Get, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { AiResponse, SttHealthData, TranscriptionData } from '@exam-one/contracts'
import {
  ApiErrorDto,
  SttHealthResponseDto,
  TranscriptionResponseDto,
} from '../../core/dto/api-response.dto'
import { SttService } from './stt.service'

const MAX_AUDIO_BYTES = 25 * 1024 * 1024

@ApiTags('stt')
@ApiCookieAuth('exam_one_access')
@Controller('stt')
export class SttController {
  constructor(private readonly stt: SttService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Check local Parakeet readiness',
    description: 'Checks whether the local Parakeet STT container is healthy and its model is loaded.',
  })
  @ApiResponseDoc({ status: 200, description: 'STT service readiness status', type: SttHealthResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  health(): Promise<AiResponse<SttHealthData>> {
    return this.stt.health()
  }

  @Post('transcribe')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Transcribe a speaking recording',
    description: 'Transcribes an uploaded audio file (up to 25 MiB) using local Parakeet and returns the text transcript.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Audio recording file (wav, webm, mp3, ogg; max 25 MiB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponseDoc({ status: 200, description: 'Transcription result or error message', type: TranscriptionResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Missing or oversized audio file', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_AUDIO_BYTES },
    })
  )
  transcribe(
    @UploadedFile()
    file?: {
      buffer: Buffer
      size: number
      originalname?: string
      mimetype?: string
    }
  ): Promise<AiResponse<TranscriptionData>> {
    return this.stt.transcribe(file)
  }
}
