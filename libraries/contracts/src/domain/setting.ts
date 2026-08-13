import type { ExamLevel } from './enums'

export interface SettingDto {
  id: string
  userId: string
  examLevel: ExamLevel
  targetLanguage: string
  updatedAt: string
}
