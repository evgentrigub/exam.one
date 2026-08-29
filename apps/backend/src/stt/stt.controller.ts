import { Controller, Get, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { AiResponse, SttHealthData, TranscriptionData } from '@exam-one/contracts'
import { SttService } from './stt.service'

const MAX_AUDIO_BYTES = 25 * 1024 * 1024

@ApiTags('stt')
@Controller('stt')
export class SttController {
  constructor(private readonly stt: SttService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check local Parakeet or OpenAI Whisper readiness' })
  health(): Promise<AiResponse<SttHealthData>> {
    return this.stt.health()
  }

  @Post('transcribe')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Transcribe a speaking recording' })
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
