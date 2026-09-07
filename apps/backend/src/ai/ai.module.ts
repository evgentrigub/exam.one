import { Module } from '@nestjs/common'
import { PackAiService } from './pack-ai.service'
import { AiController } from './ai.controller'
import { LlmController } from './llm.controller'
import { LlmService } from './llm.service'
import { GenerateListeningService } from './generate-listening.service'
import { GenerateReadingService } from './generate-reading.service'
import { GenerateSpeakingService } from './generate-speaking.service'
import { GenerateWritingService } from './generate-writing.service'
import { ReviewService } from './review.service'

@Module({
  controllers: [AiController, LlmController],
  providers: [
    LlmService,
    PackAiService,
    GenerateReadingService,
    GenerateListeningService,
    GenerateSpeakingService,
    GenerateWritingService,
    ReviewService,
  ],
  exports: [LlmService],
})
export class AiModule {}
