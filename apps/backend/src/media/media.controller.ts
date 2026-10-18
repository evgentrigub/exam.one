import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import type {
  ApiResponse,
  MediaAudioDeleteResultDto,
  MediaAudioListDto,
  MediaSummaryDto,
  VoiceModelsDto,
} from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import { DeleteMediaAudioDto, SetDefaultVoiceDto, SetPreferredSttModelDto } from './dto/media.dto'
import { MediaAudioService } from './media-audio.service'
import { VoiceModelsService } from './voice-models.service'
import { SttModelsService } from './stt-models.service'

/** Settings → Generated files: listening audio on disk and the TTS voice models. */
@ApiTags('media')
@ApiCookieAuth('exam_one_access')
@Controller('media')
export class MediaController {
  constructor(
    private readonly audio: MediaAudioService,
    private readonly voices: VoiceModelsService,
    private readonly sttModels: SttModelsService
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Bytes used by installed voice models and listening audio' })
  async summary(@CurrentUser() user: User): Promise<ApiResponse<MediaSummaryDto>> {
    const [voiceBytes, audioBytes, stt] = await Promise.all([
      this.voices.installedBytes(),
      this.audio.totalBytes(user),
      this.sttModels.list(),
    ])
    return { data: { voiceBytes, audioBytes, sttBytes: stt.installedBytes } }
  }

  @Get('audio')
  @ApiOperation({
    summary: 'List listening audio on disk',
    description:
      'Shared seed WAVs of every live pack and the user’s own generated audio, one row per exercise.',
  })
  async listAudio(@CurrentUser() user: User): Promise<ApiResponse<MediaAudioListDto>> {
    return { data: { rows: await this.audio.list(user) } }
  }

  @Post('audio/delete')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete listening audio rows; they generate again when the exercise is opened',
  })
  async deleteAudio(
    @CurrentUser() user: User,
    @Body() body: DeleteMediaAudioDto
  ): Promise<ApiResponse<MediaAudioDeleteResultDto>> {
    return { data: await this.audio.delete(user, body.ids) }
  }

  @Get('voices')
  @ApiOperation({
    summary: 'Every downloadable TTS voice, installed state, size, progress and default',
  })
  async listVoices(@CurrentUser() user: User): Promise<ApiResponse<VoiceModelsDto>> {
    return { data: await this.voices.list(user) }
  }

  @Put('voices/default')
  @ApiOperation({ summary: 'Set the default voice of a language' })
  async setDefault(
    @CurrentUser() user: User,
    @Body() body: SetDefaultVoiceDto
  ): Promise<ApiResponse<{ ok: true }>> {
    await this.voices.setDefault(user, body.lang, body.voiceId)
    return { data: { ok: true } }
  }

  @Post('voices/:id/download')
  @HttpCode(202)
  @ApiParam({ name: 'id', example: 'pl_gosia' })
  @ApiOperation({ summary: 'Start downloading a voice; poll GET /media/voices for progress' })
  async download(@Param('id') id: string): Promise<ApiResponse<{ started: true }>> {
    await this.voices.download(id)
    return { data: { started: true } }
  }

  @Delete('voices/:id/download')
  @ApiParam({ name: 'id', example: 'pl_gosia' })
  @ApiOperation({ summary: 'Cancel a voice download' })
  async cancel(@Param('id') id: string): Promise<ApiResponse<{ cancelled: true }>> {
    await this.voices.cancelDownload(id)
    return { data: { cancelled: true } }
  }

  @Delete('voices/:id')
  @ApiParam({ name: 'id', example: 'pl_gosia' })
  @ApiOperation({ summary: 'Delete an installed voice' })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string
  ): Promise<ApiResponse<{ freedBytes: number }>> {
    return { data: await this.voices.remove(user, id) }
  }

  @Get('stt-models')
  @ApiOperation({ summary: 'Speech models, language preferences and installation progress' })
  async listSttModels() {
    return { data: await this.sttModels.list() }
  }

  @Put('stt-models/preferred')
  @ApiOperation({ summary: 'Set the instance-wide speech model for an exam language' })
  async preferSttModel(@Body() body: SetPreferredSttModelDto) {
    return { data: await this.sttModels.prefer(body.lang, body.modelId) }
  }

  @Post('stt-models/:id/download')
  @HttpCode(202)
  async downloadSttModel(@Param('id') id: string) {
    return { data: await this.sttModels.mutate(id, 'download') }
  }

  @Delete('stt-models/:id/download')
  async cancelSttDownload(@Param('id') id: string) {
    return { data: await this.sttModels.mutate(id, 'cancel') }
  }

  @Delete('stt-models/:id')
  async removeSttModel(@Param('id') id: string) {
    return { data: await this.sttModels.mutate(id, 'remove') }
  }
}
