import type { ExerciseAdapter, PartRuntime } from './runtime'
import type { MockExamContent, MockExamSet } from './packs/goethe-de-a2/content'

export type SkillId = 'reading' | 'writing' | 'listening' | 'speaking'

export type PromptKind = 'generator' | 'answer' | 'review'

/**
 * `gap-fill` is objective like the choice formats, but the learner types each answer; it is
 * scored against the question's `accepted` list instead of an option index.
 */
export type ItemFormat =
  'selection' | 'matching' | 'true-false' | 'gap-fill' | 'freeform' | 'recording'

/** Formats scored automatically from the learner's answers, without a rubric review. */
export const OBJECTIVE_FORMATS: readonly ItemFormat[] = [
  'selection',
  'matching',
  'true-false',
  'gap-fill',
]

/**
 * A dedicated practice screen for a part whose interaction the default screen for its format
 * cannot express. Absent, the part uses its skill's default screen.
 * - `form-fill` (freeform): a scenario text and a form whose blank rows are the fields.
 * - `word-cards` (recording): ask a question from a topic + word card, answer a partner question.
 * - `request-cards` (recording): make a request from a cue, respond to a partner request.
 */
export type PartLayout = 'form-fill' | 'word-cards' | 'request-cards'

export const LAYOUT_FORMATS: Record<PartLayout, ItemFormat> = {
  'form-fill': 'freeform',
  'word-cards': 'recording',
  'request-cards': 'recording',
}

export type PromptVars = Record<string, string | number | undefined>

export interface ExamPart {
  n: number
  title: string
  format: string
  short: string
  goal: string
  skill: string
  itemFormat: ItemFormat
  layout?: PartLayout
  /** Show selected choice words/sentences in numbered passage gaps. Answers remain indices. */
  choiceGaps?: boolean
  /**
   * Questions share one option list: show it once as a lettered bank and answer each question
   * with compact letter chips. Display only; payloads whose options differ keep the full grid.
   */
  optionBank?: boolean
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
  /** Short description of the part in the session header, such as "Short messages". */
  practiceSubtitle?: string
  /** Estimated minutes shown on the exercise card in the catalog. */
  practiceMinutes?: number
  /** Countdown for a practice session, in seconds. */
  practiceTimerSec?: number
  /** Catalog type key for the exercise card; resolved through `exerciseType.*` i18n. */
  practiceType?: string
  /** Badge naming the task in the speaking session, such as "Interview". */
  sessionTitle?: string
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

/** UI locales with a translated exam structure. English is the source, written in `structure`. */
export const STRUCTURE_LOCALES = ['de', 'es', 'pl', 'ru'] as const
export type StructureLocale = (typeof STRUCTURE_LOCALES)[number]

/** The user-facing text of one part, as shown on the exam format page and the part chips. */
export type PartText = Pick<ExamPart, 'title' | 'format' | 'short' | 'goal' | 'skill'>

/** The user-facing text of one module, with its parts keyed by part number. */
export type ModuleText = Pick<ExamModule, 'label' | 'summary' | 'scoringNote'> & {
  parts: Record<number, PartText>
}

/** One locale's translation of a pack's structure, keyed by module id. */
export type StructureText = Partial<Record<SkillId, ModuleText>>

export type StructureTranslations = Record<StructureLocale, StructureText>

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
  /** Bound long listening requests for local speech engines with limited memory. */
  maxChunkCharacters?: number
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
  live: boolean
  examIds: readonly string[]
  structure: ExamModule[]
  /**
   * Translations of the structure's user-facing text, applied with `localizeStructure`.
   * Display only: runtime, prompts and adapters keep reading the English `structure`.
   */
  structureText?: StructureTranslations
  prompts: readonly PromptSpec[]
  speech: SpeechConfig
  /**
   * Bundled exercises installed by `db:seed`, per module. Each payload needs a string `id`
   * (its external id) and is stored under this pack's `packId` and `cefr`.
   */
  seedExercises?: Partial<Record<SkillId, readonly Record<string, unknown>[]>>
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

/** The pack a new account starts on; its bundled listening audio is the only one seeded at first run. */
export const DEFAULT_PACK_ID = 'cambridge-en-a2'
