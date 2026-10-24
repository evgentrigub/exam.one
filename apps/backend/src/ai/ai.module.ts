import { Module } from '@nestjs/common'
import { PackAiService } from './pack-ai.service'
import { AiController } from './ai.controller'
import { LlmController } from './llm.controller'
import { LlmService } from './llm.service'
import { LlmSettingsController } from './llm-settings.controller'
import { LlmSettingsService } from './llm-settings.service'

@Module({
  controllers: [AiController, LlmController, LlmSettingsController],
  providers: [LlmService, LlmSettingsService, PackAiService],
  exports: [LlmService, PackAiService],
})
export class AiModule {}
