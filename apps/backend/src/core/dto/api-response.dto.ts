import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type {
  AttemptDto,
  AuthConfigDto,
  AuthSessionData,
  DeleteListeningAudioData,
  DraftDto,
  ExerciseDto,
  GenerateListeningAudioData,
  HealthReadyData,
  ListeningExerciseAudioMap,
  LlmHealthData,
  LlmKeySummary,
  LlmModelListData,
  LlmModelOption,
  LlmProvider,
  LlmReasoningEffort,
  LlmSettingsDto,
  MockExamAttemptDto,
  MockExamSetDto,
  MockExamSetSummaryDto,
  PlanId,
  ResultDto,
  SettingDto,
  Skill,
  SttHealthData,
  TranscriptionData,
  TtsHealthData,
  UserDto,
} from '@exam-one/contracts'
import { LLM_PROVIDERS, LLM_REASONING_EFFORTS } from '../../ai/llm-options'

// ---------------------------------------------------------------------------
// Common Envelopes & Errors
// ---------------------------------------------------------------------------

export class ApiErrorDto {
  @ApiProperty({ description: 'Error code identifier', example: 'VALIDATION_ERROR' })
  code!: string

  @ApiProperty({ description: 'Human-readable error explanation', example: 'Invalid request body' })
  message!: string

  @ApiPropertyOptional({ description: 'Detailed validation issues or metadata', nullable: true })
  details?: unknown
}

export class MessageDataDto {
  @ApiProperty({
    description: 'Status or outcome message',
    example: 'Verification email resent successfully',
  })
  message!: string
}

export class MessageResponseDto {
  @ApiPropertyOptional({ type: MessageDataDto, description: 'Success response payload' })
  data?: MessageDataDto

  @ApiPropertyOptional({ type: ApiErrorDto, description: 'Error payload if request failed' })
  error?: ApiErrorDto
}

export class DeleteSuccessDataDto {
  @ApiProperty({ description: 'Indicates the deletion completed successfully', example: true })
  deleted!: boolean
}

export class DeleteSuccessResponseDto {
  @ApiPropertyOptional({ type: DeleteSuccessDataDto, description: 'Deletion status' })
  data?: DeleteSuccessDataDto

  @ApiPropertyOptional({ type: ApiErrorDto, description: 'Error payload' })
  error?: ApiErrorDto
}

export class DeleteMockSetDataDto {
  @ApiProperty({ description: 'Indicates set was deleted', example: true })
  deleted!: boolean

  @ApiProperty({
    description: 'Array of associated listening exercise external IDs removed',
    type: [String],
    example: ['goethe-a2-listen-part1-custom'],
  })
  listeningExerciseIds!: string[]
}

export class DeleteMockSetResponseDto {
  @ApiPropertyOptional({ type: DeleteMockSetDataDto, description: 'Mock exam deletion result' })
  data?: DeleteMockSetDataDto

  @ApiPropertyOptional({ type: ApiErrorDto, description: 'Error payload' })
  error?: ApiErrorDto
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export class HealthLivenessDataDto {
  @ApiProperty({ description: 'Process status', example: 'ok' })
  status!: string

  @ApiProperty({ description: 'Service name', example: 'exam.one-backend' })
  service!: string
}

export class HealthLivenessResponseDto {
  @ApiPropertyOptional({ type: HealthLivenessDataDto })
  data?: HealthLivenessDataDto

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

export class HealthReadyChecksDto {
  @ApiProperty({
    description: 'Postgres database connection check',
    enum: ['up', 'down'],
    example: 'up',
  })
  database!: 'up' | 'down'
}

export class HealthReadyDataDto implements HealthReadyData {
  @ApiProperty({ description: 'Overall readiness status', enum: ['ok', 'degraded'], example: 'ok' })
  status!: 'ok' | 'degraded'

