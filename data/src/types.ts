import type { ExerciseAdapter, PartRuntime } from './runtime'
import type { MockExamContent, MockExamSet } from './packs/goethe-de-a2/content'

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
  /**
   * Assert anything about a generated payload that the projected view cannot express.
   * `validateView` only sees the projection, so shape rules a pack depends on — exact
   * item counts, per-item transcripts, required metadata — belong here. Throw to reject.
   */
  validate?(payload: Record<string, unknown>, rules: PartRuntime): void
  available?: boolean
  /** Short label shown in the existing exercise chrome, such as "Teil 1". */
  practiceLabel?: string
  /** Optional coach copy for this part. Shown in the existing tips list. */
  tips?: readonly string[]
  /** Optional phrase list for this part. Shown in the existing speaking card. */
  phrases?: readonly string[]
  /** Instruction line for this part. Shown above the speaking prompts. */
  instruction?: string
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
  /**
   * Provider settings for this prompt. A long generator needs a high `maxTokens`
   * or the response is truncated and cannot be parsed. Note that `temperature`
   * is ignored by OpenAI reasoning models, which take `reasoning_effort` instead.
   */
  llm?: { temperature?: number; maxTokens?: number }
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
  bundledMockSet?: MockExamSet
  /**
   * Build the prompt variables an `answer` or `review` prompt needs, from the stored
   * exercise payload and the learner's submission.
   *
   * Without this a pack may only use `{task}`, `{userContent}` and `{outputLanguage}`.
   * Any other placeholder is passed through to the model as literal text, so a prompt
   * that expects, say, `{monologue}` would be graded with the token still in it.
   */
  buildReviewVars?(input: {
    skill: SkillId
    part: number
    kind: 'answer' | 'review'
    payload: Record<string, unknown>
    answers: Record<string, unknown>
    outputLanguage: string
  }): PromptVars
  /**
   * Id for a newly generated exercise, when the pack needs a particular shape.
   * Return `undefined` to take the generic `<skill>-<packId>-<uuid>` id.
   */
  exerciseId?(skill: SkillId, part: number): string | undefined
  /**
   * Cross-module review, such as a mock-exam overview, which has no skill or part and so
   * cannot be reached through `findPrompt`. Absent, the endpoint reports it unavailable.
   */
  mockOverview?: {
    llm?: { temperature?: number; maxTokens?: number }
    system: string
    /** `result` is the pack's own input shape; the service passes the request body through. */
    assemble(outputLanguage: string, result: unknown): string
    /** Narrow and trim the model's JSON, or return null to report it unreadable. */
    parse(value: unknown): unknown
  }
}

export interface LlmMessage {
  role: 'system' | 'user'
  content: string
}

export type LlmComplete = (
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number }
) => Promise<string>

export const DEFAULT_PACK_ID = 'goethe-de-a2'
