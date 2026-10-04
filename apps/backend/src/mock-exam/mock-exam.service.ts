import { getPack } from '@exam-one/exam-packs'
import { resolveUserPackId } from '../core/context/active-pack'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import type { MockExamAttemptDto, MockExamSetDto, MockExamSetSummaryDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { asJson } from '../common/json'
import {
  toMockExamAttemptDto,
  toMockExamSetDto,
  toMockExamSetSummaryDto,
} from '../common/mappers/practice.mapper'
import type { MockExamSetBodyDto } from './dto/mock-exam.dto'
import { mockSetListeningExercises } from './mock-set-listening'

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  )
}

@Injectable()
export class MockExamService {
  constructor(private readonly prisma: PrismaService) {}

  async listSets(user: User): Promise<MockExamSetSummaryDto[]> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const rows = await this.prisma.mockExamSet.findMany({
      where: { packId, OR: [{ generated: false, userId: null }, { userId: user.id }] },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map(toMockExamSetSummaryDto)
  }

  async getSet(user: User, externalId: string): Promise<MockExamSetDto> {
    const row = await this.findSet(user, externalId)
    if (!row) {
      throw new NotFoundException({ code: 'SET_NOT_FOUND', message: 'Mock exam set not found' })
    }
    return toMockExamSetDto(row)
  }

  async createSet(user: User, set: MockExamSetBodyDto): Promise<MockExamSetDto> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const pack = getPack(packId)
    if (!pack?.live || !pack.createMockSet) throw new ForbiddenException({ code: 'MOCK_UNAVAILABLE', message: 'This pack does not support mock exams' })
    const existing = await this.prisma.mockExamSet.findFirst({
      where: { userId: user.id, packId, externalId: set.id },
    })
    const data = {
      userId: user.id,
      externalId: set.id,
      packId,
      examId: packId,
      level: pack.cefr,
      title: set.title,
      generated: true,
      content: asJson(set.content),
      modules: asJson(set.modules),
      ...(set.rules ? { rules: asJson(set.rules) } : {}),
      createdAt: new Date(set.createdAt),
    }
    // Completed and resumable attempts always retain the set definition they started with.
    const row = existing ?? await this.prisma.mockExamSet.create({ data })
    return toMockExamSetDto(row)
  }

  async deleteSet(user: User, externalId: string): Promise<string[]> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const row = await this.prisma.mockExamSet.findFirst({
      where: { userId: user.id, packId, externalId },
    })
    if (!row) {
      const seed = await this.prisma.mockExamSet.findFirst({
        where: { generated: false, packId, externalId },
      })
      if (seed) {
        throw new ForbiddenException({
          code: 'SEED_LOCKED',
          message: 'Cannot delete bundled Set 1',
        })
      }
      throw new NotFoundException({ code: 'SET_NOT_FOUND', message: 'Mock exam set not found' })
    }

    const listeningIds = mockSetListeningExercises(row.content).map(item => item.id)

    await this.prisma.mockExamSet.delete({ where: { id: row.id } })
    return listeningIds
  }

  async getAttempt(user: User, externalId: string): Promise<MockExamAttemptDto | null> {
    const set = await this.findSet(user, externalId)
    if (!set) {
      throw new NotFoundException({ code: 'SET_NOT_FOUND', message: 'Mock exam set not found' })
    }
    const row = await this.prisma.mockExamAttempt.findUnique({
      where: { userId_setId: { userId: user.id, setId: set.id } },
      include: { set: true },
    })
    return row ? toMockExamAttemptDto(row) : null
  }

  async upsertAttempt(user: User, externalId: string, state: unknown): Promise<MockExamAttemptDto> {
    const set = await this.findSet(user, externalId)
    if (!set) {
      throw new NotFoundException({ code: 'SET_NOT_FOUND', message: 'Mock exam set not found' })
    }
    const data = { userId: user.id, setId: set.id, state: asJson(state) }
    try {
      const row = await this.prisma.mockExamAttempt.upsert({
        where: { userId_setId: { userId: user.id, setId: set.id } },
        create: data,
        update: { state: data.state },
        include: { set: true },
      })
      return toMockExamAttemptDto(row)
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error
      const row = await this.prisma.mockExamAttempt.update({
        where: { userId_setId: { userId: user.id, setId: set.id } },
        data: { state: data.state },
        include: { set: true },
      })
      return toMockExamAttemptDto(row)
    }
  }

  async deleteAttempt(user: User, externalId: string): Promise<void> {
    const set = await this.findSet(user, externalId)
    if (!set) return
    await this.prisma.mockExamAttempt.deleteMany({
      where: { userId: user.id, setId: set.id },
    })
  }

  private async findSet(user: User, externalId: string) {
    const packId = await resolveUserPackId(this.prisma, user.id)
    return this.prisma.mockExamSet.findFirst({
      where: {
        externalId,
        packId,
        OR: [{ generated: false, userId: null }, { userId: user.id }],
      },
    })
  }
}
