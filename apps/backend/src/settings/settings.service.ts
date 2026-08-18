import { Injectable } from '@nestjs/common'
import type { SettingDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { toSettingDto } from '../common/mappers/user.mapper'
import type { UpdateSettingDto } from './dto/update-setting.dto'

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.setting.count()
  }

  async getMe(user: User): Promise<SettingDto> {
    const setting = await this.prisma.setting.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        examLevel: 'A2',
        targetLanguage: 'de',
      },
    })
    return toSettingDto(setting)
  }

  async updateMe(user: User, dto: UpdateSettingDto): Promise<SettingDto> {
    const setting = await this.prisma.setting.upsert({
      where: { userId: user.id },
      update: {
        ...(dto.examLevel !== undefined ? { examLevel: dto.examLevel } : {}),
        ...(dto.targetLanguage !== undefined ? { targetLanguage: dto.targetLanguage } : {}),
      },
      create: {
        userId: user.id,
        examLevel: dto.examLevel ?? 'A2',
        targetLanguage: dto.targetLanguage ?? 'de',
      },
    })
    return toSettingDto(setting)
  }
}
