import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { Job, UnrecoverableError } from 'bullmq'
import type { SkillId } from '@exam-one/exam-packs'
import { packContext } from '../../core/interceptors/pack-context.interceptor'
import { ExercisesService } from '../../practice/exercises.service'
import { PackAiService } from '../../ai/pack-ai.service'
import { BackgroundJobsService } from '../background-jobs.service'
import { QUEUE_NAMES } from '../queues'

type Selection = { skill: SkillId; part: number }
type Checkpoint = Record<string, { payload?: unknown; externalId?: string }>

@Processor(QUEUE_NAMES.EXERCISE_GENERATION, { concurrency: 2 })
@Injectable()
export class ExerciseGenerationProcessor extends WorkerHost {
  constructor(
    private readonly jobs: BackgroundJobsService,
    private readonly prisma: PrismaService,
    private readonly exercises: ExercisesService,
    private readonly ai: PackAiService
  ) { super() }

  async process(job: Job<{ jobRowId: string; attempt: number }>): Promise<unknown> {
    const { jobRowId, attempt } = job.data
    const row = await this.jobs.markRunning(jobRowId, attempt)
    if (!row) return null
    const user = await this.prisma.user.findUnique({ where: { id: row.userId } })
    if (!user) throw await this.jobs.abort(row, 'User no longer exists')
    const { selections } = row.input as { selections: Selection[] }
    const checkpoint: Checkpoint = { ...row.checkpoint as Checkpoint }
    const items = () => selections.map(s => ({ label: `${s.skill}:${s.part}`, done: Boolean(checkpoint[`${s.skill}:${s.part}`]?.externalId) }))
    try {
      return await packContext.run({ packId: row.packId, userId: row.userId }, async () => {
        const resumed = selections.filter(s => checkpoint[`${s.skill}:${s.part}`]?.externalId).length
        await this.jobs.progress(row.id, attempt, { stage: 1, stagePercent: resumed / selections.length * 100, items: items() })
        for (let index = 0; index < selections.length; index += 1) {
          const selection = selections[index]!
          const key = `${selection.skill}:${selection.part}`
          const latest = await this.jobs.get(row.id)
          if (latest?.attempt !== attempt || latest.status !== 'RUNNING')
            throw new UnrecoverableError('Generation cancelled')
          const entry = checkpoint[key] ?? {}
          if (!entry.payload) {
            const generated = await this.ai.generate(selection.skill, [selection.part], 1)
            if (generated.error || !generated.data?.[0]) throw new Error(generated.error || 'No exercise returned')
            entry.payload = generated.data[0]
            checkpoint[key] = entry
            if (!await this.jobs.progress(row.id, attempt, {
              stage: 1, stagePercent: index / selections.length * 100, items: items(),
            }, checkpoint)) throw new UnrecoverableError('Generation cancelled')
          }
          if (!entry.externalId) {
            const saved = await this.exercises.create(user, selection.skill.toUpperCase() as 'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING', entry.payload)
            entry.externalId = saved.externalId
          }
          if (!await this.jobs.progress(row.id, attempt, {
            stage: 1, stagePercent: (index + 1) / selections.length * 100, items: items(),
          }, checkpoint)) throw new UnrecoverableError('Generation cancelled')
        }
        await this.jobs.complete(row.id, attempt, { exerciseIds: Object.values(checkpoint).map(entry => entry.externalId) })
        return checkpoint
      })
    } catch (error) {
      if (error instanceof UnrecoverableError || job.attemptsMade + 1 >= (job.opts.attempts ?? 1))
        await this.jobs.fail(row.id, attempt, error instanceof Error ? error.message : 'Exercise generation failed')
      throw error
    }
  }
}