  @ApiProperty({ type: HealthReadyChecksDto, description: 'Individual subsystem checks' })
  checks!: HealthReadyChecksDto
}

export class HealthReadyResponseDto {
  @ApiPropertyOptional({ type: HealthReadyDataDto })
  data?: HealthReadyDataDto

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

// ---------------------------------------------------------------------------
// Auth & Users
// ---------------------------------------------------------------------------

export class AuthConfigDataDto implements AuthConfigDto {
  @ApiProperty({ description: 'Whether SMTP email delivery is configured', example: true })
  emailConfigured!: boolean

  @ApiProperty({ description: 'Whether public user registration is enabled', example: true })
  registrationOpen!: boolean
}

export class AuthConfigResponseDto {
  @ApiPropertyOptional({ type: AuthConfigDataDto })
  data?: AuthConfigDataDto

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

export class UserDtoModel implements UserDto {
  @ApiProperty({ description: 'Unique user identifier', example: 'usr_c1234567890' })
  id!: string

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email!: string

  @ApiProperty({ description: 'User display name', example: 'Ada Lovelace' })
  name!: string

  @ApiPropertyOptional({
    description: 'Target exam date ISO timestamp',
    nullable: true,
    example: '2026-12-15T00:00:00.000Z',
  })
  examTargetDate!: string | null

  @ApiProperty({
    description: 'User subscription plan',
    enum: ['free', 'pro', 'enterprise'],
    example: 'free',
  })
  plan!: PlanId

  @ApiProperty({ description: 'Whether email verification has been completed', example: true })
  emailVerified!: boolean

  @ApiProperty({
    description: 'Account creation ISO timestamp',
    example: '2026-01-01T12:00:00.000Z',
  })
  createdAt!: string

  @ApiProperty({ description: 'Account update ISO timestamp', example: '2026-01-02T12:00:00.000Z' })
  updatedAt!: string
}

export class AuthSessionDataDto implements AuthSessionData {
  @ApiProperty({ type: UserDtoModel, description: 'Current authenticated user profile' })
  user!: UserDtoModel

  @ApiProperty({ description: 'True when email confirmation is pending', example: false })
  requiresEmailVerification!: boolean
}

export class AuthSessionResponseDto {
  @ApiPropertyOptional({ type: AuthSessionDataDto })
  data?: AuthSessionDataDto

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

export class UserResponseDto {
  @ApiPropertyOptional({ type: UserDtoModel })
  data?: UserDtoModel

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export class SettingDtoModel implements SettingDto {
  @ApiProperty({ description: 'Setting record ID', example: 'set_c1234567890' })
  id!: string

  @ApiProperty({ description: 'Owner user ID', example: 'usr_c1234567890' })
  userId!: string

  @ApiProperty({ description: 'Selected active exam pack identifier', example: 'cambridge-en-a2' })
  packId!: string

  @ApiProperty({ description: 'CEFR level of the selected pack (e.g. A1, A2)', example: 'A2' })
  examLevel!: string

  @ApiProperty({ description: 'Target language ISO code', example: 'de' })
  targetLanguage!: string

  @ApiProperty({ description: 'Email when a mock exam set finishes' })
  notifyMockReadyEmail!: boolean

  @ApiProperty({ description: 'Last update ISO timestamp', example: '2026-01-02T12:00:00.000Z' })
  updatedAt!: string
}

export class SettingResponseDto {
  @ApiPropertyOptional({ type: SettingDtoModel })
  data?: SettingDtoModel

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

export class ExerciseDtoModel implements ExerciseDto {
  @ApiProperty({ description: 'Database exercise UUID', example: 'ex_c1234567890' })
  id!: string

  @ApiProperty({ description: 'Owning exam pack ID', example: 'goethe-de-a2' })
  packId!: string

  @ApiProperty({
    description: 'Skill area',
    enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'],
    example: 'READING',
  })
  skill!: Skill

  @ApiProperty({ description: 'CEFR level of the owning pack (e.g. A1, A2)', example: 'A2' })
  level!: string

  @ApiProperty({
    description: 'Origin source: seed or user-generated',
    enum: ['seed', 'generated'],
    example: 'generated',
  })
  source!: 'seed' | 'generated' | string

