import { Body, Controller, Delete, Get, Param, Put, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { ApiResponse, ExerciseDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import {
  CreateExerciseDto,
  ListExercisesQueryDto,
  UpdateExerciseAudioDto,
} from './dto/exercises.dto'
import { ExercisesService } from './exercises.service'

@ApiTags('exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: 'List seed and user-owned exercises for a skill' })
  async list(
    @CurrentUser() user: User,
    @Query() query: ListExercisesQueryDto
  ): Promise<ApiResponse<ExerciseDto[]>> {
    const data = await this.exercises.list(user, query.skill)
    return { data }
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a generated exercise' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateExerciseDto
  ): Promise<ApiResponse<ExerciseDto>> {
    const data = await this.exercises.create(user, dto.skill, dto.payload)
    return { data }
  }

  @Put(':externalId/audio')
  @ApiOperation({ summary: 'Update listening audio path map' })
  async updateAudio(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string,
    @Body() dto: UpdateExerciseAudioDto
  ): Promise<ApiResponse<ExerciseDto>> {
    const data = await this.exercises.updateAudio(user, externalId, dto.audio ?? {})
    return { data }
  }

  @Delete(':externalId')
  @ApiOperation({ summary: 'Delete a user-generated exercise' })
  async remove(
    @CurrentUser() user: User,
    @Param('externalId') externalId: string
  ): Promise<ApiResponse<{ deleted: true }>> {
    await this.exercises.remove(user, externalId)
    return { data: { deleted: true } }
  }
}
