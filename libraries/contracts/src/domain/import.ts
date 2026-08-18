export type PracticeImportDomain =
  | 'reading'
  | 'writing'
  | 'listening'
  | 'speaking'
  | 'mock-exam'

export interface PracticeImportCounts {
  exercises: number
  attempts: number
  drafts: number
  generationJobs: number
  mockSets: number
  mockAttempts: number
}

export interface PracticeImportRequest {
  entries: Record<string, unknown>
}

export interface PracticeImportResultDto {
  domain: PracticeImportDomain
  skipped: boolean
  imported: PracticeImportCounts
}

export interface PracticeMigrationStatusDto {
  migratedDomains: PracticeImportDomain[]
}