  @ApiProperty({
    description: 'Exercise visibility mode',
    enum: ['PRACTICE', 'EXAM_ONLY'],
    example: 'PRACTICE',
  })
  visibility!: 'PRACTICE' | 'EXAM_ONLY' | string

  @ApiProperty({
    description: 'External slug identifier',
    example: 'goethe-a2-reading-part-1-gen-1',
  })
  externalId!: string

  @ApiProperty({
    description: 'Pack-specific exercise payload (texts, questions, options, keys)',
    type: Object,
  })
  payload!: unknown

  @ApiProperty({ description: 'Creation ISO timestamp', example: '2026-01-01T12:00:00.000Z' })
  createdAt!: string
}

export class ExerciseResponseDto {
  @ApiPropertyOptional({ type: ExerciseDtoModel })
  data?: ExerciseDtoModel

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

export class ExercisesListResponseDto {
  @ApiPropertyOptional({ type: [ExerciseDtoModel] })
  data?: ExerciseDtoModel[]

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

// ---------------------------------------------------------------------------
// Attempts & Results
// ---------------------------------------------------------------------------

export class ResultDtoModel implements ResultDto {
  @ApiProperty({ description: 'Result record ID', example: 'res_c1234567890' })
  id!: string

  @ApiProperty({ description: 'Associated attempt ID', example: 'att_c1234567890' })
  attemptId!: string

  @ApiPropertyOptional({ description: 'Scored points', nullable: true, example: 5 })
  score!: number | null

  @ApiPropertyOptional({ description: 'Maximum attainable points', nullable: true, example: 5 })
  maxScore!: number | null

  @ApiPropertyOptional({ description: 'Percentage score 0-100', nullable: true, example: 100 })
  percentage!: number | null

  @ApiPropertyOptional({
    description: 'Detailed AI or rubric review JSON',
    nullable: true,
    type: Object,
  })
  review!: unknown

  @ApiProperty({ description: 'Result creation timestamp', example: '2026-01-01T12:00:00.000Z' })
  createdAt!: string
}

export class AttemptDtoModel implements AttemptDto {
  @ApiProperty({
    description: 'Exam pack ID under which attempt was made',
    example: 'goethe-de-a2',
  })
  packId!: string

  @ApiProperty({ description: 'Attempt UUID', example: 'att_c1234567890' })
  id!: string

  @ApiProperty({ description: 'Owner user ID', example: 'usr_c1234567890' })
  userId!: string

  @ApiPropertyOptional({
    description: 'Foreign key to exercise if persisted',
    nullable: true,
    example: 'ex_c1234567890',
  })
  exerciseId!: string | null

  @ApiPropertyOptional({
    description: 'External slug of exercise',
    nullable: true,
    example: 'goethe-a2-reading-part-1',
  })
  exerciseExternalId!: string | null

  @ApiProperty({
    description: 'Tested skill area',
    enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'],
    example: 'READING',
  })
  skill!: Skill

  @ApiPropertyOptional({
    description: 'Historical rendering snapshot of exercise content',
    nullable: true,
    type: Object,
  })
  snapshot?: unknown

  @ApiProperty({
    description: 'User-submitted answers dictionary',
    type: Object,
    example: { 'question-1': 0, 'question-2': 1 },
  })
  answers!: unknown

  @ApiPropertyOptional({
    type: ResultDtoModel,
    nullable: true,
    description: 'Evaluation result and scores',
  })
  result!: ResultDtoModel | null

  @ApiProperty({ description: 'Submission ISO timestamp', example: '2026-01-01T12:00:00.000Z' })
  submittedAt!: string
}

export class AttemptResponseDto {
  @ApiPropertyOptional({ type: AttemptDtoModel })
  data?: AttemptDtoModel

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

export class AttemptsListResponseDto {
  @ApiPropertyOptional({ type: [AttemptDtoModel] })
  data?: AttemptDtoModel[]

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

// ---------------------------------------------------------------------------
// Drafts
// ---------------------------------------------------------------------------

export class DraftDtoModel implements DraftDto {
  @ApiProperty({ description: 'Exam pack ID', example: 'goethe-de-a2' })
  packId!: string

