import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger'
import type { ApiResponse, AttemptDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import {
  ApiErrorDto,
  AttemptResponseDto,
  AttemptsListResponseDto,
} from '../core/dto/api-response.dto'
import { CreateAttemptDto, ListAttemptsQueryDto, PatchAttemptDto } from './dto/attempts.dto'
import { AttemptsService } from './attempts.service'

@ApiTags('attempts')
@ApiCookieAuth('exam_one_access')
@ApiHeader({
  name: 'x-exam-pack',
  required: false,
  description: 'Target exam pack identifier (e.g. goethe-de-a2). Resolves to active user setting if omitted.',
})
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attempts: AttemptsService) {}

  @Get()
  @ApiOperation({
    summary: 'List current user attempts for a skill',
    description: 'Lists practice attempts for the requested skill. Set query `history=true` to retrieve attempts across all exam packs (including inactive ones).',
  })
  @ApiQuery({ name: 'skill', enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'], description: 'Skill category' })
  @ApiQuery({ name: 'history', required: false, enum: ['true', 'false'], description: 'Include historical attempts across all packs' })
  @ApiResponseDoc({ status: 200, description: 'List of attempts', type: AttemptsListResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Invalid skill or query parameters', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async list(
    @CurrentUser() user: User,
    @Query() query: ListAttemptsQueryDto
  ): Promise<ApiResponse<AttemptDto[]>> {
    const data = await this.attempts.list(user, query.skill, query.history === 'true')
    return { data }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get attempt detail',
    description: 'Retrieves single attempt by ID, including saved snapshot, user answers, and evaluated result.',
  })
  @ApiParam({ name: 'id', description: 'Attempt UUID', example: 'att_c1234567890' })
  @ApiResponseDoc({ status: 200, description: 'Attempt detail', type: AttemptResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  @ApiResponseDoc({ status: 404, description: 'Attempt not found or belongs to another user', type: ApiErrorDto })
  async detail(@CurrentUser() user: User, @Param('id') id: string): Promise<ApiResponse<AttemptDto>> {
    return { data: await this.attempts.detail(user, id) }
  }

  @Post()
  @ApiOperation({
    summary: 'Record a skill attempt',
    description: 'Creates a practice attempt submission. Captures an immutable rendering snapshot of the exercise and associates score results.',
  })
  @ApiResponseDoc({ status: 201, description: 'Recorded attempt', type: AttemptResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Validation error or inactive pack', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateAttemptDto
  ): Promise<ApiResponse<AttemptDto>> {
    const data = await this.attempts.create(user, dto)
    return { data }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an attempt or its result',
    description: 'Updates submitted answers, scores, or AI review evaluation on an existing attempt.',
  })
  @ApiParam({ name: 'id', description: 'Attempt UUID', example: 'att_c1234567890' })
  @ApiResponseDoc({ status: 200, description: 'Updated attempt', type: AttemptResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Validation error', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  @ApiResponseDoc({ status: 404, description: 'Attempt not found', type: ApiErrorDto })
  async patch(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: PatchAttemptDto
  ): Promise<ApiResponse<AttemptDto>> {
    const data = await this.attempts.patch(user, id, dto)
    return { data }
  }
}
