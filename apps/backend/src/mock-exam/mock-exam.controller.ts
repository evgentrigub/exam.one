import { Body, Controller, Delete, Get, Param, Put, Post } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger'
import type {
  ApiResponse,
  GenerationJobDto,
  MockExamAttemptDto,
  MockExamSetDto,
  MockExamSetSummaryDto,
} from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import {
  ApiErrorDto,
  DeleteMockSetResponseDto,
  DeleteSuccessResponseDto,
  GenerationJobResponseDto,
  MockExamAttemptResponseDto,
  MockExamSetResponseDto,
  MockExamSetSummaryListResponseDto,
} from '../core/dto/api-response.dto'
import { GenerationJobsService } from './generation-jobs.service'
import {
  CreateMockExamSetDto,
  UpsertMockExamAttemptDto,
  UpsertMockGenerationDto,
} from './dto/mock-exam.dto'
import { MockExamService } from './mock-exam.service'

@ApiTags('mock-exam')
@ApiCookieAuth('exam_one_access')
@ApiHeader({
  name: 'x-exam-pack',
  required: false,
  description: 'Target exam pack identifier (e.g. goethe-de-a2). Resolves to active user setting if omitted.',
})
@Controller('mock-exam')
export class MockExamController {
  constructor(
    private readonly mockExam: MockExamService,
    private readonly generationJobs: GenerationJobsService
  ) {}

