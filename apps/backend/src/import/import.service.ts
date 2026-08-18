import { BadRequestException, Injectable } from '@nestjs/common'
import type {
  PracticeImportCounts,
  PracticeImportDomain,
  PracticeImportResultDto,
  Skill,
} from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { AttemptsService } from '../attempts/attempts.service'
import { DraftsService } from '../drafts/drafts.service'
import { ExercisesService } from '../exercises/exercises.service'
import { GenerationJobsService } from '../generation-jobs/generation-jobs.service'
import { MockExamService } from '../mock-exam/mock-exam.service'
import { payloadId } from '../common/json'

const DOMAINS: PracticeImportDomain[] = [
  'reading',
  'writing',
  'listening',
  'speaking',
  'mock-exam',
]

const EMPTY_COUNTS: PracticeImportCounts = {
  exercises: 0,
  attempts: 0,
  drafts: 0,
  generationJobs: 0,
  mockSets: 0,
  mockAttempts: 0,
}

const MAX_ENTRIES_CHARS = 4_000_000

@Injectable()
export class ImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exercises: ExercisesService,
    private readonly attempts: AttemptsService,
    private readonly drafts: DraftsService,
    private readonly generationJobs: GenerationJobsService,
    private readonly mockExam: MockExamService
  ) {}

  parseDomain(value: string): PracticeImportDomain {
    if ((DOMAINS as string[]).includes(value)) return value as PracticeImportDomain
    throw new BadRequestException({ code: 'UNKNOWN_DOMAIN', message: `Unknown import domain: ${value}` })
  }

  async status(user: User): Promise<{ migratedDomains: PracticeImportDomain[] }> {
    const fresh = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    return {
      migratedDomains: (fresh.migratedDomains ?? []).filter((item): item is PracticeImportDomain =>
        (DOMAINS as string[]).includes(item)
      ),
    }
  }

  async skip(user: User, domain: PracticeImportDomain): Promise<PracticeImportResultDto> {
    await this.markMigrated(user.id, domain)
    return { domain, skipped: true, imported: { ...EMPTY_COUNTS } }
  }

  async import(
    user: User,
    domain: PracticeImportDomain,
    entries: Record<string, unknown>
  ): Promise<PracticeImportResultDto> {
    const size = JSON.stringify(entries).length
    if (size > MAX_ENTRIES_CHARS) {
      throw new BadRequestException({
        code: 'IMPORT_TOO_LARGE',
        message: 'Import payload is too large',
      })
    }

    const current = await this.status(user)
    if (current.migratedDomains.includes(domain)) {
      return { domain, skipped: true, imported: { ...EMPTY_COUNTS } }
    }

    const imported = { ...EMPTY_COUNTS }
    if (domain === 'reading') await this.importReading(user, entries, imported)
    if (domain === 'writing') await this.importWriting(user, entries, imported)
    if (domain === 'listening') await this.importListening(user, entries, imported)
    if (domain === 'speaking') await this.importSpeaking(user, entries, imported)
    if (domain === 'mock-exam') await this.importMock(user, entries, imported)

    await this.markMigrated(user.id, domain)
    return { domain, skipped: false, imported }
  }

  private async markMigrated(userId: string, domain: PracticeImportDomain): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
    if (user.migratedDomains.includes(domain)) return
    await this.prisma.user.update({
      where: { id: userId },
      data: { migratedDomains: { set: [...user.migratedDomains, domain] } },
    })
  }

  private firstEntry(entries: Record<string, unknown>, keys: string[]): unknown {
    for (const key of keys) {
      if (entries[key] !== undefined) return entries[key]
    }
    return undefined
  }

  private async seedIds(skill: Skill): Promise<Set<string>> {
    const rows = await this.prisma.exercise.findMany({
      where: { source: 'seed', skill },
      select: { externalId: true },
    })
    return new Set(rows.map(row => row.externalId))
  }

  private async importGeneratedExercises(
    user: User,
    skill: Skill,
    raw: unknown,
    imported: PracticeImportCounts
  ): Promise<void> {
    if (!Array.isArray(raw)) return
    const seeds = await this.seedIds(skill)
    for (const item of raw) {
      const id = payloadId(item)
      if (!id || seeds.has(id)) continue
      await this.exercises.create(user, skill, item)
      imported.exercises += 1
    }
  }

  private async importGeneration(
    user: User,
    skill: Skill,
    raw: unknown,
    imported: PracticeImportCounts
  ): Promise<void> {
    if (!raw || typeof raw !== 'object') return
    await this.generationJobs.upsert(user, skill, raw)
    imported.generationJobs += 1
  }

  private async importReading(
    user: User,
    entries: Record<string, unknown>,
    imported: PracticeImportCounts
  ): Promise<void> {
    await this.importGeneratedExercises(
      user,
      'READING',
      this.firstEntry(entries, ['exam-one:reading:texts', 'exame-one-reading-texts']),
      imported
    )

    const progress = this.firstEntry(entries, ['quiz-progress'])
    if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
      for (const [textId, value] of Object.entries(progress as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue
        const row = value as Record<string, unknown>
        await this.attempts.create(user, {
          skill: 'READING',
          exerciseExternalId: textId,
          answers: { imported: true, answers: row['answers'] ?? {} },
          result: {
            score: typeof row['score'] === 'number' ? row['score'] : null,
            maxScore: typeof row['totalQuestions'] === 'number' ? row['totalQuestions'] : null,
            percentage: typeof row['percentage'] === 'number' ? row['percentage'] : null,
            review: { progress: row },
          },
        })
        imported.attempts += 1
      }
    }

    const session = this.firstEntry(entries, ['quiz-session'])
    if (session && typeof session === 'object' && !Array.isArray(session)) {
      const textId = (session as { textId?: unknown }).textId
      if (typeof textId === 'string') {
        await this.drafts.upsert(user, 'READING', textId, session)
        imported.drafts += 1
      }
    }

    await this.importGeneration(
      user,
      'READING',
      this.firstEntry(entries, ['exam-one:reading:generation-state']),
      imported
    )
  }

  private async importWriting(
    user: User,
    entries: Record<string, unknown>,
    imported: PracticeImportCounts
  ): Promise<void> {
    await this.importGeneratedExercises(
      user,
      'WRITING',
      this.firstEntry(entries, ['exam-one:writing:topics', 'exame-one-writing-topics']),
      imported
    )

    const progress = this.firstEntry(entries, ['exam-one:writing:progress', 'writing-progress'])
    if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
      for (const [topicId, value] of Object.entries(progress as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue
        const row = value as { submissions?: unknown[]; completed?: boolean }
        const submissions = Array.isArray(row.submissions) ? row.submissions : []
        for (const submission of submissions) {
          if (!submission || typeof submission !== 'object') continue
          const sub = submission as Record<string, unknown>
          await this.attempts.create(user, {
            skill: 'WRITING',
            exerciseExternalId: topicId,
            answers: sub,
            result: {
              review: { writingProgress: row, submission: sub },
            },
          })
          imported.attempts += 1
        }
      }
    }

    const reviews = this.firstEntry(entries, ['exam-one:writing:reviews', 'writing-reviews'])
    if (reviews && typeof reviews === 'object' && !Array.isArray(reviews)) {
      for (const [topicId, value] of Object.entries(reviews as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue
        await this.attempts.upsertLatestResult(user, 'WRITING', topicId, {
          review: { writingReview: value },
        })
        imported.attempts += 1
      }
    }

    const models = this.firstEntry(entries, ['exam-one:writing:model-answers', 'model-answers'])
    if (models && typeof models === 'object' && !Array.isArray(models)) {
      for (const [topicId, value] of Object.entries(models as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue
        await this.attempts.create(user, {
          skill: 'WRITING',
          exerciseExternalId: topicId,
          answers: { kind: 'model-answer' },
          result: { review: { modelAnswer: value } },
        })
        imported.attempts += 1
      }
    }

    for (const [key, value] of Object.entries(entries)) {
      const match =
        key.match(/^exam-one:writing:session:(.+)$/) ?? key.match(/^writing-session-(.+)$/)
      if (!match?.[1] || value == null) continue
      await this.drafts.upsert(user, 'WRITING', match[1], value)
      imported.drafts += 1
    }

    await this.importGeneration(
      user,
      'WRITING',
      this.firstEntry(entries, [
        'exam-one:writing:topic-generation-state',
        'exame-one-topic-generation-state',
      ]),
      imported
    )
  }

  private async importListening(
    user: User,
    entries: Record<string, unknown>,
    imported: PracticeImportCounts
  ): Promise<void> {
    await this.importGeneratedExercises(
      user,
      'LISTENING',
      this.firstEntry(entries, ['exam-one:listening:exercises']),
      imported
    )

    const overrides = this.firstEntry(entries, ['exam-one:listening:audio-overrides'])
    if (overrides && typeof overrides === 'object' && !Array.isArray(overrides)) {
      for (const [id, audio] of Object.entries(overrides as Record<string, unknown>)) {
        await this.exercises.updateAudio(user, id, audio)
      }
    }

    const progress = this.firstEntry(entries, ['exam-one:listening:progress'])
    if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
      for (const [textId, value] of Object.entries(progress as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue
        const row = value as Record<string, unknown>
        await this.attempts.create(user, {
          skill: 'LISTENING',
          exerciseExternalId: textId,
          answers: { imported: true },
          result: {
            score: typeof row['score'] === 'number' ? row['score'] : null,
            maxScore: typeof row['totalQuestions'] === 'number' ? row['totalQuestions'] : null,
            percentage: typeof row['percentage'] === 'number' ? row['percentage'] : null,
            review: { progress: row },
          },
        })
        imported.attempts += 1
      }
    }

    await this.importGeneration(
      user,
      'LISTENING',
      this.firstEntry(entries, ['exam-one:listening:generation-state']),
      imported
    )
  }

  private async importSpeaking(
    user: User,
    entries: Record<string, unknown>,
    imported: PracticeImportCounts
  ): Promise<void> {
    await this.importGeneratedExercises(
      user,
      'SPEAKING',
      this.firstEntry(entries, ['exam-one:speaking:exercises']),
      imported
    )

    const progress = this.firstEntry(entries, ['exam-one:speaking:progress'])
    if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
      for (const [topicId, value] of Object.entries(progress as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue
        const row = value as { attempts?: unknown[] }
        const speakingAttempts = Array.isArray(row.attempts) ? row.attempts : [value]
        for (const attempt of speakingAttempts) {
          if (!attempt || typeof attempt !== 'object') continue
          await this.attempts.create(user, {
            skill: 'SPEAKING',
            exerciseExternalId: topicId,
            answers: attempt as Record<string, unknown>,
            result: { review: attempt },
          })
          imported.attempts += 1
        }
      }
    }

    await this.importGeneration(
      user,
      'SPEAKING',
      this.firstEntry(entries, ['exam-one:speaking:generation-state']),
      imported
    )
  }

  private async importMock(
    user: User,
    entries: Record<string, unknown>,
    imported: PracticeImportCounts
  ): Promise<void> {
    const sets = this.firstEntry(entries, ['exam-one:mock-exam:sets'])
    if (Array.isArray(sets)) {
      for (const set of sets) {
        if (!set || typeof set !== 'object') continue
        const row = set as {
          id?: string
          examId?: string
          level?: string
          title?: string
          generated?: boolean
          createdAt?: string
          modules?: unknown
          content?: unknown
        }
        if (!row.id || !row.content || !row.modules) continue
        await this.mockExam.createSet(user, {
          id: row.id,
          examId: row.examId ?? 'goethe-a2',
          level: row.level ?? 'A2',
          title: row.title ?? row.id,
          generated: true,
          createdAt: row.createdAt ?? new Date().toISOString(),
          modules: row.modules,
          content: row.content as Record<string, unknown>,
        })
        imported.mockSets += 1
      }
    }

    for (const [key, value] of Object.entries(entries)) {
      const match = key.match(/^exam-one:mock-exam:(.+)$/)
      if (!match?.[1] || match[1] === 'sets' || match[1] === 'generation-state') continue
      if (!value || typeof value !== 'object') continue
      await this.mockExam.upsertAttempt(user, match[1], value)
      imported.mockAttempts += 1
    }

    const generation = this.firstEntry(entries, ['exam-one:mock-exam:generation-state'])
    if (generation && typeof generation === 'object') {
      await this.generationJobs.upsert(user, 'MOCK', generation)
      imported.generationJobs += 1
    }
  }
}
