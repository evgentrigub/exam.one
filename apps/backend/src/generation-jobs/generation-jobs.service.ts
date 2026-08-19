import { Injectable } from '@nestjs/common'
import type { GenerationJobDto, GenerationJobStatus, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { asJson } from '../common/json'
import { toGenerationJobDto } from '../common/mappers/practice.mapper'

@Injectable()
export class GenerationJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(user: User, kind: Skill): Promise<GenerationJobDto | null> {
    const row = await this.prisma.generationJob.findUnique({
      where: { userId_kind: { userId: user.id, kind } },
    })
    return row ? toGenerationJobDto(row) : null
  }

  async upsert(
    user: User,
    kind: Skill,
    payload: unknown,
    status: GenerationJobStatus = 'IDLE'
  ): Promise<GenerationJobDto> {
    const row = await this.prisma.generationJob.upsert({
      where: { userId_kind: { userId: user.id, kind } },
      create: { userId: user.id, kind, status, payload: asJson(payload) },
      update: { status, payload: asJson(payload) },
    })
    return toGenerationJobDto(row)
  }

  async remove(user: User, kind: Skill): Promise<void> {
    await this.prisma.generationJob.deleteMany({
      where: { userId: user.id, kind },
    })
  }
}
