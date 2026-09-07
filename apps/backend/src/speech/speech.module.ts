import { Module } from '@nestjs/common'
import { TtsController } from './tts/tts.controller'
import { TtsService } from './tts/tts.service'
import { SttController } from './stt/stt.controller'
import { SttService } from './stt/stt.service'

@Module({
  controllers: [TtsController, SttController],
  providers: [TtsService, SttService],
  exports: [TtsService, SttService],
})
export class SpeechModule {}
