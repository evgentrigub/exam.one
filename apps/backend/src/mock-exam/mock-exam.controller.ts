import { Body, Controller, Delete, Get, Param, Put, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type {
  ApiResponse,
  GenerationJobDto,
  MockExamAttemptDto,
  MockExamSetDto,
  MockExamSetSummaryDto,
} from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import { GenerationJobsService } from './generation-jobs.service'
import {
  CreateMockExamSetDto,
  UpsertMockExamAttemptDto,
  UpsertMockGenerationDto,
} from './dto/mock-exam.dto'
import { MockExamService } from './mock-exam.service'

@ApiTags('mock-exam')
@Controller('mock-exam')
export class MockExamController {
  constructor(
    private readonly mockExam: MockExamService,
    private readonly generationJobs: GenerationJobsService
  ) {}

  @Get('sets')
  @ApiOperation({ summary: 'List mock exam sets (metadata only)' })
  async listSets(@CurrentUser() user: User): Promise<ApiResponse<MockExamSetSummaryDto[]>> {
    const data = await this.mockExam.listSets(user)
    return { data }
  }

  @Get('sets/:externalId')
  @ApiOperation({ summary: 'Get a mock exam set including content' })
  async getSet(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<MockExamSetDto>> {
    const data = await this.mockExam.getSet(user, externalId)
    return { data }
  }

  @Post('sets')
  @ApiOperation({ summary: 'Save a generated mock exam set' })
  async createSet(
    @CurrentUser() user: User,
    @Body() dto: CreateMockExamSetDto
  ): Promise<ApiResponse<MockExamSetDto>> {
    const data = await this.mockExam.createSet(user, dto.set)
    return { data }
  }

  @Delete('sets/:externalId')
  @ApiOperation({ summary: 'Delete a generated mock exam set' })
  async deleteSet(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<{ deleted: true; listeningExerciseIds: string[] }>> {
    const listeningExerciseIds = await this.mockExam.deleteSet(user, externalId)
    return { data: { deleted: true, listeningExerciseIds } }
  }

  @Get('sets/:externalId/attempt')
  @ApiOperation({ summary: 'Get mock exam attempt state' })
  async getAttempt(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<MockExamAttemptDto | null>> {
    const data = await this.mockExam.getAttempt(user, externalId)
    return { data }
  }

  @Put('sets/:externalId/attempt')
  @ApiOperation({ summary: 'Save mock exam attempt state' })
  async upsertAttempt(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string,
    @Body() dto: UpsertMockExamAttemptDto
  ): Promise<ApiResponse<MockExamAttemptDto>> {
    const data = await this.mockExam.upsertAttempt(user, externalId, dto.state)
    return { data }
  }

  @Delete('sets/:externalId/attempt')
  @ApiOperation({ summary: 'Reset mock exam attempt state' })
  async deleteAttempt(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<{ deleted: true }>> {
    await this.mockExam.deleteAttempt(user, externalId)
    return { data: { deleted: true } }
  }

  @Get('generation')
  @ApiOperation({ summary: 'Get mock exam generation draft' })
  async getGeneration(@CurrentUser() user: User): Promise<ApiResponse<GenerationJobDto | null>> {
    const data = await this.generationJobs.get(user, 'MOCK')
    return { data }
  }

  @Put('generation')
  @ApiOperation({ summary: 'Save mock exam generation draft' })
  async upsertGeneration(
    @CurrentUser() user: User,
    @Body() dto: UpsertMockGenerationDto
  ): Promise<ApiResponse<GenerationJobDto>> {
    const data = await this.generationJobs.upsert(user, 'MOCK', dto.payload, dto.status ?? 'IDLE')
    return { data }
  }

  @Delete('generation')
  @ApiOperation({ summary: 'Clear mock exam generation draft' })
  async deleteGeneration(@CurrentUser() user: User): Promise<ApiResponse<{ deleted: true }>> {
    await this.generationJobs.remove(user, 'MOCK')
    return { data: { deleted: true } }
  }
}
