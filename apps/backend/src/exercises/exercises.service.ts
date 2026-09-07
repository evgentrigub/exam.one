import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { ExerciseDto, Skill } from '@exam-one/contracts'
import type { Exercise, User } from '@exam-one/database'
import { getLivePack, record, validateView } from '@exam-one/exam-packs'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { resolveUserPackId } from '../common/active-pack'
import { asJson, payloadId } from '../common/json'
import { toExerciseDto } from '../common/mappers/practice.mapper'

function examLevelOf(cefr: string): string { return cefr }

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.exercise.count()
  }

  async list(user: User, skill: Skill): Promise<ExerciseDto[]> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const rows = await this.prisma.exercise.findMany({
      where: {
        skill,
        packId,
        OR: [{ source: 'seed' }, { userId: user.id }],
      },
      orderBy: { createdAt: 'asc' },
    })
    const byExternalId = new Map<string, ExerciseDto>()
    for (const row of rows) {
      if (row.source === 'seed' && !byExternalId.has(row.externalId)) {
        byExternalId.set(row.externalId, toExerciseDto(row))
      }
    }
    for (const row of rows) {
      if (row.userId === user.id) {
        byExternalId.set(row.externalId, toExerciseDto(row))
      }
    }
    return [...byExternalId.values()]
  }

  async findForUser(user: User, skill: Skill, externalId: string): Promise<Exercise | null> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const owned = await this.prisma.exercise.findFirst({
      where: { userId: user.id, skill, packId, externalId },
    })
    if (owned) return owned
    return this.prisma.exercise.findFirst({
      where: { source: 'seed', skill, packId, externalId },
    })
  }

  async create(user: User, skill: Skill, payload: unknown): Promise<ExerciseDto> {
    const externalId = payloadId(payload)
    if (!externalId) {
      throw new BadRequestException({
        code: 'INVALID_PAYLOAD',
        message: 'Exercise payload must include an id',
      })
    }

    const packId = await resolveUserPackId(this.prisma, user.id)
    const pack = getLivePack(packId)
    const level = examLevelOf(pack.cefr)
    if (!pack.compatibility) {
      try {
        const partNumber = record(payload)['testingPart']
        const part = pack.structure.find(module => module.id === skill.toLowerCase())?.parts.find(part => part.n === partNumber && part.available !== false)
        if (!part?.adapter || !part.runtime) throw new Error(`Unknown ${skill} part ${String(partNumber)}`)
        validateView(part.adapter.project(payload), part.runtime)
      } catch (error) {
        throw new BadRequestException({ code: 'INVALID_PAYLOAD', message: error instanceof Error ? error.message : 'Invalid exercise payload' })
      }
    }

    const existing = await this.prisma.exercise.findFirst({
      where: { userId: user.id, skill, packId, externalId },
    })
    if (existing) {
      const updated = await this.prisma.exercise.update({
        where: { id: existing.id },
        data: { payload: asJson(payload) },
      })
      return toExerciseDto(updated)
    }

    const seed = await this.prisma.exercise.findFirst({
      where: { source: 'seed', skill, packId, externalId },
    })
    if (seed) {
      throw new BadRequestException({
        code: 'SEED_ID',
        message: 'Cannot overwrite bundled seed content',
      })
    }

    const created = await this.prisma.exercise.create({
      data: {
        userId: user.id,
        packId,
        skill,
        level,
        source: 'generated',
        visibility: 'PRACTICE',
        externalId,
        payload: asJson(payload),
      },
    })
    return toExerciseDto(created)
  }

  async createMany(user: User, skill: Skill, payloads: unknown[]): Promise<ExerciseDto[]> {
    const created: ExerciseDto[] = []
    for (const payload of payloads) {
      created.push(await this.create(user, skill, payload))
    }
    return created
  }

  async updateAudio(user: User, externalId: string, audio: unknown): Promise<ExerciseDto> {
    const row = await this.findForUser(user, 'LISTENING', externalId)
    if (!row) {
      throw new NotFoundException({ code: 'EXERCISE_NOT_FOUND', message: 'Exercise not found' })
    }

    const payload =
      row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)
        ? { ...(row.payload as Record<string, unknown>), audio }
        : { audio }

    if (row.source === 'seed') {
      const owned = await this.prisma.exercise.findFirst({
        where: { userId: user.id, skill: 'LISTENING', packId: row.packId, externalId },
      })
      if (owned) {
        const updated = await this.prisma.exercise.update({
          where: { id: owned.id },
          data: { payload: asJson(payload) },
        })
        return toExerciseDto(updated)
      }
      const created = await this.prisma.exercise.create({
        data: {
          userId: user.id,
          packId: row.packId,
          skill: 'LISTENING',
          level: row.level,
          source: 'generated',
          visibility: row.visibility,
          externalId,
          payload: asJson(payload),
        },
      })
      return toExerciseDto(created)
    }

    const updated = await this.prisma.exercise.update({
      where: { id: row.id },
      data: { payload: asJson(payload) },
    })
    return toExerciseDto(updated)
  }

  async remove(user: User, externalId: string): Promise<void> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const row = await this.prisma.exercise.findFirst({
      where: { userId: user.id, packId, externalId },
    })
    if (!row) {
      const seed = await this.prisma.exercise.findFirst({
        where: { source: 'seed', packId, externalId },
      })
      if (seed) {
        throw new ForbiddenException({
          code: 'SEED_LOCKED',
          message: 'Cannot delete bundled seed content',
        })
      }
      throw new NotFoundException({ code: 'EXERCISE_NOT_FOUND', message: 'Exercise not found' })
    }
    await this.prisma.exercise.delete({ where: { id: row.id } })
  }
}
