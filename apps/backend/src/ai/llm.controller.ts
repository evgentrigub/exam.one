import { Controller, Get } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse as ApiResponseDoc, ApiTags } from '@nestjs/swagger'
import type { AiResponse, LlmHealthData } from '@exam-one/contracts'
import { ApiErrorDto, LlmHealthResponseDto } from '../core/dto/api-response.dto'
import { LlmService } from './llm.service'

@ApiTags('llm')
@ApiCookieAuth('exam_one_access')
@Controller('llm')
export class LlmController {
  constructor(private readonly llm: LlmService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Check LLM provider configuration and connectivity',
    description: 'Checks if LLM API keys are configured (OpenAI or OpenRouter) and tests upstream completion connectivity.',
  })
  @ApiResponseDoc({ status: 200, description: 'LLM configuration and connectivity status', type: LlmHealthResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  health(): Promise<AiResponse<LlmHealthData>> {
    return this.llm.health()
  }
}
