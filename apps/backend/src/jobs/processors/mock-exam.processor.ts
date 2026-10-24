import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { getAvailableExamParts, getLivePack, type SkillId } from '@exam-one/exam-packs'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { Job, UnrecoverableError } from 'bullmq'
import { PackAiService } from '../../ai/pack-ai.service'
import { EmailService } from '../../core/email/email.service'
import { packContext } from '../../core/interceptors/pack-context.interceptor'
import { MockExamService } from '../../mock-exam/mock-exam.service'
import type { MockExamSetBodyDto } from '../../mock-exam/dto/mock-exam.dto'
import { BackgroundJobsService } from '../background-jobs.service'
import { JOB_OPTIONS, QUEUE_NAMES } from '../queues'

type MockContent = Record<SkillId, Record<string, unknown>[]>
type MockCheckpoint = { content: MockContent; done: string[] }
const SKILLS: SkillId[] = ['reading', 'listening', 'writing', 'speaking']

@Processor(QUEUE_NAMES.MOCK_EXAM_SET, { concurrency: 1 })
@Injectable()
export class MockExamProcessor extends WorkerHost {
  constructor(
    private readonly jobs: BackgroundJobsService,
    private readonly prisma: PrismaService,
    private readonly ai: PackAiService,
    private readonly mock: MockExamService,
    private readonly email: EmailService
  ) { super() }

  async process(job: Job<{ jobRowId: string; attempt: number }>): Promise<unknown> {
    const { jobRowId, attempt } = job.data
    const row = await this.jobs.markRunning(jobRowId, attempt)
    if (!row) return null
    const user = await this.prisma.user.findUnique({ where: { id: row.userId } })
    if (!user) throw await this.jobs.abort(row, 'User no longer exists')
    let pack: ReturnType<typeof getLivePack>
    try { pack = getLivePack(row.packId) } catch { throw await this.jobs.abort(row, 'This exam pack is no longer available') }
    const { setNumber, setId } = row.input as { setNumber: number; setId: string }
    if (!pack.createMockSet) throw await this.jobs.abort(row, 'Mock exams are unavailable for this pack')
    const saved = row.checkpoint as Partial<MockCheckpoint>
    const checkpoint: MockCheckpoint = {
      content: {
        reading: saved.content?.reading ?? [], listening: saved.content?.listening ?? [],
        writing: saved.content?.writing ?? [], speaking: saved.content?.speaking ?? [],
      },
      done: saved.done ?? [],
    }
    const parts = SKILLS.flatMap(skill => getAvailableExamParts(pack, skill).map(part => ({ skill, part: part.n })))
    const audioParts = parts.filter(item => item.skill === 'listening')
    const items = () => SKILLS.map(skill => ({
      label: skill, done: parts.filter(part => part.skill === skill).every(part =>
        checkpoint.done.includes(`${skill}:${part.part}`) && (skill !== 'listening' || checkpoint.done.includes(`audio:${part.part}`))
      ),
    }))
    const assertRunning = async () => {
      const latest = await this.jobs.get(row.id)
      if (latest?.attempt !== attempt || latest.status !== 'RUNNING') throw new UnrecoverableError('Generation cancelled')
    }
    try {
      return await packContext.run({ packId: row.packId, userId: row.userId }, async () => {
        for (const [index, entry] of parts.entries()) {
          await assertRunning()
          const key = `${entry.skill}:${entry.part}`
          if (!checkpoint.done.includes(key)) {
            const response = await this.ai.generate(entry.skill, [entry.part], 1)
            if (response.error || !response.data?.[0]) throw new Error(response.error || 'Missing generated mock content')
            const exercise = { ...response.data[0] as Record<string, unknown>, examOnly: true }
            checkpoint.content[entry.skill] = [
              ...checkpoint.content[entry.skill].filter(item => item['testingPart'] !== entry.part), exercise,
            ]
            checkpoint.done.push(key)
          }
          if (!await this.jobs.progress(row.id, attempt, { stage: 1, stagePercent: (index + 1) / parts.length * 100, items: items() }, checkpoint))
            throw new UnrecoverableError('Generation cancelled')
        }

        for (const [index, entry] of audioParts.entries()) {
          await assertRunning()
          if (!checkpoint.done.includes(`audio:${entry.part}`)) {
            const exercise = checkpoint.content.listening.find(item => item['testingPart'] === entry.part)
            if (!exercise) throw new UnrecoverableError('Missing listening content')
            const queue = this.jobs.queue('LISTENING_AUDIO')
            const audio = await queue.add('mock-audio', { jobRowId, attempt, exercise }, {
              ...JOB_OPTIONS, jobId: `${row.id}-${attempt}-audio-${entry.part}`,
            })
            while (true) {
              await assertRunning()
              const state = await audio.getState()
              if (state === 'completed') {
                // `audio` is a snapshot from add(); the return value only exists on a fresh read.
                const finished = await queue.getJob(audio.id!)
                const audioMap = finished?.returnvalue as Record<string, unknown> | undefined
                if (!audioMap) throw new Error('Mock audio result is missing')
                checkpoint.content.listening = checkpoint.content.listening.map(item =>
                  item['testingPart'] === entry.part ? { ...item, audio: audioMap } : item
                )
                checkpoint.done.push(`audio:${entry.part}`)
                break
              }
              if (state === 'failed') throw new Error(audio.failedReason || 'Mock audio generation failed')
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
          if (!await this.jobs.progress(row.id, attempt, { stage: 2, stagePercent: (index + 1) / audioParts.length * 100, items: items() }, checkpoint))
            throw new UnrecoverableError('Generation cancelled')
        }

        await assertRunning()
        const set = pack.createMockSet!(setNumber, checkpoint.content as unknown as Parameters<NonNullable<typeof pack.createMockSet>>[1])
        if (!set || set.id !== setId) throw new UnrecoverableError('Mock set identity changed')
        const existing = await this.prisma.mockExamSet.findFirst({ where: { userId: user.id, packId: row.packId, externalId: setId } })
        if (existing && existing.content && JSON.stringify(existing.content) !== JSON.stringify(set.content))
          throw new UnrecoverableError('A different mock set already exists with this ID')
        await this.jobs.progress(row.id, attempt, { stage: 3, stagePercent: 50, items: items() }, checkpoint)
        await this.mock.createSet(user, set as unknown as MockExamSetBodyDto)
        if (await this.jobs.complete(row.id, attempt, { setId })) {
          const setting = await this.prisma.setting.findUnique({ where: { userId: user.id } })
          if (setting?.notifyMockReadyEmail && this.email.isConfigured()) {
            const claimed = await this.prisma.backgroundJob.updateMany({
              where: { id: row.id, status: 'COMPLETED', emailAttemptedAt: null },
              data: { emailAttemptedAt: new Date() },
            })
            if (claimed.count) await this.email.sendMail({
              to: user.email, subject: 'Your mock exam set is ready',
              text: `Your ${pack.title} mock exam set is ready. Open exam.one and select ${pack.title} to start it.`,
            }).catch(() => undefined)
          }
        }
        return { setId }
      })
    } catch (error) {
      if (error instanceof UnrecoverableError || job.attemptsMade + 1 >= (job.opts.attempts ?? 1))
        await this.jobs.fail(row.id, attempt, error instanceof Error ? error.message : 'Mock generation failed')
      throw error
    }
  }
}
