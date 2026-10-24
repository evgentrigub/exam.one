import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { Job, UnrecoverableError } from 'bullmq'
import { packContext } from '../../core/interceptors/pack-context.interceptor'
import { ExercisesService } from '../../practice/exercises.service'
import { TtsService } from '../../speech/tts/tts.service'
import { BackgroundJobsService } from '../background-jobs.service'
import { QUEUE_NAMES } from '../queues'

@Processor(QUEUE_NAMES.LISTENING_AUDIO, { concurrency: 1 })
@Injectable()
export class ListeningAudioProcessor extends WorkerHost {
  constructor(
    private readonly jobs: BackgroundJobsService,
    private readonly prisma: PrismaService,
    private readonly exercises: ExercisesService,
    private readonly tts: TtsService
  ) { super() }

  async process(job: Job<{ jobRowId: string; attempt: number; exercise?: unknown }, unknown, string>): Promise<unknown> {
    const { jobRowId, attempt } = job.data
    const row = await this.jobs.markRunning(jobRowId, attempt)
    if (!row) return null
    const user = await this.prisma.user.findUnique({ where: { id: row.userId } })
    if (!user) throw await this.jobs.abort(row, 'User no longer exists')
    const controller = new AbortController()
    const watchdog = setInterval(() => {
      void this.jobs.get(row.id).then(current => {
        if (!current || current.attempt !== attempt || current.status !== 'RUNNING') controller.abort()
      }).catch(() => undefined)
    }, 1000)
    try {
      return await packContext.run({ packId: row.packId, userId: user.id }, async () => {
        const input = row.input as { exerciseId?: string }
        const exercise = job.name === 'mock-audio'
          ? job.data.exercise
          : input.exerciseId
            ? (await this.exercises.findForUser(user, 'LISTENING', input.exerciseId))?.payload
            : null
        if (!exercise) throw new UnrecoverableError('Listening exercise is unavailable')
        const response = await this.tts.generatePackAudio(exercise, async (done, total) => {
          controller.signal.throwIfAborted()
          await job.updateProgress(Math.round(done / total * 100))
          if (job.name !== 'mock-audio') {
            await this.jobs.progress(row.id, attempt, { stage: 1, stagePercent: done / total * 100 })
          }
        }, controller.signal)
        if (response.error || !response.data) throw new Error(response.error || 'Audio generation failed')
        controller.signal.throwIfAborted()
        if (job.name === 'mock-audio') return response.data.audio
        if (!input.exerciseId) throw new UnrecoverableError('Missing listening exercise ID')
        await this.jobs.progress(row.id, attempt, { stage: 2, stagePercent: 10 })
        await this.exercises.updateAudio(user, input.exerciseId, response.data.audio)
        if (!(await this.jobs.complete(row.id, attempt, { exerciseId: input.exerciseId }))) return null
        return response.data.audio
      })
    } catch (error) {
      if (error instanceof UnrecoverableError || job.attemptsMade + 1 >= (job.opts.attempts ?? 1) || controller.signal.aborted) {
        await this.jobs.fail(row.id, attempt, error instanceof Error ? error.message : 'Audio generation failed')
      }
      throw error
    } finally {
      clearInterval(watchdog)
    }
  }
}
