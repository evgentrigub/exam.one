import { BadRequestException, Injectable } from '@nestjs/common'
import type { SettingDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { DEFAULT_PACK_ID, getLivePack, getPack } from '@exam-one/exam-packs'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { toSettingDto } from '../common/mappers/user.mapper'
import type { UpdateSettingDto } from './dto/update-setting.dto'

function examLevelOf(cefr: string): string {
  return cefr
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.setting.count()
  }

  async getMe(user: User): Promise<SettingDto> {
    const existing = await this.prisma.setting.findUnique({ where: { userId: user.id } })
    const pack = getLivePack(existing?.packId ?? DEFAULT_PACK_ID)
    const examLevel = examLevelOf(pack.cefr)
    const setting = await this.prisma.setting.upsert({
      where: { userId: user.id },
      update: { packId: pack.packId, examLevel, targetLanguage: pack.language },
      create: {
        userId: user.id,
        packId: pack.packId,
        examLevel,
        targetLanguage: pack.language,
      },
    })
    return toSettingDto(setting)
  }

  async updateMe(user: User, dto: UpdateSettingDto): Promise<SettingDto> {
    const existing = await this.prisma.setting.findUnique({ where: { userId: user.id } })
    if (dto.packId && !getPack(dto.packId)?.live) {
      throw new BadRequestException({ code: 'PACK_UNAVAILABLE', message: 'Choose a live pack' })
    }
    const requestedPackId =
      dto.packId ?? (dto.examLevel === 'C1' ? DEFAULT_PACK_ID : existing?.packId) ?? DEFAULT_PACK_ID
    const pack = getLivePack(requestedPackId)
    const examLevel = examLevelOf(pack.cefr)
    const targetLanguage = pack.language

    const setting = await this.prisma.setting.upsert({
      where: { userId: user.id },
      update: {
        packId: pack.packId,
        examLevel,
        targetLanguage,
      },
      create: {
        userId: user.id,
        packId: pack.packId,
        examLevel,
        targetLanguage,
      },
    })
    return toSettingDto(setting)
  }
}
