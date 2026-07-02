import type { H3Event } from 'h3'
import type {
  SpeakingA2Part,
  SpeakingA2Topic,
  SpeakingFourCards
} from '~/utils/exercises/speaking'
import type { Difficulty } from '~/utils/types'
import { generateSpeakingId } from '~/utils/uuid'
import { callLlm, getLlmConfig, type LlmConfig } from '~/server/utils/llm'

interface SpeakingPromptPart {
  part: SpeakingA2Part
  prompt: string
}

interface GenerateSpeakingRequestBody {
  prompts?: SpeakingPromptPart[]
  difficulty: Difficulty
}

interface GenerateSpeakingResponse {
  topics: SpeakingA2Topic[]
  error?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'A2' || value === 'C1'
}

function isSpeakingA2Part(value: unknown): value is SpeakingA2Part {
  return value === 1 || value === 2
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFourCards(value: unknown): value is SpeakingFourCards {
  return Array.isArray(value) && value.length === 4 && value.every(nonEmptyString)
}

/**
 * Extract and parse a JSON array from an AI response. Handles both fenced
 * ```json blocks and a raw bracket-delimited array. Mirrors generate-reading.
 */
function extractArrayFromResponse(rawText: string): unknown[] | null {
  const blockStart = rawText.indexOf('```json')
  const fenceStart = blockStart >= 0 ? blockStart + 7 : -1

  if (fenceStart >= 0) {
    const fenceEnd = rawText.indexOf('```', fenceStart)
    if (fenceEnd > fenceStart) {
      const candidate = rawText.slice(fenceStart, fenceEnd).trim()
      try {
        const parsed: unknown = JSON.parse(candidate)
        if (Array.isArray(parsed)) return parsed
      } catch {
        // fall through to bracket scan
      }
    }
  }

  const firstBracket = rawText.indexOf('[')
  if (firstBracket < 0) return null

  for (let j = rawText.length - 1; j > firstBracket; j--) {
    if (rawText[j] !== ']') continue
    const candidate = rawText.slice(firstBracket, j + 1)
    try {
      const parsed: unknown = JSON.parse(candidate)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // continue trying shorter tails
    }
  }

  return null
}

/**
 * Validate + normalise a single raw topic into a storage-ready SpeakingA2Topic.
 * The prompts omit id/createdAt/topicType — we inject them here.
 */
function normaliseTopic(
  value: unknown,
  part: SpeakingA2Part,
  difficulty: Difficulty
): SpeakingA2Topic | null {
  if (!isRecord(value) || !nonEmptyString(value['theme'])) return null

  const id = generateSpeakingId(part, difficulty)
  const createdAt = new Date().toISOString()
  // testingPart/difficulty/topicType are forced server-side regardless of model output.
  const supportedDifficulty = 'A2' as const

  if (part === 1) {
    if (!isFourCards(value['cards'])) return null
    return {
      id,
      testingPart: 1,
      topicType: 'interview',
      difficulty: supportedDifficulty,
      theme: value['theme'],
      cards: value['cards'],
      createdAt
    }
  }

  if (!isFourCards(value['keywords'])) return null
  return {
    id,
    testingPart: 2,
    topicType: 'monologue',
    difficulty: supportedDifficulty,
    theme: value['theme'],
    keywords: value['keywords'],
    createdAt
  }
}

async function generateForPart(
  llmConfig: LlmConfig,
  job: SpeakingPromptPart,
  difficulty: Difficulty
): Promise<SpeakingA2Topic[]> {
  const rawText = await callLlm(
    llmConfig,
    [
      {
        role: 'system',
        content:
          'You are an expert Goethe-Institut exam creator. Generate speaking topics according to the specifications provided. Return ONLY a valid JSON array of topic objects, no additional text.'
      },
      { role: 'user', content: job.prompt }
    ],
    { temperature: 0.8, maxTokens: 2000 }
  )

  if (!rawText) return []

  const parsed = extractArrayFromResponse(rawText)
  if (!parsed) {
    console.error(`Failed to parse speaking topics for part ${job.part}`)
    return []
  }

  return parsed
    .map(candidate => normaliseTopic(candidate, job.part, difficulty))
    .filter((topic): topic is SpeakingA2Topic => topic !== null)
}

export default defineEventHandler(async (event: H3Event): Promise<GenerateSpeakingResponse> => {
  const config = useRuntimeConfig()
  const llmConfig = getLlmConfig(config)
  const body = (await readBody<GenerateSpeakingRequestBody>(event)) || ({} as GenerateSpeakingRequestBody)

  if (!llmConfig) {
    return {
      topics: [],
      error: 'AI features are unavailable because no API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.'
    }
  }

  if (!isDifficulty(body.difficulty)) {
    return { topics: [], error: 'Unsupported speaking difficulty. Expected A2 or C1.' }
  }

  const jobs = (Array.isArray(body.prompts) ? body.prompts : []).filter(
    (job): job is SpeakingPromptPart => isRecord(job) && isSpeakingA2Part(job.part) && nonEmptyString(job.prompt)
  )

  if (jobs.length === 0) {
    return { topics: [], error: 'No prompt provided for speaking generation.' }
  }

  try {
    // Sequential (one prompt at a time) + one retry per part: the free upstream
    // model rate-limits concurrent calls, which silently drops parts.
    const topics: SpeakingA2Topic[] = []
    for (const job of jobs) {
      let partTopics = await generateForPart(llmConfig, job, body.difficulty)
      if (partTopics.length === 0) {
        partTopics = await generateForPart(llmConfig, job, body.difficulty)
      }
      topics.push(...partTopics)
    }

    if (topics.length === 0) {
      return { topics: [], error: 'Failed to parse speaking topics from AI response. Please try again.' }
    }

    console.log(`✅ Generated ${topics.length} speaking topics for ${body.difficulty} across ${jobs.length} parts`)
    return { topics }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { topics: [], error: error.message }
    }
    console.error('Error generating speaking topics:', error)
    return { topics: [], error: 'Failed to generate speaking topics. Please try again.' }
  }
})