  @Get('sets')
  @ApiOperation({
    summary: 'List mock exam sets (metadata only)',
    description: 'Retrieves all available mock exam sets for the active pack (including bundled Set 1 and user-generated sets) without heavy exercise payloads.',
  })
  @ApiResponseDoc({ status: 200, description: 'Mock exam sets metadata summary', type: MockExamSetSummaryListResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async listSets(@CurrentUser() user: User): Promise<ApiResponse<MockExamSetSummaryDto[]>> {
    const data = await this.mockExam.listSets(user)
    return { data }
  }

  @Get('sets/:externalId')
  @ApiOperation({
    summary: 'Get a mock exam set including content',
    description: 'Retrieves complete mock exam set definition, module layout, timing rules, and exercise payloads by set external ID.',
  })
  @ApiParam({ name: 'externalId', description: 'Mock exam set slug (e.g. goethe-a2-set-1)', example: 'goethe-a2-set-1' })
  @ApiResponseDoc({ status: 200, description: 'Complete mock exam set payload', type: MockExamSetResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  @ApiResponseDoc({ status: 404, description: 'Mock exam set not found', type: ApiErrorDto })
  async getSet(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<MockExamSetDto>> {
    const data = await this.mockExam.getSet(user, externalId)
    return { data }
  }

  @Post('sets')
  @ApiOperation({
    summary: 'Save a generated mock exam set',
    description: 'Persists an immutable AI-generated mock exam set along with its component reading, writing, listening, and speaking exercises.',
  })
  @ApiResponseDoc({ status: 201, description: 'Persisted mock exam set', type: MockExamSetResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Invalid mock exam set structure', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async createSet(
    @CurrentUser() user: User,
    @Body() dto: CreateMockExamSetDto
  ): Promise<ApiResponse<MockExamSetDto>> {
    const data = await this.mockExam.createSet(user, dto.set)
    return { data }
  }

  @Delete('sets/:externalId')
  @ApiOperation({
    summary: 'Delete a generated mock exam set',
    description: 'Deletes a user-generated mock exam set and removes its associated exercise records. Bundled seed sets cannot be deleted.',
  })
  @ApiParam({ name: 'externalId', description: 'Mock exam set slug', example: 'goethe-a2-custom-set-1' })
  @ApiResponseDoc({ status: 200, description: 'Set deleted successfully with removed listening exercise IDs', type: DeleteMockSetResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  @ApiResponseDoc({ status: 404, description: 'Mock exam set not found or cannot delete seed set', type: ApiErrorDto })
  async deleteSet(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<{ deleted: true; listeningExerciseIds: string[] }>> {
    const listeningExerciseIds = await this.mockExam.deleteSet(user, externalId)
    return { data: { deleted: true, listeningExerciseIds } }
  }

  @Get('sets/:externalId/attempt')
  @ApiOperation({
    summary: 'Get mock exam attempt state',
    description: 'Retrieves candidate in-progress or completed full mock exam state (current module, answers, scores, timers).',
  })
  @ApiParam({ name: 'externalId', description: 'Mock exam set slug', example: 'goethe-a2-set-1' })
  @ApiResponseDoc({ status: 200, description: 'Attempt state or null if not yet started', type: MockExamAttemptResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async getAttempt(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<MockExamAttemptDto | null>> {
    const data = await this.mockExam.getAttempt(user, externalId)
    return { data }
  }

  @Put('sets/:externalId/attempt')
  @ApiOperation({
    summary: 'Save mock exam attempt state',
    description: 'Saves or updates state, answers, timer progress, and module scores during a mock exam attempt.',
  })
  @ApiParam({ name: 'externalId', description: 'Mock exam set slug', example: 'goethe-a2-set-1' })
  @ApiResponseDoc({ status: 200, description: 'Saved mock exam attempt state', type: MockExamAttemptResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Invalid attempt state payload', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async upsertAttempt(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string,
    @Body() dto: UpsertMockExamAttemptDto
  ): Promise<ApiResponse<MockExamAttemptDto>> {
    const data = await this.mockExam.upsertAttempt(user, externalId, dto.state)
    return { data }
  }

  @Delete('sets/:externalId/attempt')
  @ApiOperation({
    summary: 'Reset mock exam attempt state',
    description: 'Clears saved attempt state for a mock exam set, allowing the candidate to restart from module 1.',
  })
  @ApiParam({ name: 'externalId', description: 'Mock exam set slug', example: 'goethe-a2-set-1' })
  @ApiResponseDoc({ status: 200, description: 'Mock exam attempt reset result', type: DeleteSuccessResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async deleteAttempt(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<{ deleted: true }>> {
    await this.mockExam.deleteAttempt(user, externalId)
    return { data: { deleted: true } }
  }

  @Get('generation')
  @ApiOperation({
    summary: 'Get mock exam generation draft',
    description: 'Retrieves in-progress mock exam generation job state, allowing resumable AI/TTS generation pipelines.',
  })
  @ApiResponseDoc({ status: 200, description: 'Mock generation draft state or null', type: GenerationJobResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async getGeneration(@CurrentUser() user: User): Promise<ApiResponse<GenerationJobDto | null>> {
    const data = await this.generationJobs.get(user, 'MOCK')
    return { data }
  }

  @Put('generation')
  @ApiOperation({
    summary: 'Save mock exam generation draft',
    description: 'Updates mock exam generation draft status and payload state.',
  })
  @ApiResponseDoc({ status: 200, description: 'Saved generation draft state', type: GenerationJobResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Invalid generation draft payload', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async upsertGeneration(
    @CurrentUser() user: User,
    @Body() dto: UpsertMockGenerationDto
  ): Promise<ApiResponse<GenerationJobDto>> {
    const data = await this.generationJobs.upsert(user, 'MOCK', dto.payload, dto.status ?? 'IDLE')
    return { data }
  }

  @Delete('generation')
  @ApiOperation({
    summary: 'Clear mock exam generation draft',
    description: 'Deletes mock exam generation draft and resets pipeline state.',
  })
  @ApiResponseDoc({ status: 200, description: 'Generation draft cleared result', type: DeleteSuccessResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async deleteGeneration(@CurrentUser() user: User): Promise<ApiResponse<{ deleted: true }>> {
    await this.generationJobs.remove(user, 'MOCK')
    return { data: { deleted: true } }
  }
}
