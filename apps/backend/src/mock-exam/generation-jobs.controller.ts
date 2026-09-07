import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger'
import type { ApiResponse, GenerationJobDto, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import {
  ApiErrorDto,
  DeleteSuccessResponseDto,
  GenerationJobResponseDto,
  GenerationJobsListResponseDto,
} from '../core/dto/api-response.dto'
import { UpsertGenerationJobDto } from './dto/generation-jobs.dto'
import { GenerationJobsService } from './generation-jobs.service'

@ApiTags('generation-jobs')
@ApiCookieAuth('exam_one_access')
@ApiHeader({
  name: 'x-exam-pack',
  required: false,
  description: 'Target exam pack identifier (e.g. goethe-de-a2). Resolves to active user setting if omitted.',
})
@Controller('generation-jobs')
export class GenerationJobsController {
  constructor(private readonly jobs: GenerationJobsService) {}

  @Get()
  @ApiOperation({
    summary: 'List resumable generation jobs',
    description: 'Lists all active or completed background generation jobs across skills and mock exams for the active pack.',
  })
  @ApiResponseDoc({ status: 200, description: 'List of generation jobs', type: GenerationJobsListResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async list(@CurrentUser() user: User): Promise<ApiResponse<GenerationJobDto[]>> {
    const data = await this.jobs.list(user)
    return { data }
  }

  @Get(':kind')
  @ApiOperation({
    summary: 'Get resumable generation state',
    description: 'Retrieves current generation job state and progress for a specific skill or MOCK.',
  })
  @ApiParam({ name: 'kind', enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING', 'MOCK'], description: 'Job target category' })
  @ApiResponseDoc({ status: 200, description: 'Generation job record or null', type: GenerationJobResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async get(
    @CurrentUser() user: User,
    @Param('kind') kind: Skill
  ): Promise<ApiResponse<GenerationJobDto | null>> {
    const data = await this.jobs.get(user, kind)
    return { data }
  }

  @Put(':kind')
  @ApiOperation({
    summary: 'Save resumable generation state',
    description: 'Persists ongoing generation steps, partial payloads, or completion status for the given skill or MOCK.',
  })
  @ApiParam({ name: 'kind', enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING', 'MOCK'], description: 'Job target category' })
  @ApiResponseDoc({ status: 200, description: 'Saved generation job', type: GenerationJobResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Validation error', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async upsert(
    @CurrentUser() user: User,
    @Param('kind') kind: Skill,
    @Body() dto: UpsertGenerationJobDto
  ): Promise<ApiResponse<GenerationJobDto>> {
    const data = await this.jobs.upsert(user, kind, dto.payload, dto.status ?? 'IDLE')
    return { data }
  }

  @Delete(':kind')
  @ApiOperation({
    summary: 'Clear generation state',
    description: 'Deletes generation job state and frees pipeline resources for the specified skill or MOCK.',
  })
  @ApiParam({ name: 'kind', enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING', 'MOCK'], description: 'Job target category' })
  @ApiResponseDoc({ status: 200, description: 'Job cleared result', type: DeleteSuccessResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async remove(
    @CurrentUser() user: User,
    @Param('kind') kind: Skill
  ): Promise<ApiResponse<{ deleted: true }>> {
    await this.jobs.remove(user, kind)
    return { data: { deleted: true } }
  }
}
