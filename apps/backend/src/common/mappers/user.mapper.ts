import type { SettingDto, UserDto } from '@exam-one/contracts'
import type { Setting, User } from '@exam-one/database'

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    examTargetDate: user.examTargetDate ? user.examTargetDate.toISOString().slice(0, 10) : null,
    plan: user.plan,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export function toSettingDto(setting: Setting): SettingDto {
  return {
    id: setting.id,
    userId: setting.userId,
    packId: setting.packId,
    examLevel: setting.examLevel,
    targetLanguage: setting.targetLanguage,
    updatedAt: setting.updatedAt.toISOString(),
  }
}
