import type { ExamLevel } from './enums'

export interface SettingDto {
  id: string
  userId: string
  packId: string
  examLevel: ExamLevel
  targetLanguage: string
  notifyMockReadyEmail: boolean
  updatedAt: string
}
