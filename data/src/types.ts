import type { ExerciseAdapter, PartRuntime } from './runtime'
import type { MockExamContent, MockExamSet } from '@exam-one/exam-content'

export type SkillId = 'reading' | 'writing' | 'listening' | 'speaking'

export type PromptKind = 'generator' | 'answer' | 'review'

export type ItemFormat = 'selection' | 'matching' | 'true-false' | 'freeform' | 'recording'

export type PromptVars = Record<string, string | number | undefined>

export interface ExamPart {
  n: number
  title: string
  format: string
  short: string
  goal: string
  skill: string
  itemFormat: ItemFormat
  runtime?: PartRuntime
  adapter?: ExerciseAdapter
  available?: boolean
}

export interface ExamModule {
  id: SkillId
  label: string
  minutes: number
  points: number
  summary: string
  scoringNote: string
  parts: ExamPart[]
}

export interface PromptSpecFields {
  skill: SkillId
  part: number
  kind: PromptKind
  role: string
  task: string
  rules: readonly string[]
  examples?: readonly string[]
  outputPrelude?: string
  outputContract: string
}

export interface PromptSpec extends PromptSpecFields {
  assemble: (vars: PromptVars) => string
}

export interface SpeechVoice {
  id: string
  gender: 'male' | 'female'
}

export interface SpeechConfig {
  ttsLang: string
  voices: readonly SpeechVoice[]
  sttLang: string
  audioPathPrefix: string
}

export interface ExamPack {
  packId: string
  board: string
  language: string
  cefr: string
  title: string
  compatibility?: 'goethe-a2-v1'
  live: boolean
  examIds: readonly string[]
  structure: ExamModule[]
  prompts: readonly PromptSpec[]
  speech: SpeechConfig
  createMockSet?: (setNumber: number, content: MockExamContent) => MockExamSet
}

export const DEFAULT_PACK_ID = 'goethe-de-a2'
