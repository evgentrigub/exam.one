import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse as ApiResponseDoc, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { ApiResponse, LlmKeySummary, LlmModelListData, LlmSettingsDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import {
  ApiErrorDto,
  LlmKeySummaryResponseDto,
  LlmModelListResponseDto,
  LlmSettingsResponseDto,
} from '../core/dto/api-response.dto'
import { LlmProviderParamDto, SaveLlmKeyDto, UpdateLlmSettingsDto } from './dto/llm-settings.dto'
import { LlmSettingsService } from './llm-settings.service'

@ApiTags('settings')
@ApiCookieAuth('exam_one_access')
@Controller('settings/llm')
export class LlmSettingsController {
  constructor(private readonly settings: LlmSettingsService) {}

  @Get()
  @ApiOperation({ summary: "Current user's LLM provider, model, effort and saved keys (last 4 characters only)" })
  @ApiResponseDoc({ status: 200, type: LlmSettingsResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async get(@CurrentUser() user: User): Promise<ApiResponse<LlmSettingsDto>> {
    return { data: await this.settings.get(user.id) }
  }

  @Put()
  @ApiOperation({ summary: 'Choose provider, model, fallback models and reasoning effort' })
  @ApiResponseDoc({ status: 200, type: LlmSettingsResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Validation error or no saved key for the provider', type: ApiErrorDto })
  async update(@CurrentUser() user: User, @Body() body: UpdateLlmSettingsDto): Promise<ApiResponse<LlmSettingsDto>> {
    return { data: await this.settings.update(user.id, body) }
  }

  @Put('keys/:provider')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Check an API key with the provider and save it encrypted' })
  @ApiResponseDoc({ status: 200, type: LlmKeySummaryResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Invalid body or the provider rejected the key', type: ApiErrorDto })
  @ApiResponseDoc({ status: 502, description: 'The provider could not be reached', type: ApiErrorDto })
  async saveKey(
    @CurrentUser() user: User,
    @Param() params: LlmProviderParamDto,
    @Body() body: SaveLlmKeyDto
  ): Promise<ApiResponse<LlmKeySummary>> {
    return { data: await this.settings.saveKey(user.id, params.provider, body.apiKey) }
  }

  @Delete('keys/:provider')
  @ApiOperation({ summary: 'Delete a saved key; clears the selection if it was the active provider' })
  @ApiResponseDoc({ status: 200, type: LlmSettingsResponseDto })
  async removeKey(@CurrentUser() user: User, @Param() params: LlmProviderParamDto): Promise<ApiResponse<LlmSettingsDto>> {
    return { data: await this.settings.removeKey(user.id, params.provider) }
  }

  @Get('models')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Chat models available to the saved key of a provider' })
  @ApiResponseDoc({ status: 200, type: LlmModelListResponseDto })
  @ApiResponseDoc({ status: 400, description: 'No saved key or the provider rejected it', type: ApiErrorDto })
  @ApiResponseDoc({ status: 502, description: 'The provider could not be reached', type: ApiErrorDto })
  async models(@CurrentUser() user: User, @Query() query: LlmProviderParamDto): Promise<ApiResponse<LlmModelListData>> {
    return { data: await this.settings.models(user.id, query.provider) }
  }
}
