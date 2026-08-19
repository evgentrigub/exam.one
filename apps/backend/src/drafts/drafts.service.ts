import { Injectable, NotFoundException } from '@nestjs/common'
import type { DraftDto, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { asJson } from '../common/json'
import { toDraftDto } from '../common/mappers/practice.mapper'

@Injectable()
export class DraftsService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.draft.count()
  }

  async list(user: User, skill: Skill): Promise<DraftDto[]> {
    const rows = await this.prisma.draft.findMany({
      where: { userId: user.id, skill },
      orderBy: { updatedAt: 'desc' },
    })
    return rows.map(toDraftDto)
  }

  async get(user: User, skill: Skill, topicId: string): Promise<DraftDto | null> {
    const row = await this.prisma.draft.findUnique({
      where: { userId_skill_topicId: { userId: user.id, skill, topicId } },
    })
    return row ? toDraftDto(row) : null
  }

  async upsert(user: User, skill: Skill, topicId: string, payload: unknown): Promise<DraftDto> {
    const row = await this.prisma.draft.upsert({
      where: { userId_skill_topicId: { userId: user.id, skill, topicId } },
      create: { userId: user.id, skill, topicId, payload: asJson(payload) },
      update: { payload: asJson(payload) },
    })
    return toDraftDto(row)
  }

  async remove(user: User, skill: Skill, topicId: string): Promise<void> {
    const existing = await this.prisma.draft.findUnique({
      where: { userId_skill_topicId: { userId: user.id, skill, topicId } },
    })
    if (!existing) {
      throw new NotFoundException({ code: 'DRAFT_NOT_FOUND', message: 'Draft not found' })
    }
    await this.prisma.draft.delete({ where: { id: existing.id } })
  }
}
