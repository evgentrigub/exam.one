import { Module } from '@nestjs/common'
import { PromptOverridesController } from './prompt-overrides.controller'
import { PromptOverridesService } from './prompt-overrides.service'

@Module({
  controllers: [PromptOverridesController],
  providers: [PromptOverridesService],
  exports: [PromptOverridesService],
})
export class PromptOverridesModule {}
