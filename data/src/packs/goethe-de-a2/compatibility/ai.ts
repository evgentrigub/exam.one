import type { Difficulty } from '../content'
import type { AiResult, LlmComplete } from '../../../types'
import { extractJsonArray, extractJsonObject, nonEmptyString } from './json'
import {
  extractTextsFromResponse,
  normaliseText,
} from './reading'
import {
  isListeningA2Part,
  isValidForPart,
  normaliseExercise,
  type ListeningPromptPart,
} from './listening'
import { isSpeakingA2Part, normaliseTopic, type SpeakingPromptPart } from './speaking'
import { generateTopicId } from './ids'
import { normalizeGeneratedTopic, normalizeModelAnswer } from './writing'
import { isOverview, isSpeakingReviewData, isValidA2Review } from './review'

const readingSystem =
  'You are an expert Goethe-Institut exam creator. Generate reading comprehension exercises according to the specifications provided. Return ONLY a valid JSON array of GermanText objects with questions, no additional text.'
const listeningSystem =
  'You are an expert Goethe-Institut exam creator. Generate listening comprehension exercises according to the specifications provided. Return ONLY a valid JSON array of exercise objects, no additional text.'
const speakingSystem =
  'You are an expert Goethe-Institut exam creator. Generate speaking topics according to the specifications provided. Return ONLY a valid JSON array of topic objects, no additional text.'
const writingSystem =
  'You are an expert Goethe-Institut exam creator. Generate writing topics according to the specifications provided. Return ONLY valid JSON array of WritingExercise objects, no additional text.'
const modelAnswerSystem =
  'You are an expert Goethe-Institut exam creator. Generate model answers according to the specifications provided. Return ONLY a valid JSON object with no additional text, explanation, or markdown outside the JSON.'
const writingReviewSystem =
  'You are an expert Goethe-Institut examiner. Review writing submissions according to the specifications provided. Return ONLY a valid JSON object with no additional text, explanation, or markdown outside the JSON.'
const speakingReviewSystem =
  'You are an expert Goethe-Institut A2 speaking examiner. Return only the requested valid JSON object.'
const mockOverviewSystem =
  'You are a supportive Goethe A2 exam coach. Return only valid JSON and keep feedback concise.'

function promptJobs(body: Record<string, unknown>): { part: number; prompt: string }[] {
  const prompts = body['prompts']
  if (Array.isArray(prompts)) {
    return prompts.flatMap(job => {
      if (!job || typeof job !== 'object') return []
      const part = (job as { part?: unknown }).part
      const prompt = (job as { prompt?: unknown }).prompt
      if (typeof part !== 'number' || !nonEmptyString(prompt)) return []
      return [{ part, prompt }]
    })
  }
  if (nonEmptyString(body['prompt'])) return [{ part: 1, prompt: body['prompt'] }]
  return []
}

function difficultyOf(body: Record<string, unknown>): Difficulty {
  return body['difficulty'] === 'C1' ? 'C1' : 'A2'
}

export async function generateReading(
  body: Record<string, unknown>,
  complete: LlmComplete
): Promise<AiResult> {
  const jobs = promptJobs(body)
  if (jobs.length === 0) return { data: null, error: 'No prompt provided for reading generation.' }
  try {
    const texts = []
    for (const job of jobs) {
      let parsed = await readingForPrompt(job.prompt, complete)
      if (!parsed || parsed.length === 0) parsed = await readingForPrompt(job.prompt, complete)
      if (!parsed || parsed.length === 0) continue
      texts.push(
        ...parsed.map(text => normaliseText(text, difficultyOf(body), job.part as 1 | 2 | 3 | 4))
      )
    }
    if (texts.length === 0) {
      return {
        data: null,
        error: 'Failed to parse reading exercises from AI response. Please try again.',
      }
    }
    return { data: texts, error: null }
  } catch (error: unknown) {
    if (error instanceof Error) return { data: null, error: error.message }
    return { data: null, error: 'Failed to generate reading exercises. Please try again.' }
  }
}

async function readingForPrompt(prompt: string, complete: LlmComplete) {
  const rawText = await complete(
    [
      { role: 'system', content: readingSystem },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.8, maxTokens: 4000 }
  )
  if (!rawText) return null
  return extractTextsFromResponse(rawText)
}

