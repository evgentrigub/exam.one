import { Module } from '@nestjs/common'
import { PackAiService } from './pack-ai.service'
import { AiController } from './ai.controller'
import { LlmController } from './llm.controller'
import { LlmService } from './llm.service'

@Module({
  controllers: [AiController, LlmController],
  providers: [LlmService, PackAiService],
  exports: [LlmService],
})
export class AiModule {}
