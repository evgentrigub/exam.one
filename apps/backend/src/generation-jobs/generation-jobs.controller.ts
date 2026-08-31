import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { ApiResponse, GenerationJobDto, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UpsertGenerationJobDto } from './dto/generation-jobs.dto'
import { GenerationJobsService } from './generation-jobs.service'

@ApiTags('generation-jobs')
@Controller('generation-jobs')
export class GenerationJobsController {
  constructor(private readonly jobs: GenerationJobsService) {}

  @Get()
  @ApiOperation({ summary: 'List resumable generation jobs' })
  async list(@CurrentUser() user: User): Promise<ApiResponse<GenerationJobDto[]>> {
    const data = await this.jobs.list(user)
    return { data }
  }

  @Get(':kind')
  @ApiOperation({ summary: 'Get resumable generation state' })
  async get(
    @CurrentUser() user: User,
    @Param('kind') kind: Skill
  ): Promise<ApiResponse<GenerationJobDto | null>> {
    const data = await this.jobs.get(user, kind)
    return { data }
  }

  @Put(':kind')
  @ApiOperation({ summary: 'Save resumable generation state' })
  async upsert(
    @CurrentUser() user: User,
    @Param('kind') kind: Skill,
    @Body() dto: UpsertGenerationJobDto
  ): Promise<ApiResponse<GenerationJobDto>> {
    const data = await this.jobs.upsert(user, kind, dto.payload, dto.status ?? 'IDLE')
    return { data }
  }

  @Delete(':kind')
  @ApiOperation({ summary: 'Clear generation state' })
  async remove(
    @CurrentUser() user: User,
    @Param('kind') kind: Skill
  ): Promise<ApiResponse<{ deleted: true }>> {
    await this.jobs.remove(user, kind)
    return { data: { deleted: true } }
  }
}
