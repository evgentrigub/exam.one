import { Injectable, NotFoundException } from '@nestjs/common'
import type { AttemptDto, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { asJson } from '../common/json'
import { toAttemptDto } from '../common/mappers/practice.mapper'
import { ExercisesService } from '../exercises/exercises.service'
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

  async list(user: User, skill: Skill): Promise<AttemptDto[]> {
    const rows = await this.prisma.attempt.findMany({
      where: { userId: user.id, skill },
      include: { result: true, exercise: true },
      orderBy: { submittedAt: 'asc' },
    })
    return rows.map(toAttemptDto)
  }

  async create(user: User, dto: CreateAttemptDto): Promise<AttemptDto> {
    const exercise = dto.exerciseExternalId
      ? await this.exercises.findForUser(user, dto.skill, dto.exerciseExternalId)
      : null

    const created = await this.prisma.attempt.create({
      data: {
        userId: user.id,
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
