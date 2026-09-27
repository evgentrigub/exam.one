import {
  getPack,
  objectiveScore,
  resolveAnswers,
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

/** A bare rubric, as opposed to one of the wrappers the AI screens persist around it. */
function isCriterionReview(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const review = value as Record<string, unknown>
  return (
    Array.isArray(review['criteria']) &&
    typeof review['totalPoints'] === 'number' &&
    typeof review['maxPoints'] === 'number'
  )
}

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
    const snapshot =
      view && part?.runtime
        ? { version: 1, packId, skill, part: part.n, view, rules: part.runtime }
        : { version: 0, packId, payload: payload ?? null }
    if (snapshot.version === 1) {
      const scored = this.checkedResult(snapshot as RuntimeSnapshot, dto.answers, dto.result)
      if (scored) dto.result = scored
      else delete dto.result
    }
    if (snapshot.version === 1) this.validateStoredReview(snapshot as RuntimeSnapshot, dto.result)
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
    // Old rows carry `compatibility` in their snapshot; `resolveAnswers` reads their nested
    // answer shape, so they score identically through the one remaining path.
    if (snapshot?.version === 1) {
      const scored = this.checkedResult(
        snapshot,
        dto.answers ?? (existing.answers as Record<string, unknown>),
        dto.result
      )
      if (scored) dto.result = scored
      else delete dto.result
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
  ): AttemptResultDto | undefined {
    // The client stores a submission record, not a flat answer map, so both scoring and the
    // word-count rule below read through the resolver rather than the raw object.
    const resolved = resolveAnswers(snapshot.view, answers)
    if (snapshot.view.questions)
      return { ...result, ...objectiveScore(snapshot.view, snapshot.rules, resolved) }
    if (result?.review === undefined) {
      if (result?.score != null || result?.maxScore != null)
        throw new BadRequestException({
          code: 'INVALID_REVIEW',
          message: 'A validated criterion review is required for this score',
        })
      // `{}` would be truthy and create an empty Result row for every ungraded submission.
      return result
    }
    // Only a bare rubric carries a score. The AI screens persist their own wrappers — a
    // writing review record, a speaking attempt, a model answer — which `validateStoredReview`
    // already checks through the pack adapter; re-validating them here would reject them all.
    if (!isCriterionReview(result.review)) return result
    try {
      const review = validateReview(result.review, snapshot.rules)
      if (
        snapshot.rules.fields?.some(
          field =>
            field.zeroBelowWords !== undefined &&
            String(resolved[field.id] ?? '')
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
}
