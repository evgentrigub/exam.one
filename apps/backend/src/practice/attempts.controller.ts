import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { ApiResponse, AttemptDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import { CreateAttemptDto, ListAttemptsQueryDto, PatchAttemptDto } from './dto/attempts.dto'
import { AttemptsService } from './attempts.service'

@ApiTags('attempts')
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attempts: AttemptsService) {}

  @Get()
  @ApiOperation({ summary: 'List current user attempts for a skill' })
  async list(
    @CurrentUser() user: User,
    @Query() query: ListAttemptsQueryDto
  ): Promise<ApiResponse<AttemptDto[]>> {
    const data = await this.attempts.list(user, query.skill, query.history === 'true')
    return { data }
  }

  @Get(':id')
  async detail(@CurrentUser() user: User, @Param('id') id: string): Promise<ApiResponse<AttemptDto>> {
    return { data: await this.attempts.detail(user, id) }
  }

  @Post()
  @ApiOperation({ summary: 'Record a skill attempt' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateAttemptDto
  ): Promise<ApiResponse<AttemptDto>> {
    const data = await this.attempts.create(user, dto)
    return { data }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attempt or its result' })
  async patch(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: PatchAttemptDto
  ): Promise<ApiResponse<AttemptDto>> {
    const data = await this.attempts.patch(user, id, dto)
    return { data }
  }
}
