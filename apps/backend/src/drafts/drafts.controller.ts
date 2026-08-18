import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { ApiResponse, DraftDto, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { ListDraftsQueryDto, UpsertDraftDto } from './dto/drafts.dto'
import { DraftsService } from './drafts.service'

@ApiTags('drafts')
@Controller('drafts')
export class DraftsController {
  constructor(private readonly drafts: DraftsService) {}

  @Get()
  @ApiOperation({ summary: 'List drafts for a skill' })
  async list(
    @CurrentUser() user: User,
    @Query() query: ListDraftsQueryDto
  ): Promise<ApiResponse<DraftDto[]>> {
    const data = await this.drafts.list(user, query.skill)
    return { data }
  }

  @Get(':skill/:topicId')
  @ApiOperation({ summary: 'Get one draft' })
  async get(
    @CurrentUser() user: User,
    @Param('skill') skill: Skill,
    @Param('topicId') topicId: string
  ): Promise<ApiResponse<DraftDto | null>> {
    const data = await this.drafts.get(user, skill, topicId)
    return { data }
  }

  @Put(':skill/:topicId')
  @ApiOperation({ summary: 'Create or replace a draft' })
  async upsert(
    @CurrentUser() user: User,
    @Param('skill') skill: Skill,
    @Param('topicId') topicId: string,
    @Body() dto: UpsertDraftDto
  ): Promise<ApiResponse<DraftDto>> {
    const data = await this.drafts.upsert(user, skill, topicId, dto.payload)
    return { data }
  }

  @Delete(':skill/:topicId')
  @ApiOperation({ summary: 'Delete a draft' })
  async remove(
    @CurrentUser() user: User,
    @Param('skill') skill: Skill,
    @Param('topicId') topicId: string
  ): Promise<ApiResponse<{ deleted: true }>> {
    await this.drafts.remove(user, skill, topicId)
    return { data: { deleted: true } }
  }
}
