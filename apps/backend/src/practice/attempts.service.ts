import {
  getPack,
  objectiveScore,
  validateReview,
  type RuntimeSnapshot,
  type SkillId,
} from '@exam-one/exam-packs'
import { resolveUserPackId } from '../core/context/active-pack'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { AttemptDto, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { asJson } from '../common/json'
import { toAttemptDto } from '../common/mappers/practice.mapper'
import { ExercisesService } from './exercises.service'
import type { AttemptResultDto, CreateAttemptDto, PatchAttemptDto } from './dto/attempts.dto'

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exercises: ExercisesService
  ) {}

  count(): Promise<number> {
    return this.prisma.attempt.count()
  }

  async list(user: User, skill: Skill, history = false): Promise<AttemptDto[]> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const rows = await this.prisma.attempt.findMany({
      where: { userId: user.id, skill, ...(history ? {} : { packId }) },
      include: { result: true, exercise: true },
      orderBy: { submittedAt: 'asc' },
    })
    return rows.map(toAttemptDto)
  }

  async detail(user: User, id: string): Promise<AttemptDto> {
    const row = await this.prisma.attempt.findFirst({
      where: { id, userId: user.id },
      include: { result: true, exercise: true },
    })
    if (!row)
      throw new NotFoundException({ code: 'ATTEMPT_NOT_FOUND', message: 'Attempt not found' })
    return toAttemptDto(row)
  }

  async create(user: User, dto: CreateAttemptDto): Promise<AttemptDto> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const exercise = dto.exerciseExternalId
      ? await this.exercises.findForUser(user, dto.skill, dto.exerciseExternalId)
      : null

    if (dto.exerciseExternalId && !exercise)
      throw new NotFoundException({
        code: 'EXERCISE_NOT_FOUND',
        message: 'Exercise not found in this pack',
      })
    const payload = exercise?.payload as Record<string, unknown> | undefined
    const skill = dto.skill.toLowerCase() as SkillId
    const part = getPack(packId)
      ?.structure.find(m => m.id === skill)
      ?.parts.find(p => p.n === payload?.['testingPart'])
    const view = part?.adapter && payload ? part.adapter.project(payload) : undefined
    const compatibility = getPack(packId)?.compatibility
    const snapshot =
      view && part?.runtime
        ? {
            version: 1,
            packId,
            skill,
            part: part.n,
            view,
            rules: part.runtime,
            ...(compatibility ? { compatibility, payload } : {}),
          }
        : { version: 0, packId, payload: payload ?? null }
    if (!getPack(packId)?.compatibility && snapshot.version === 1)
      dto.result = this.checkedResult(snapshot as RuntimeSnapshot, dto.answers, dto.result)
    if (snapshot.version === 1) this.validateStoredReview(snapshot as RuntimeSnapshot, dto.result)
    if (
      compatibility &&
      view?.questions &&
      part?.runtime &&
      dto.answers['responses'] &&
      typeof dto.answers['responses'] === 'object'
    ) {
      dto.result = {
        ...dto.result,
        ...objectiveScore(view, part.runtime, dto.answers['responses'] as Record<string, unknown>),
      }
    }
    const created = await this.prisma.attempt.create({
      data: {
        userId: user.id,
        packId,
        snapshot: asJson(snapshot),
        skill: dto.skill,
        exerciseId: exercise?.id ?? null,
        answers: asJson(dto.answers),
        ...(dto.result
          ? {
              result: {
                create: {
                  score: dto.result.score ?? null,
                  maxScore: dto.result.maxScore ?? null,
                  percentage: dto.result.percentage ?? null,
                  ...(dto.result.review !== undefined ? { review: asJson(dto.result.review) } : {}),
                },
              },
            }
          : {}),
      },
      include: { result: true, exercise: true },
    })
    return toAttemptDto(created)
  }

  async patch(user: User, id: string, dto: PatchAttemptDto): Promise<AttemptDto> {
    const existing = await this.prisma.attempt.findFirst({
      where: { id, userId: user.id },
      include: { result: true },
    })
    if (!existing) {
      throw new NotFoundException({ code: 'ATTEMPT_NOT_FOUND', message: 'Attempt not found' })
    }

    if (!getPack(existing.packId)?.live)
      throw new NotFoundException({
        code: 'PACK_UNAVAILABLE',
        message: 'Historical attempts are read-only',
      })
    if (existing.packId !== (await resolveUserPackId(this.prisma, user.id)))
      throw new NotFoundException({
        code: 'ATTEMPT_NOT_FOUND',
        message: 'Attempt not found in this pack',
      })
    const snapshot = existing.snapshot as unknown as RuntimeSnapshot | null
    if (snapshot?.version === 1) this.validateStoredReview(snapshot, dto.result)
    if (snapshot?.version === 1 && !snapshot.compatibility) {
      dto.result = this.checkedResult(
        snapshot,
        dto.answers ?? (existing.answers as Record<string, unknown>),
        dto.result
      )
    }
    if (snapshot?.version === 1 && snapshot.compatibility && snapshot.view.questions) {
      const answers = dto.answers ?? (existing.answers as Record<string, unknown>)
      if (answers['responses'] && typeof answers['responses'] === 'object')
        dto.result = {
          ...dto.result,
          ...objectiveScore(
            snapshot.view,
            snapshot.rules,
            answers['responses'] as Record<string, unknown>
          ),
        }
    }
    const updated = await this.prisma.attempt.update({
      where: { id },
      data: {
        ...(dto.answers !== undefined ? { answers: asJson(dto.answers) } : {}),
        ...(dto.result
          ? {
              result: existing.result
                ? {
                    update: {
                      score: dto.result.score ?? existing.result.score,
                      maxScore: dto.result.maxScore ?? existing.result.maxScore,
                      percentage: dto.result.percentage ?? existing.result.percentage,
                      ...(dto.result.review !== undefined
                        ? { review: asJson(dto.result.review) }
                        : {}),
                    },
                  }
                : {
                    create: {
                      score: dto.result.score ?? null,
                      maxScore: dto.result.maxScore ?? null,
                      percentage: dto.result.percentage ?? null,
                      ...(dto.result.review !== undefined
                        ? { review: asJson(dto.result.review) }
                        : {}),
                    },
                  },
            }
          : {}),
      },
      include: { result: true, exercise: true },
    })
    return toAttemptDto(updated)
  }

  private checkedResult(
    snapshot: RuntimeSnapshot,
    answers: Record<string, unknown>,
    result?: AttemptResultDto
  ): AttemptResultDto {
    if (snapshot.view.questions)
      return { ...result, ...objectiveScore(snapshot.view, snapshot.rules, answers) }
    if (result?.review === undefined) {
      if (result?.score != null || result?.maxScore != null)
        throw new BadRequestException({
          code: 'INVALID_REVIEW',
          message: 'A validated criterion review is required for this score',
        })
      return result ?? {}
    }
    try {
      const review = validateReview(result.review, snapshot.rules)
      if (
        snapshot.rules.fields?.some(
          field =>
            field.zeroBelowWords !== undefined &&
            String(answers[field.id] ?? '')
              .trim()
              .split(/\s+/)
              .filter(Boolean).length < field.zeroBelowWords
        )
      ) {
        review.totalPoints = 0
        review.criteria = review.criteria.map(criterion => ({ ...criterion, points: 0 }))
      }
      const multiplier = snapshot.rules.multiplier ?? 1
      return {
        review,
        score: review.totalPoints * multiplier,
        maxScore: review.maxPoints * multiplier,
        percentage: review.maxPoints
          ? Math.round((review.totalPoints / review.maxPoints) * 100)
          : 0,
      }
    } catch (error) {
      throw new BadRequestException({
        code: 'INVALID_REVIEW',
        message: error instanceof Error ? error.message : 'Invalid review',
      })
    }
  }

  private validateStoredReview(snapshot: RuntimeSnapshot, result?: AttemptResultDto): void {
    if (result?.review === undefined) return
    const adapter = getPack(snapshot.packId)
      ?.structure.find(module => module.id === snapshot.skill)
      ?.parts.find(part => part.n === snapshot.part)?.adapter
    try {
      adapter?.validateStoredReview?.(result.review, snapshot.rules)
    } catch (error) {
      throw new BadRequestException({
        code: 'INVALID_REVIEW',
        message: error instanceof Error ? error.message : 'Invalid saved review',
      })
    }
  }

  async upsertLatestResult(
    user: User,
    skill: Skill,
    exerciseExternalId: string,
    result: AttemptResultDto,
    answers?: Record<string, unknown>
  ): Promise<AttemptDto> {
    const listed = await this.list(user, skill)
    const latest = [...listed].reverse().find(row => row.exerciseExternalId === exerciseExternalId)
    if (latest) {
      return this.patch(user, latest.id, {
        result,
        ...(answers !== undefined ? { answers } : {}),
      })
    }
    return this.create(user, {
      skill,
      exerciseExternalId,
      answers: answers ?? { kind: 'artifact' },
      result,
    })
  }
}
