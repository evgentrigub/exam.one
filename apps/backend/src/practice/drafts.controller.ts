import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger'
import type { ApiResponse, DraftDto, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import {
  ApiErrorDto,
  DeleteSuccessResponseDto,
  DraftResponseDto,
  DraftsListResponseDto,
} from '../core/dto/api-response.dto'
import { ListDraftsQueryDto, UpsertDraftDto } from './dto/drafts.dto'
import { DraftsService } from './drafts.service'

@ApiTags('drafts')
@ApiCookieAuth('exam_one_access')
@ApiHeader({
  name: 'x-exam-pack',
  required: false,
  description:
    'Target exam pack identifier (e.g. goethe-de-a2). Resolves to active user setting if omitted.',
})
@Controller('drafts')
export class DraftsController {
  constructor(private readonly drafts: DraftsService) {}

  @Get()
  @ApiOperation({
    summary: 'List drafts for a skill',
    description:
      'Lists all active in-progress exercise or writing drafts for the specified skill in the active pack.',
  })
  @ApiQuery({
    name: 'skill',
    enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'],
    description: 'Skill category',
  })
  @ApiResponseDoc({ status: 200, description: 'Drafts list', type: DraftsListResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async list(
    @CurrentUser() user: User,
    @Query() query: ListDraftsQueryDto
  ): Promise<ApiResponse<DraftDto[]>> {
    const data = await this.drafts.list(user, query.skill)
    return { data }
  }

  @Get(':skill/:topicId')
  @ApiOperation({
    summary: 'Get one draft',
    description:
      'Retrieves a single saved draft by skill and topic identifier, or returns null if no draft exists.',
  })
  @ApiParam({
    name: 'skill',
    enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'],
    description: 'Skill area',
  })
  @ApiParam({
    name: 'topicId',
    description: 'Exercise or topic identifier',
    example: 'goethe-a2-writing-p1',
  })
  @ApiResponseDoc({ status: 200, description: 'Draft record or null', type: DraftResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async get(
    @CurrentUser() user: User,
    @Param('skill') skill: Skill,
    @Param('topicId') topicId: string
  ): Promise<ApiResponse<DraftDto | null>> {
    const data = await this.drafts.get(user, skill, topicId)
    return { data }
  }

  @Put(':skill/:topicId')
  @ApiOperation({
    summary: 'Create or replace a draft',
    description:
      'Upserts draft state for a topic/exercise. Replaces any prior draft for this topic.',
  })
  @ApiParam({
    name: 'skill',
    enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'],
    description: 'Skill area',
  })
  @ApiParam({
    name: 'topicId',
    description: 'Exercise or topic identifier',
    example: 'goethe-a2-writing-p1',
  })
  @ApiResponseDoc({ status: 200, description: 'Saved draft', type: DraftResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Validation error', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
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
  @ApiOperation({
    summary: 'Delete a draft',
    description: 'Deletes draft state for the given skill and topic.',
  })
  @ApiParam({
    name: 'skill',
    enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'],
    description: 'Skill area',
  })
  @ApiParam({
    name: 'topicId',
    description: 'Exercise or topic identifier',
    example: 'goethe-a2-writing-p1',
  })
  @ApiResponseDoc({ status: 200, description: 'Deletion status', type: DeleteSuccessResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async remove(
    @CurrentUser() user: User,
    @Param('skill') skill: Skill,
    @Param('topicId') topicId: string
  ): Promise<ApiResponse<{ deleted: true }>> {
    await this.drafts.remove(user, skill, topicId)
    return { data: { deleted: true } }
  }
}
