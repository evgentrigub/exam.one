import { Body, Controller, Delete, Get, Header, Param, Post, Query, Sse, BadRequestException, ConflictException } from '@nestjs/common'
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { SkipThrottle, Throttle } from '@nestjs/throttler'
import { getLivePack } from '@exam-one/exam-packs'
import type { ApiResponse, BackgroundJobDto, BackgroundJobList, JobEvent } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { interval, map, merge, takeUntil, timer, type Observable } from 'rxjs'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import { resolveUserPackId } from '../core/context/active-pack'
import { ExercisesService } from '../practice/exercises.service'
import { LlmService } from '../ai/llm.service'
import { TtsService } from '../speech/tts/tts.service'
import { BackgroundJobsService } from './background-jobs.service'
import { JobEventsService } from './job-events.service'
import { EnqueueAudioDto, EnqueueExercisesDto, EnqueueMockDto } from './dto/jobs.dto'
import { toBackgroundJobDto } from '../common/mappers/practice.mapper'

@ApiTags('jobs')
@ApiCookieAuth('exam_one_access')
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobs: BackgroundJobsService,
    private readonly events: JobEventsService,
    private readonly exercises: ExercisesService,
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly tts: TtsService
  ) {}

  @Sse('stream')
  @Header('X-Accel-Buffering', 'no')
  @SkipThrottle()
  stream(@CurrentUser() user: User): Observable<{ data: JobEvent }> {
    return merge(
      this.events.streamFor(user.id),
      interval(25000).pipe(map((): JobEvent => ({ type: 'heartbeat' })))
    ).pipe(takeUntil(timer(10 * 60 * 1000)), map(data => ({ data })))
  }

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query('limit') rawLimit?: string,
    @Query('cursor') cursor?: string
  ): Promise<ApiResponse<BackgroundJobList>> {
    const limit = rawLimit ? Number(rawLimit) : 50
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new BadRequestException({ code: 'INVALID_LIMIT', message: 'Limit must be between 1 and 100' })
    return { data: await this.jobs.list(user.id, limit, cursor) }
  }

  @Get(':id')
  async get(@CurrentUser() user: User, @Param('id') id: string): Promise<ApiResponse<BackgroundJobDto>> {
    return { data: toBackgroundJobDto(await this.jobs.owned(user.id, id)) }
  }

  @Post('listening-audio')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async enqueueAudio(@CurrentUser() user: User, @Body() body: EnqueueAudioDto): Promise<ApiResponse<BackgroundJobDto>> {
    const row = await this.exercises.findForUser(user, 'LISTENING', body.exerciseId)
    if (!row || row.visibility !== 'PRACTICE')
      throw new BadRequestException({ code: 'EXERCISE_NOT_FOUND', message: 'Practice listening exercise not found' })
    const payload = row.payload as { title?: string }
    return { data: await this.jobs.enqueue(user, 'LISTENING_AUDIO', {
      targetId: body.exerciseId, title: payload.title ?? 'Listening audio',
      input: { exerciseId: body.exerciseId },
    }) }
  }

  @Post('exercise-generation')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async enqueueExercises(@CurrentUser() user: User, @Body() body: EnqueueExercisesDto): Promise<ApiResponse<BackgroundJobDto>> {
    if (!(await this.llm.hasConfig(user.id))) throw new BadRequestException({ code: 'LLM_UNAVAILABLE', message: 'Add an LLM API key in Settings → AI provider to generate exercises' })
    const pack = getLivePack(await resolveUserPackId(this.prisma, user.id))
    const unique = new Set(body.selections.map(item => `${item.skill}:${item.part}`))
    if (unique.size !== body.selections.length || body.selections.some(item =>
      !pack.structure.find(module => module.id === item.skill)?.parts.some(part => part.n === item.part && part.available !== false && part.adapter && part.runtime)
    )) throw new BadRequestException({ code: 'INVALID_PARTS', message: 'Select available exam parts without duplicates' })
    return { data: await this.jobs.enqueue(user, 'EXERCISE_GENERATION', {
      title: `${unique.size} exercises · ${pack.title}`, input: { selections: body.selections },
    }) }
  }

  @Post('mock-exam-set')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async enqueueMock(@CurrentUser() user: User, @Body() body: EnqueueMockDto): Promise<ApiResponse<BackgroundJobDto>> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const pack = getLivePack(packId)
    if (!pack.createMockSet) throw new BadRequestException({ code: 'MOCK_UNAVAILABLE', message: 'This pack has no mock exams' })
    const health = await Promise.all([this.llm.health(user.id), this.tts.health()])
    if (!health[0].data?.connected || !health[1].data?.ok)
      throw new BadRequestException({ code: 'MOCK_PREFLIGHT_FAILED', message: 'LLM and speech must be ready to generate a mock set' })
    const set = pack.createMockSet(body.setNumber, { reading: [], listening: [], writing: [], speaking: [] })
    if (!set) throw new BadRequestException({ code: 'MOCK_UNAVAILABLE', message: 'This pack has no mock exams' })
    const existing = await this.prisma.mockExamSet.findFirst({ where: { userId: user.id, packId, externalId: set.id } })
    if (existing) throw new ConflictException({ code: 'SET_EXISTS', message: 'This mock set already exists' })
    return { data: await this.jobs.enqueue(user, 'MOCK_EXAM_SET', {
      targetId: set.id, title: set.title, input: { setNumber: body.setNumber, setId: set.id },
    }) }
  }

  @Post('seen')
  async markSeen(@CurrentUser() user: User): Promise<ApiResponse<{ message: string }>> {
    await this.jobs.markSeen(user.id)
    return { data: { message: 'Notifications marked as read' } }
  }

  @Post(':id/cancel')
  async cancel(@CurrentUser() user: User, @Param('id') id: string): Promise<ApiResponse<BackgroundJobDto>> {
    return { data: await this.jobs.cancel(user.id, id) }
  }

  @Post(':id/retry')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async retry(@CurrentUser() user: User, @Param('id') id: string): Promise<ApiResponse<BackgroundJobDto>> {
    return { data: await this.jobs.retry(user.id, id) }
  }

  @Delete()
  async clearFinished(@CurrentUser() user: User, @Query('finished') finished?: string): Promise<ApiResponse<{ message: string }>> {
    if (finished !== 'true') throw new BadRequestException({ code: 'INVALID_QUERY', message: 'Specify finished=true' })
    await this.jobs.clearFinished(user.id)
    return { data: { message: 'Finished jobs cleared' } }
  }

  @Delete(':id')
  async dismiss(@CurrentUser() user: User, @Param('id') id: string): Promise<ApiResponse<{ message: string }>> {
    await this.jobs.dismiss(user.id, id)
    return { data: { message: 'Job dismissed' } }
  }
}
