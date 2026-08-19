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

@Injectable()
export class MockExamService {
  constructor(private readonly prisma: PrismaService) {}

  async listSets(user: User): Promise<MockExamSetSummaryDto[]> {
    const rows = await this.prisma.mockExamSet.findMany({
      where: { OR: [{ generated: false, userId: null }, { userId: user.id }] },
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
    const existing = await this.prisma.mockExamSet.findFirst({
      where: { userId: user.id, externalId: set.id },
    })
    const data = {
      userId: user.id,
      externalId: set.id,
      examId: set.examId,
      level: set.level,
      title: set.title,
      generated: true,
      content: asJson(set.content),
      modules: asJson(set.modules),
      createdAt: new Date(set.createdAt),
    }
    const row = existing
      ? await this.prisma.mockExamSet.update({ where: { id: existing.id }, data })
      : await this.prisma.mockExamSet.create({ data })
    return toMockExamSetDto(row)
  }

  async deleteSet(user: User, externalId: string): Promise<string[]> {
    const row = await this.prisma.mockExamSet.findFirst({
      where: { userId: user.id, externalId },
    })
    if (!row) {
      const seed = await this.prisma.mockExamSet.findFirst({
        where: { generated: false, externalId },
      })
      if (seed) {
        throw new ForbiddenException({
          code: 'SEED_LOCKED',
          message: 'Cannot delete bundled Set 1',
        })
      }
      throw new NotFoundException({ code: 'SET_NOT_FOUND', message: 'Mock exam set not found' })
    }

    const content = row.content as { listening?: Array<{ id?: string }> }
    const listeningIds = (content.listening ?? [])
      .map(item => item.id)
      .filter((id): id is string => Boolean(id))

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
    const row = await this.prisma.mockExamAttempt.upsert({
      where: { userId_setId: { userId: user.id, setId: set.id } },
      create: { userId: user.id, setId: set.id, state: asJson(state) },
      update: { state: asJson(state) },
      include: { set: true },
    })
    return toMockExamAttemptDto(row)
  }

  async deleteAttempt(user: User, externalId: string): Promise<void> {
    const set = await this.findSet(user, externalId)
    if (!set) return
    await this.prisma.mockExamAttempt.deleteMany({
      where: { userId: user.id, setId: set.id },
    })
  }

  private findSet(user: User, externalId: string) {
    return this.prisma.mockExamSet.findFirst({
      where: {
        externalId,
        OR: [{ generated: false, userId: null }, { userId: user.id }],
      },
    })
  }
}
