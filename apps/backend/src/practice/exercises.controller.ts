import { Body, Controller, Delete, Get, Param, Put, Post, Query } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse as ApiResponseDoc,
  ApiTags,
} from '@nestjs/swagger'
import type { ApiResponse, ExerciseDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import {
  ApiErrorDto,
  DeleteSuccessResponseDto,
  ExerciseResponseDto,
  ExercisesListResponseDto,
} from '../core/dto/api-response.dto'
import {
  CreateExerciseDto,
  ListExercisesQueryDto,
  UpdateExerciseAudioDto,
} from './dto/exercises.dto'
import { ExercisesService } from './exercises.service'

@ApiTags('exercises')
@ApiCookieAuth('exam_one_access')
@ApiHeader({
  name: 'x-exam-pack',
  required: false,
  description:
    'Target exam pack identifier (e.g. goethe-de-a2). Resolves to active user setting if omitted.',
})
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Get()
  @ApiOperation({
    summary: 'List seed and user-owned exercises for a skill',
    description:
      'Returns combined catalog of official seed exercises and user-generated practice exercises for the active exam pack and requested skill.',
  })
  @ApiQuery({
    name: 'skill',
    enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'],
    description: 'Skill category',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Catalog exercises list',
    type: ExercisesListResponseDto,
  })
  @ApiResponseDoc({
    status: 400,
    description: 'Invalid query parameters or unsupported pack',
    type: ApiErrorDto,
  })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async list(
    @CurrentUser() user: User,
    @Query() query: ListExercisesQueryDto
  ): Promise<ApiResponse<ExerciseDto[]>> {
    const data = await this.exercises.list(user, query.skill)
    return { data }
  }

  @Post()
  @ApiOperation({
    summary: 'Create or update a generated exercise',
    description: 'Persists a generated exercise for the current user and active exam pack.',
  })
  @ApiResponseDoc({
    status: 201,
    description: 'Created or updated exercise',
    type: ExerciseResponseDto,
  })
  @ApiResponseDoc({ status: 400, description: 'Invalid exercise payload', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateExerciseDto
  ): Promise<ApiResponse<ExerciseDto>> {
    const data = await this.exercises.create(user, dto.skill, dto.payload)
    return { data }
  }

  @Put(':externalId/audio')
  @ApiOperation({
    summary: 'Update listening audio path map',
    description: 'Attaches generated audio file paths to the specified exercise external ID.',
  })
  @ApiParam({
    name: 'externalId',
    description: 'Exercise external slug identifier',
    example: 'goethe-a2-listen-part1-custom',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Updated exercise with audio map',
    type: ExerciseResponseDto,
  })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  @ApiResponseDoc({ status: 404, description: 'Exercise not found', type: ApiErrorDto })
  async updateAudio(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string,
    @Body() dto: UpdateExerciseAudioDto
  ): Promise<ApiResponse<ExerciseDto>> {
    const data = await this.exercises.updateAudio(user, externalId, dto.audio ?? {})
    return { data }
  }

  @Delete(':externalId')
  @ApiOperation({
    summary: 'Delete a user-generated exercise',
    description:
      'Removes a user-generated exercise by external ID. Seed exercises cannot be deleted.',
  })
  @ApiParam({
    name: 'externalId',
    description: 'Exercise external slug identifier',
    example: 'goethe-a2-reading-custom-1',
  })
  @ApiResponseDoc({ status: 200, description: 'Deletion result', type: DeleteSuccessResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  @ApiResponseDoc({
    status: 404,
    description: 'Exercise not found or cannot delete seed exercise',
    type: ApiErrorDto,
  })
  async remove(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<{ deleted: true }>> {
    await this.exercises.remove(user, externalId)
    return { data: { deleted: true } }
  }
}
