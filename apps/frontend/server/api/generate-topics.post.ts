import type { H3Event } from 'h3'
import type { WritingExercise, Difficulty } from '~/utils/types'
import { generateTopicId } from '~/utils/uuid'
import { callLlm, getLlmConfig } from '~/server/utils/llm'

interface GenerateTopicsRequestBody {
  prompt: string
  part: 1 | 2
  difficulty?: Difficulty
}

interface GenerateTopicsResponse {
  topics: WritingExercise[]
  data: { topics: WritingExercise[] } | null
  error: string | null
}

function invalidRequestResponse(): GenerateTopicsResponse {
  return {
    topics: [],
    data: null,
    error: 'Invalid topic generation request.',
  }
}

/**
 * Extract and parse WritingTopic array from AI response
 */
function extractTopicsFromResponse(rawText: string): unknown[] | null {
  // Try to find JSON array in markdown code block
  const blockStart = rawText.indexOf('```json')
  const fenceStart = blockStart >= 0 ? blockStart + 7 : -1

  if (fenceStart >= 0) {
    const fenceEnd = rawText.indexOf('```', fenceStart)
    if (fenceEnd > fenceStart) {
      const candidate = rawText.slice(fenceStart, fenceEnd).trim()
      try {
        const parsed = JSON.parse(candidate)
        return Array.isArray(parsed) ? parsed : null
      } catch {
        // fall through to bracket scan
      }
    }
  }

  // Try to find JSON array by brackets
  const firstBracket = rawText.indexOf('[')
  if (firstBracket < 0) return null

  for (let j = rawText.length - 1; j > firstBracket; j--) {
    if (rawText[j] !== ']') continue
    const candidate = rawText.slice(firstBracket, j + 1)
    try {
      const parsed = JSON.parse(candidate)
      return Array.isArray(parsed) ? parsed : null
    } catch {
      // continue trying shorter tails
    }
  }

  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidGenerateTopicsRequest(value: unknown): value is GenerateTopicsRequestBody {
  return (
    isRecord(value) &&
    typeof value['prompt'] === 'string' &&
    value['prompt'].trim().length > 0 &&
    (value['part'] === 1 || value['part'] === 2) &&
    (value['difficulty'] === undefined ||
      value['difficulty'] === 'A2' ||
      value['difficulty'] === 'C1')
  )
}

function stringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : null
}

function normalizeGeneratedTopic(
  value: unknown,
  part: 1 | 2,
  difficulty: Difficulty
): Omit<WritingExercise, 'id' | 'createdAt'> | null {
  if (!isRecord(value)) return null
  const wordCount = value['wordCount']
  const category = stringArray(value['category'])
  const requirements = stringArray(value['requirements'])

  if (!isRecord(wordCount) || !category || !requirements) return null
  if (
    typeof value['title'] !== 'string' ||
    typeof value['topicType'] !== 'string' ||
    typeof value['estimatedTime'] !== 'number' ||
    typeof value['description'] !== 'string' ||
    typeof value['task'] !== 'string' ||
    typeof wordCount['min'] !== 'number' ||
    typeof wordCount['max'] !== 'number'
  ) {
    return null
  }

  return {
    title: value['title'],
    topicType: value['topicType'],
    difficulty,
    testingPart: part,
    estimatedTime: value['estimatedTime'],
    wordCount: {
      min: wordCount['min'],
      max: wordCount['max'],
    },
    category,
    description: value['description'],
    task: value['task'],
    requirements,
  }
}

export default defineEventHandler(async (event: H3Event): Promise<GenerateTopicsResponse> => {
  const config = useRuntimeConfig()
  const llmConfig = getLlmConfig(config)
  const body = await readBody<unknown>(event)

  if (!isValidGenerateTopicsRequest(body)) {
    return invalidRequestResponse()
  }

  if (!llmConfig) {
    return {
      topics: [],
      data: null,
      error:
        'AI topic generation is unavailable because no API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.',
    }
  }

  try {
    const rawText = await callLlm(
      llmConfig,
      [
        {
          role: 'system',
          content:
            'You are an expert Goethe-Institut exam creator. Generate writing topics according to the specifications provided. Return ONLY valid JSON array of WritingTopic objects, no additional text.',
        },
        {
          role: 'user',
          content: body.prompt,
        },
      ],
      { temperature: 0.8, maxTokens: 2500 }
    )

    if (!rawText) {
      return {
        topics: [],
        data: null,
        error: 'No response from AI.',
      }
    }

    const topics = extractTopicsFromResponse(rawText)

    if (!topics || topics.length === 0) {
      console.error('Failed to parse topics from response:', rawText)
      return {
        topics: [],
        data: null,
        error: 'Failed to parse topics from AI response. Please try again.',
      }
    }

    // Replace AI-generated IDs with unique UUIDs to prevent collisions
    const difficulty = body.difficulty || 'A2'
    // Only A2 and C1 are currently supported for generation
    const supportedDifficulty: 'A2' | 'C1' =
      difficulty === 'A2' || difficulty === 'C1' ? difficulty : 'A2'
    const normalizedTopics = topics
      .map(topic => normalizeGeneratedTopic(topic, body.part, supportedDifficulty))
      .filter((topic): topic is Omit<WritingExercise, 'id' | 'createdAt'> => topic !== null)

    if (normalizedTopics.length === 0) {
      return {
        topics: [],
        data: null,
        error:
          'Generated topics did not match the expected writing exercise shape. Please try again.',
      }
    }

    const topicsWithUniqueIds = normalizedTopics.map(topic => ({
      ...topic,
      id: generateTopicId(body.part, supportedDifficulty),
      createdAt: new Date().toISOString(),
    }))

    console.log(
      `✅ Generated ${topicsWithUniqueIds.length} topics for ${body.difficulty || 'C1'} Teil ${body.part} with unique IDs`
    )

    return { topics: topicsWithUniqueIds, data: { topics: topicsWithUniqueIds }, error: null }
  } catch (error: unknown) {
    console.error('Error generating topics:', error)
    return {
      topics: [],
      data: null,
      error: 'AI topic generation failed. Please check your API key and try again.',
    }
  }
})