  @ApiProperty({ description: 'Draft record ID', example: 'drf_c1234567890' })
  id!: string

  @ApiProperty({ description: 'Owner user ID', example: 'usr_c1234567890' })
  userId!: string

  @ApiProperty({
    description: 'Target skill',
    enum: ['READING', 'WRITING', 'LISTENING', 'SPEAKING'],
    example: 'WRITING',
  })
  skill!: Skill

  @ApiProperty({ description: 'Topic or exercise identifier', example: 'writing-topic-part1' })
  topicId!: string

  @ApiProperty({ description: 'Saved draft payload', type: Object })
  payload!: unknown

  @ApiProperty({ description: 'Last modified ISO timestamp', example: '2026-01-01T12:00:00.000Z' })
  updatedAt!: string
}

export class DraftResponseDto {
  @ApiPropertyOptional({ type: DraftDtoModel, nullable: true })
  data?: DraftDtoModel | null

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

export class DraftsListResponseDto {
  @ApiPropertyOptional({ type: [DraftDtoModel] })
  data?: DraftDtoModel[]

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

// ---------------------------------------------------------------------------
// Mock Exams
// ---------------------------------------------------------------------------

export class MockExamSetSummaryDtoModel implements MockExamSetSummaryDto {
  @ApiProperty({ description: 'Owning exam pack ID', example: 'goethe-de-a2' })
  packId!: string

  @ApiProperty({ description: 'Database mock set ID', example: 'set_c1234567890' })
  id!: string

  @ApiProperty({ description: 'External unique slug', example: 'goethe-a2-set-1' })
  externalId!: string

  @ApiProperty({ description: 'Exam type identifier', example: 'goethe-a2' })
  examId!: string

  @ApiProperty({ description: 'Proficiency level', example: 'A2' })
  level!: string

  @ApiProperty({
    description: 'Human-readable mock set title',
    example: 'Goethe-Zertifikat A2 Mock Exam Set 1',
  })
  title!: string

  @ApiProperty({ description: 'Whether set was dynamically AI-generated', example: false })
  generated!: boolean

  @ApiProperty({ description: 'Creation ISO timestamp', example: '2026-01-01T12:00:00.000Z' })
  createdAt!: string
}

export class MockExamSetDtoModel extends MockExamSetSummaryDtoModel implements MockExamSetDto {
  @ApiPropertyOptional({
    description: 'Exam rules including timing and pass thresholds',
    nullable: true,
    type: Object,
  })
  rules?: unknown

  @ApiProperty({ description: 'Full exam exercises grouped by module', type: Object })
  content!: unknown

  @ApiProperty({ description: 'Module definitions and time limits', type: Object })
  modules!: unknown
}

export class MockExamSetSummaryListResponseDto {
  @ApiPropertyOptional({ type: [MockExamSetSummaryDtoModel] })
  data?: MockExamSetSummaryDtoModel[]

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

export class MockExamSetResponseDto {
  @ApiPropertyOptional({ type: MockExamSetDtoModel })
  data?: MockExamSetDtoModel

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

export class MockExamAttemptDtoModel implements MockExamAttemptDto {
  @ApiProperty({ description: 'Attempt ID', example: 'mka_c1234567890' })
  id!: string

  @ApiProperty({ description: 'Mock exam set foreign ID', example: 'set_c1234567890' })
  setId!: string

  @ApiProperty({ description: 'Mock exam set external slug', example: 'goethe-a2-set-1' })
  setExternalId!: string

  @ApiProperty({
    description: 'Persisted full mock exam state (answers, step, timers, reviews)',
    type: Object,
  })
  state!: unknown

