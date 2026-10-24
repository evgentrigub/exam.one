import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse as ApiResponseDoc, ApiTags } from '@nestjs/swagger'
import type { ApiResponse, SettingDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import { ApiErrorDto, SettingResponseDto } from '../core/dto/api-response.dto'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { SettingsService } from './settings.service'

@ApiTags('settings')
@ApiCookieAuth('exam_one_access')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user learning settings',
    description: 'Retrieves active learning preferences for the authenticated user, including active packId (e.g. goethe-de-a2), CEFR level, and target language.',
  })
  @ApiResponseDoc({ status: 200, description: 'Current learning settings', type: SettingResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async me(@CurrentUser() user: User): Promise<ApiResponse<SettingDto>> {
    const data = await this.settings.getMe(user)
    return { data }
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user learning settings',
    description: 'Updates active exam pack, exam level, or target language. When changing packId, language and level are synchronized with the registered pack definition.',
  })
  @ApiResponseDoc({ status: 200, description: 'Updated learning settings', type: SettingResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Validation error or invalid pack selection', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateSettingDto
  ): Promise<ApiResponse<SettingDto>> {
    const data = await this.settings.updateMe(user, dto)
    return { data }
  }
}