export async function generateListening(
  body: Record<string, unknown>,
  complete: LlmComplete
): Promise<AiResult> {
  const jobs = promptJobs(body).filter(
    (job): job is ListeningPromptPart => isListeningA2Part(job.part) && nonEmptyString(job.prompt)
  )
  if (jobs.length === 0) return { data: null, error: 'No prompt provided for listening generation.' }
  try {
    const exercises = []
    for (const job of jobs) {
      let partExercises = await listeningForPart(job, difficultyOf(body), complete)
      if (partExercises.length === 0) {
        partExercises = await listeningForPart(job, difficultyOf(body), complete)
      }
      exercises.push(...partExercises)
    }
    if (exercises.length === 0) {
      return {
        data: null,
        error: 'Failed to parse listening exercises from AI response. Please try again.',
      }
    }
    return { data: exercises, error: null }
  } catch (error: unknown) {
    if (error instanceof Error) return { data: null, error: error.message }
    return { data: null, error: 'Failed to generate listening exercises. Please try again.' }
  }
}

async function listeningForPart(
  job: ListeningPromptPart,
  difficulty: Difficulty,
  complete: LlmComplete
) {
  const rawText = await complete(
    [
      { role: 'system', content: listeningSystem },
      { role: 'user', content: job.prompt },
    ],
    { temperature: 0.8, maxTokens: 4000 }
  )
  if (!rawText) return []
  const parsed = extractJsonArray(rawText)
  if (!parsed) return []
  return parsed
    .filter(candidate => isValidForPart(candidate, job.part))
    .map(candidate => normaliseExercise(candidate, job.part, difficulty))
}

export async function generateSpeaking(
  body: Record<string, unknown>,
  complete: LlmComplete
): Promise<AiResult> {
  const jobs = promptJobs(body).filter(
    (job): job is SpeakingPromptPart => isSpeakingA2Part(job.part) && nonEmptyString(job.prompt)
  )
  if (jobs.length === 0) return { data: null, error: 'No prompt provided for speaking generation.' }
  try {
    const topics = []
    for (const job of jobs) {
      let partTopics = await speakingForPart(job, difficultyOf(body), complete)
      if (partTopics.length === 0) partTopics = await speakingForPart(job, difficultyOf(body), complete)
      topics.push(...partTopics)
    }
    if (topics.length === 0) {
      return {
        data: null,
        error: 'Failed to parse speaking topics from AI response. Please try again.',
      }
    }
    return { data: topics, error: null }
  } catch (error: unknown) {
    if (error instanceof Error) return { data: null, error: error.message }
    return { data: null, error: 'Failed to generate speaking topics. Please try again.' }
  }
}

async function speakingForPart(
  job: SpeakingPromptPart,
  difficulty: Difficulty,
  complete: LlmComplete
) {
  const rawText = await complete(
    [
      { role: 'system', content: speakingSystem },
      { role: 'user', content: job.prompt },
    ],
    { temperature: 0.8, maxTokens: 2000 }
  )
  if (!rawText) return []
  const parsed = extractJsonArray(rawText)
  if (!parsed) return []
  return parsed
    .map(candidate => normaliseTopic(candidate, job.part, difficulty))
    .filter((topic): topic is NonNullable<typeof topic> => topic !== null)
}

export async function generateWriting(
  body: Record<string, unknown>,
  complete: LlmComplete
): Promise<AiResult> {
  const prompt = nonEmptyString(body['prompt']) ? body['prompt'] : ''
  if (!prompt) return { data: null, error: 'No prompt provided for writing generation.' }
  try {
    const rawText = await complete(
      [
        { role: 'system', content: writingSystem },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.8, maxTokens: 2500 }
    )
    if (!rawText) return { data: null, error: 'No response from AI.' }
    const topics = extractJsonArray(rawText)
    if (!topics || topics.length === 0) {
      return { data: null, error: 'Failed to parse topics from AI response. Please try again.' }
    }
    const difficulty = difficultyOf(body)
    const part = body['part'] === 2 ? 2 : 1
    const normalizedTopics = topics
      .map(topic => normalizeGeneratedTopic(topic, part, difficulty))
      .filter((topic): topic is NonNullable<typeof topic> => topic !== null)
    if (normalizedTopics.length === 0) {
      return {
        data: null,
        error: 'Generated topics did not match the expected writing exercise shape. Please try again.',
      }
    }
    return {
      data: normalizedTopics.map(topic => ({
        ...topic,
        id: generateTopicId(part, difficulty),
        createdAt: new Date().toISOString(),
      })),
      error: null,
    }
  } catch {
    return {
      data: null,
      error: 'AI topic generation failed. Please check your API key and try again.',
    }
  }
}