  @ApiProperty({
    description: 'Last state save ISO timestamp',
    example: '2026-01-01T12:00:00.000Z',
  })
  updatedAt!: string
}

export class MockExamAttemptResponseDto {
  @ApiPropertyOptional({ type: MockExamAttemptDtoModel, nullable: true })
  data?: MockExamAttemptDtoModel | null

  @ApiPropertyOptional({ type: ApiErrorDto })
  error?: ApiErrorDto
}

// ---------------------------------------------------------------------------
// AI & Speech Envelopes (AiResponse<T>)
// ---------------------------------------------------------------------------

export class AiGenericResponseDto {
  @ApiPropertyOptional({
    description: 'Generated content, model answer, or grading payload',
    nullable: true,
    type: Object,
  })
  data!: unknown | null

  @ApiPropertyOptional({
    description: 'Error message if generation or review failed',
    nullable: true,
    example: null,
  })
  error!: string | null
}

export class LlmHealthDataDto implements LlmHealthData {
  @ApiProperty({
    description: 'Whether the current user has chosen a provider, saved its key and picked a model',
    example: true,
  })
  configured!: boolean

  @ApiProperty({ description: 'Whether connection test to upstream LLM succeeded', example: true })
  connected!: boolean

  @ApiPropertyOptional({ description: 'Active LLM provider', nullable: true, example: 'openai' })
  provider!: string | null

  @ApiPropertyOptional({
    description: "The user's main LLM model",
    nullable: true,
    example: 'google/gemma-4-31b-it:free',
  })
  model!: string | null

  @ApiPropertyOptional({
    description: 'Connection status message or error note',
    nullable: true,
    example: 'OK',
  })
  message!: string | null
}

export class LlmHealthResponseDto {
  @ApiPropertyOptional({ type: LlmHealthDataDto, nullable: true })
  data!: LlmHealthDataDto | null

  @ApiPropertyOptional({ nullable: true, example: null })
  error!: string | null
}

export class TtsHealthDataDto implements TtsHealthData {
  @ApiProperty({ description: 'Whether Kokoro TTS service is responding', example: true })
  ok!: boolean
}

export class TtsHealthResponseDto {
  @ApiPropertyOptional({ type: TtsHealthDataDto, nullable: true })
  data!: TtsHealthDataDto | null

  @ApiPropertyOptional({ nullable: true, example: null })
  error!: string | null
}

export class SttHealthDataDto implements SttHealthData {
  @ApiProperty({ description: 'Configured STT provider', enum: ['local'], example: 'local' })
  provider!: 'local'

  @ApiProperty({ description: 'Whether speech-to-text service is ready', example: true })
  ready!: boolean

  @ApiProperty({
    description: 'Readiness detail or fallback information',
    example: 'Phonon 2 ready',
  })
  detail!: string

  @ApiPropertyOptional({ description: 'Selected speech model', example: 'phonon-2' })
  model?: string

  @ApiPropertyOptional({ description: 'Active exam language', example: 'en' })
  language?: string

  @ApiPropertyOptional({ enum: ['ready', 'missing', 'loading', 'unsupported', 'offline'] })
  state?: NonNullable<SttHealthData['state']>
}

export class SttHealthResponseDto {
  @ApiPropertyOptional({ type: SttHealthDataDto, nullable: true })
  data!: SttHealthDataDto | null

  @ApiPropertyOptional({ nullable: true, example: null })
  error!: string | null
}

export class TranscriptionDataDto implements TranscriptionData {
  @ApiProperty({
    description: 'Transcribed text from user audio',
    example: 'Ich möchte gerne einen Deutschkurs besuchen.',
  })
  transcript!: string

  @ApiProperty({
    description: 'Provider that performed transcription',
    enum: ['local'],
    example: 'local',
  })
  provider!: 'local'
}

export class TranscriptionResponseDto {
  @ApiPropertyOptional({ type: TranscriptionDataDto, nullable: true })
  data!: TranscriptionDataDto | null

