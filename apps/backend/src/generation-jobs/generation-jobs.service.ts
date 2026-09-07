import { Injectable } from '@nestjs/common'
import type { GenerationJobDto, GenerationJobStatus, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { resolveUserPackId } from '../common/active-pack'
import { asJson } from '../common/json'
import { toGenerationJobDto } from '../common/mappers/practice.mapper'

@Injectable()
export class GenerationJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: User): Promise<GenerationJobDto[]> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const rows = await this.prisma.generationJob.findMany({
      where: { userId: user.id, packId },
      orderBy: { updatedAt: 'desc' },
    })
    return rows.map(toGenerationJobDto)
  }

  async get(user: User, kind: Skill): Promise<GenerationJobDto | null> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const row = await this.prisma.generationJob.findUnique({
      where: { userId_packId_kind: { userId: user.id, packId, kind } },
    })
    return row ? toGenerationJobDto(row) : null
  }

  async upsert(
    user: User,
    kind: Skill,
    payload: unknown,
    status: GenerationJobStatus = 'IDLE'
  ): Promise<GenerationJobDto> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    const row = await this.prisma.generationJob.upsert({
      where: { userId_packId_kind: { userId: user.id, packId, kind } },
      create: { userId: user.id, packId, kind, status, payload: asJson(payload) },
      update: { status, payload: asJson(payload) },
    })
    return toGenerationJobDto(row)
  }

  async remove(user: User, kind: Skill): Promise<void> {
    const packId = await resolveUserPackId(this.prisma, user.id)
    await this.prisma.generationJob.deleteMany({
      where: { userId: user.id, packId, kind },
    })
  }
}
