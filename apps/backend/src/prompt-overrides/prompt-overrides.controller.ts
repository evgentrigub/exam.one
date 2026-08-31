import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { ApiResponse, PromptOverrideDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import {
  PromptOverrideSlotParamDto,
  UpsertPromptOverrideDto,
} from './dto/prompt-overrides.dto'
import { PromptOverridesService } from './prompt-overrides.service'

@ApiTags('prompt-overrides')
@Controller('prompt-overrides')
export class PromptOverridesController {
  constructor(private readonly prompts: PromptOverridesService) {}

  @Get()
  @ApiOperation({ summary: 'List prompt overrides for the current user' })
  async list(@CurrentUser() user: User): Promise<ApiResponse<PromptOverrideDto[]>> {
    const data = await this.prompts.list(user)
    return { data }
  }

  @Put()
  @ApiOperation({ summary: 'Create or replace a prompt override' })
  async upsert(
    @CurrentUser() user: User,
    @Body() dto: UpsertPromptOverrideDto
  ): Promise<ApiResponse<PromptOverrideDto>> {
    const data = await this.prompts.upsert(
      user,
      dto.skill,
      dto.level,
      dto.part,
      dto.kind,
      dto.body
    )
    return { data }
  }

  @Delete(':skill/:level/:part/:kind')
  @ApiOperation({ summary: 'Restore the default prompt for a slot' })
  async remove(
    @CurrentUser() user: User,
    @Param() params: PromptOverrideSlotParamDto
  ): Promise<ApiResponse<{ deleted: true }>> {
    await this.prompts.remove(user, params.skill, params.level, params.part, params.kind)
    return { data: { deleted: true } }
  }
}
