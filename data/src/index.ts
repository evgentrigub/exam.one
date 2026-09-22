export { assemblePrompt, definePrompt, interpolate } from './assemble'
export {
  findPrompt,
  generatorParts,
  getAvailableExamParts,
  packTotalMinutes,
  packTotalPoints,
} from './lookup'
export { getLivePack, getPack, listLivePacks, listPacks } from './registry'
export { GOETHE_DE_A2_PACK_ID, goetheDeA2 } from './packs/goethe-de-a2/pack'
export { goetheDeC1 } from './packs/goethe-de-c1/pack'
export { buildMockExamOverviewPrompt } from './packs/goethe-de-a2/prompts/mock-exam'
export type {
  MockExamOverview,
  MockExamOverviewInput,
  MockExamOverviewItem,
} from './packs/goethe-de-a2/prompts/mock-exam'
export { DEFAULT_PACK_ID } from './types'
export type {
  AiResult,
  CompatibilityAi,
  ExamModule,
  ExamPack,
  ExamPart,
  ItemFormat,
  LlmComplete,
  LlmMessage,
  PromptKind,
  PromptSpec,
  PromptSpecFields,
  PromptVars,
  SkillId,
  SpeechConfig,
  SpeechVoice,
} from './types'

export * from './runtime'
export { validatePacks } from './validation'

export { extractTextsFromResponse as goetheExtractTextsFromResponse, normaliseText as goetheNormaliseText } from './packs/goethe-de-a2/compatibility/reading'
export const goetheGenerateReadingSystem0 = 'You are an expert Goethe-Institut exam creator. Generate reading comprehension exercises according to the specifications provided. Return ONLY a valid JSON array of GermanText objects with questions, no additional text.'

export { type ListeningPromptPart as goetheListeningPromptPart, isListeningA2Part as goetheIsListeningA2Part, isValidForPart as goetheIsValidForPart, normaliseExercise as goetheNormaliseExercise } from './packs/goethe-de-a2/compatibility/listening'
export const goetheGenerateListeningSystem0 = 'You are an expert Goethe-Institut exam creator. Generate listening comprehension exercises according to the specifications provided. Return ONLY a valid JSON array of exercise objects, no additional text.'

export { type SpeakingPromptPart as goetheSpeakingPromptPart, isSpeakingA2Part as goetheIsSpeakingA2Part, normaliseTopic as goetheNormaliseTopic } from './packs/goethe-de-a2/compatibility/speaking'
export const goetheGenerateSpeakingSystem0 = 'You are an expert Goethe-Institut exam creator. Generate speaking topics according to the specifications provided. Return ONLY a valid JSON array of topic objects, no additional text.'

export { type ModelAnswerData as goetheModelAnswerData, normalizeGeneratedTopic as goetheNormalizeGeneratedTopic, normalizeModelAnswer as goetheNormalizeModelAnswer } from './packs/goethe-de-a2/compatibility/writing'
export const goetheGenerateWritingSystem0 = 'You are an expert Goethe-Institut exam creator. Generate writing topics according to the specifications provided. Return ONLY valid JSON array of WritingTopic objects, no additional text.'
export const goetheGenerateWritingSystem1 = 'You are an expert Goethe-Institut exam creator. Generate model answers according to the specifications provided. Return ONLY a valid JSON object with no additional text, explanation, or markdown outside the JSON.'

export { type WritingReviewData as goetheWritingReviewData, type MockExamOverview as goetheMockExamOverview, isValidA2Review as goetheIsValidA2Review, isValidC1Review as goetheIsValidC1Review, isSpeakingReviewData as goetheIsSpeakingReviewData, isOverview as goetheIsOverview } from './packs/goethe-de-a2/compatibility/review'
export const goetheReviewSystem0 = 'You are an expert Goethe-Institut examiner. Review writing submissions according to the specifications provided. Return ONLY a valid JSON object with no additional text, explanation, or markdown outside the JSON.'
export const goetheReviewSystem1 = 'You are an expert Goethe-Institut A2 speaking examiner. Return only the requested valid JSON object.'
export const goetheReviewSystem2 = 'You are a supportive Goethe A2 exam coach. Return only valid JSON and keep feedback concise.'
