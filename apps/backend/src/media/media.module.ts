import { Module } from '@nestjs/common'
import { SpeechModule } from '../speech/speech.module'
import { MediaController } from './media.controller'
import { MediaAudioService } from './media-audio.service'
import { VoiceModelsService } from './voice-models.service'
import { SttModelsService } from './stt-models.service'

@Module({
  imports: [SpeechModule],
  controllers: [MediaController],
  providers: [MediaAudioService, VoiceModelsService, SttModelsService],
})
export class MediaModule {}
