import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { ApiResponse, SettingDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { SettingsService } from './settings.service'

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user learning settings' })
  async me(@CurrentUser() user: User): Promise<ApiResponse<SettingDto>> {
    const data = await this.settings.getMe(user)
    return { data }
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user learning settings' })
  async updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateSettingDto
  ): Promise<ApiResponse<SettingDto>> {
    const data = await this.settings.updateMe(user, dto)
    return { data }
  }
}
