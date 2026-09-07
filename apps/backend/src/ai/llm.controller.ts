import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { AiResponse, LlmHealthData } from '@exam-one/contracts'
import { LlmService } from './llm.service'

@ApiTags('llm')
@Controller('llm')
export class LlmController {
  constructor(private readonly llm: LlmService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check LLM provider configuration and connectivity' })
  health(): Promise<AiResponse<LlmHealthData>> {
    return this.llm.health()
  }
}
