import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { ExamLevel, PromptKind, PromptOverrideDto, Skill } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { toPromptOverrideDto } from '../common/mappers/practice.mapper'

function invalidSlot(): never {
  throw new BadRequestException({
    code: 'PROMPT_OVERRIDE_INVALID_SLOT',
    message: 'Prompt override slot is not supported',
  })
}

export function assertPromptSlot(
  skill: Skill,
  level: ExamLevel,
  part: number,
  kind: PromptKind
): void {
  if (skill === 'MOCK' || level !== 'A2') invalidSlot()

  if (skill === 'READING' || skill === 'LISTENING') {
    if (part < 1 || part > 4 || kind !== 'GENERATOR') invalidSlot()
    return
  }

  if (skill === 'WRITING' || skill === 'SPEAKING') {
    if (part < 1 || part > 2) invalidSlot()
    if (kind !== 'GENERATOR' && kind !== 'ANSWER' && kind !== 'REVIEW') invalidSlot()
    return
  }

  invalidSlot()
}

@Injectable()
export class PromptOverridesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: User): Promise<PromptOverrideDto[]> {
    const rows = await this.prisma.promptOverride.findMany({
      where: { userId: user.id },
      orderBy: [{ skill: 'asc' }, { part: 'asc' }, { kind: 'asc' }],
    })
    return rows.map(toPromptOverrideDto)
  }

  async upsert(
    user: User,
    skill: Skill,
    level: ExamLevel,
    part: number,
    kind: PromptKind,
    body: string
  ): Promise<PromptOverrideDto> {
    assertPromptSlot(skill, level, part, kind)
    const row = await this.prisma.promptOverride.upsert({
      where: {
        userId_skill_level_part_kind: { userId: user.id, skill, level, part, kind },
      },
      create: { userId: user.id, skill, level, part, kind, body },
      update: { body },
    })
    return toPromptOverrideDto(row)
  }

  async remove(
    user: User,
    skill: Skill,
    level: ExamLevel,
    part: number,
    kind: PromptKind
  ): Promise<void> {
    assertPromptSlot(skill, level, part, kind)
    const existing = await this.prisma.promptOverride.findUnique({
      where: {
        userId_skill_level_part_kind: { userId: user.id, skill, level, part, kind },
      },
    })
    if (!existing) {
      throw new NotFoundException({
        code: 'PROMPT_OVERRIDE_NOT_FOUND',
        message: 'Prompt override not found',
      })
    }
    await this.prisma.promptOverride.delete({ where: { id: existing.id } })
  }
}