export async function generateModelAnswer(
  body: Record<string, unknown>,
  complete: LlmComplete
): Promise<AiResult> {
  const prompt = nonEmptyString(body['prompt']) ? body['prompt'] : ''
  try {
    const rawText = await complete([
      { role: 'system', content: modelAnswerSystem },
      { role: 'user', content: prompt },
    ])
    const data = normalizeModelAnswer(extractJsonObject(rawText ?? ''))
    return data
      ? { data, error: null }
      : { data: null, error: 'Failed to parse model answer from AI response.' }
  } catch {
    return {
      data: null,
      error: 'AI model answer generation failed. Please check your API key and try again.',
    }
  }
}

export async function reviewWriting(
  body: Record<string, unknown>,
  complete: LlmComplete
): Promise<AiResult> {
  const prompt = nonEmptyString(body['prompt']) ? body['prompt'] : ''
  try {
    const rawText = await complete([
      { role: 'system', content: writingReviewSystem },
      { role: 'user', content: prompt },
    ])
    const parsed = extractJsonObject(rawText ?? '')
    const data = isValidA2Review(parsed) ? parsed : null
    return data
      ? { data, error: null }
      : { data: null, error: 'Failed to parse review from AI response.' }
  } catch {
    return { data: null, error: 'AI review failed. Please check your API key and try again.' }
  }
}

export async function reviewSpeaking(
  body: Record<string, unknown>,
  configured: boolean,
  complete: LlmComplete
): Promise<AiResult> {
  if (!configured) {
    return {
      data: null,
      error:
        'AI review is unavailable because no LLM API key is configured. You can still save this attempt.',
    }
  }
  const prompt = nonEmptyString(body['prompt']) ? body['prompt'] : ''
  try {
    const rawText = await complete([
      { role: 'system', content: speakingReviewSystem },
      { role: 'user', content: prompt },
    ])
    const parsed = extractJsonObject(rawText ?? '')
    return isSpeakingReviewData(parsed)
      ? { data: parsed, error: null }
      : { data: null, error: 'The AI response could not be parsed as a speaking review.' }
  } catch {
    return {
      data: null,
      error: 'AI review failed. Check your provider configuration and try again, or save without AI.',
    }
  }
}

export async function reviewMockExam(
  body: Record<string, unknown>,
  configured: boolean,
  complete: LlmComplete
): Promise<AiResult> {
  if (!configured) {
    return { data: null, error: 'AI overview is unavailable because no LLM API key is configured.' }
  }
  const prompt = nonEmptyString(body['prompt']) ? body['prompt'] : ''
  try {
    const raw = await complete(
      [
        { role: 'system', content: mockOverviewSystem },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, maxTokens: 900 }
    )
    const parsed = extractJsonObject(raw ?? '')
    if (!isOverview(parsed)) {
      return { data: null, error: 'The AI overview response could not be read. Please try again.' }
    }
    return {
      data: {
        summary: parsed.summary,
        strengths: parsed.strengths.slice(0, 3),
        focusAreas: parsed.focusAreas.slice(0, 3),
        nextSteps: parsed.nextSteps.slice(0, 3),
      },
      error: null,
    }
  } catch {
    return { data: null, error: 'AI overview generation failed. Please try again.' }
  }
}

/**
 * Modules still on the legacy runner. Entries are removed one at a time as each
 * module moves to the generic prompt path; `PackAiService` falls through for any
 * member that is absent. Reading now runs on the generic path.
 */
export const goetheCompatibilityAi = {
  generateSpeaking,
  generateWriting,
  generateModelAnswer,
  reviewWriting,
  reviewSpeaking,
  reviewMockExam,
}
