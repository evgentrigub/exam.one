export interface MockExamSetSummaryDto {
  packId: string
  id: string
  externalId: string
  examId: string
  level: string
  title: string
  generated: boolean
  createdAt: string
}

export interface MockExamSetDto extends MockExamSetSummaryDto {
  rules?: unknown
  content: unknown
  modules: unknown
}

export interface CreateMockExamSetRequest {
  set: {
    id: string
    examId: string
    level: string
    title: string
    generated: boolean
    createdAt: string
    modules: unknown
    content: unknown
    rules?: unknown
  }
}

export interface MockExamAttemptDto {
  id: string
  setId: string
  setExternalId: string
  state: unknown
  updatedAt: string
}

export interface UpsertMockExamAttemptRequest {
  state: unknown
}