  @ApiPropertyOptional({ nullable: true, example: null })
  error!: string | null
}

export class ListeningExerciseAudioMapDto implements ListeningExerciseAudioMap {
  @ApiPropertyOptional({
    description: 'Shared intro/scenario audio URL path',
    example: '/audio/listening/goethe-a2-intro.wav',
  })
  shared?: string

  @ApiPropertyOptional({
    description: 'Map of question item ID to generated audio URL path',
    type: Object,
    example: { q1: '/audio/listening/q1.wav', q2: '/audio/listening/q2.wav' },
  })
  items?: Record<string, string>
}

export class GenerateListeningAudioDataDto implements GenerateListeningAudioData {
  @ApiProperty({
    type: ListeningExerciseAudioMapDto,
    description: 'Generated listening audio paths',
  })
  audio!: ListeningExerciseAudioMapDto

  @ApiProperty({ description: 'Count of audio files written', example: 3 })
  written!: number
}

export class GenerateListeningAudioResponseDto {
  @ApiPropertyOptional({ type: GenerateListeningAudioDataDto, nullable: true })
  data!: GenerateListeningAudioDataDto | null

  @ApiPropertyOptional({ nullable: true, example: null })
  error!: string | null
}

export class DeleteListeningAudioDataDto implements DeleteListeningAudioData {
  @ApiProperty({ description: 'Number of audio directories or files deleted', example: 2 })
  deleted!: number
}

export class DeleteListeningAudioResponseDto {
  @ApiPropertyOptional({ type: DeleteListeningAudioDataDto, nullable: true })
  data!: DeleteListeningAudioDataDto | null

  @ApiPropertyOptional({ nullable: true, example: null })
  error!: string | null
}

// ---------------------------------------------------------------------------
// Per-user LLM settings
// ---------------------------------------------------------------------------

export class LlmKeySummaryDto implements LlmKeySummary {
  @ApiProperty({ enum: LLM_PROVIDERS, example: 'openrouter' })
  provider!: LlmProvider

  @ApiProperty({ description: 'Last four characters of the saved key', example: '3f9a' })
  last4!: string

  @ApiProperty({ example: '2026-10-12T12:00:00.000Z' })
  updatedAt!: string
}

export class LlmSettingsDtoModel implements LlmSettingsDto {
  @ApiPropertyOptional({ enum: LLM_PROVIDERS, nullable: true, example: 'openrouter' })
  provider!: LlmProvider | null

  @ApiPropertyOptional({ nullable: true, example: 'google/gemma-4-31b-it:free' })
  model!: string | null

  @ApiProperty({ type: [String], example: ['nvidia/nemotron-3-super-120b-a12b:free'] })
  fallbackModels!: string[]

  @ApiProperty({ enum: LLM_REASONING_EFFORTS, example: 'medium' })
  reasoningEffort!: LlmReasoningEffort

  @ApiProperty({ type: [LlmKeySummaryDto] })
  keys!: LlmKeySummaryDto[]
}

export class LlmSettingsResponseDto {
  @ApiProperty({ type: LlmSettingsDtoModel })
  data!: LlmSettingsDtoModel
}

export class LlmKeySummaryResponseDto {
  @ApiProperty({ type: LlmKeySummaryDto })
  data!: LlmKeySummaryDto
}

export class LlmModelOptionDto implements LlmModelOption {
  @ApiProperty({ example: 'google/gemma-4-31b-it:free' })
  id!: string

  @ApiProperty({ example: 'Google: Gemma 4 31B (free)' })
  name!: string

  @ApiPropertyOptional({ example: 262144 })
  contextLength?: number

  @ApiPropertyOptional({
    description: 'OpenRouter only: prompt and completion are free',
    example: true,
  })
  free?: boolean
}

export class LlmModelListDataDto implements LlmModelListData {
  @ApiProperty({ type: [LlmModelOptionDto] })
  models!: LlmModelOptionDto[]
}

export class LlmModelListResponseDto {
  @ApiProperty({ type: LlmModelListDataDto })
  data!: LlmModelListDataDto
}
