import { PackAiService } from './pack-ai.service'
import { Module } from '@nestjs/common'
import { AiController } from './ai.controller'
import { GenerateListeningService } from './generate-listening.service'
import { GenerateReadingService } from './generate-reading.service'
import { GenerateSpeakingService } from './generate-speaking.service'
import { GenerateWritingService } from './generate-writing.service'
import { ReviewService } from './review.service'

@Module({
  controllers: [AiController],
  providers: [
    PackAiService,
    GenerateReadingService,
    GenerateListeningService,
    GenerateSpeakingService,
    GenerateWritingService,
    ReviewService,
  ],
})
export class AiModule {}
