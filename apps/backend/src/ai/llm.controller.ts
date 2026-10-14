import { Controller, Get } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiCookieAuth, ApiOperation, ApiResponse as ApiResponseDoc, ApiTags } from '@nestjs/swagger'
import type { AiResponse, LlmHealthData } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import { ApiErrorDto, LlmHealthResponseDto } from '../core/dto/api-response.dto'
import { LlmService } from './llm.service'

@ApiTags('llm')
@ApiCookieAuth('exam_one_access')
@Controller('llm')
export class LlmController {
  constructor(private readonly llm: LlmService) {}

  @Get('health')
  @ApiOperation({
    summary: "Check the current user's LLM configuration and connectivity",
    description: 'Checks that the user has chosen a provider, saved its key and picked a model, then asks the model for a small JSON reply.',
  })
  @ApiResponseDoc({ status: 200, description: 'LLM configuration and connectivity status', type: LlmHealthResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  health(@CurrentUser() user: User): Promise<AiResponse<LlmHealthData>> {
    return this.llm.health(user.id)
  }
}
