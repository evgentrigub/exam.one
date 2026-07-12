import type { H3Event } from 'h3'
import type {
  GeneratedReadingExercise,
  GeneratedReadingQuestion,
  ReadingA2Part,
  ReadingExercise,
  ReadingPromptPart,
  ReadingQuestionType,
  ReadingTextType
} from '~/utils/exercises/reading'
import type { Difficulty } from '~/utils/types'
import { generateReadingId } from '~/utils/uuid'
import { callLlm, getLlmConfig, type LlmConfig } from '~/server/utils/llm'

const readingTextTypes = [
  'email',
  'notice',
  'article',
  'advertisement',
  'instructions',
  'announcement',
  'list'
] satisfies ReadingTextType[]

const readingQuestionTypes = [
  'comprehension',
  'vocabulary',
  'grammar',
  'inference',
  'selective',
  'matching'
] satisfies ReadingQuestionType[]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'A2' || value === 'C1'
}

function isReadingA2Part(value: unknown): value is ReadingA2Part {
  return value === 1 || value === 2 || value === 3 || value === 4
}

function isReadingTextType(value: unknown): value is ReadingTextType {
  return typeof value === 'string' && (readingTextTypes as readonly string[]).includes(value)
}

function isReadingQuestionType(value: unknown): value is ReadingQuestionType {
  return typeof value === 'string' && (readingQuestionTypes as readonly string[]).includes(value)
}

function isAnswerIndex(value: unknown): value is number | string {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)
    return Number.isInteger(numericValue) && numericValue >= 0
  }

  return false
}

function isGeneratedReadingQuestion(value: unknown): value is GeneratedReadingQuestion {
  if (!isRecord(value)) return false

  const id = value['id']
  const textId = value['textId']
  const question = value['question']
  const options = value['options']
  const correctAnswer = value['correctAnswer']
  const explanation = value['explanation']
  const type = value['type']

  return (
    (id === undefined || typeof id === 'string') &&
    (textId === undefined || typeof textId === 'string') &&
    typeof question === 'string' &&
    Array.isArray(options) &&
    options.every((option) => typeof option === 'string') &&
    isAnswerIndex(correctAnswer) &&
    typeof explanation === 'string' &&
    isReadingQuestionType(type)
  )
}

function isGeneratedReadingExercise(value: unknown): value is GeneratedReadingExercise {
  if (!isRecord(value)) return false

  const id = value['id']
  const title = value['title']
  const content = value['content']
  const textType = value['textType']
  const difficulty = value['difficulty']
  const testingPart = value['testingPart']
  const estimatedReadingTime = value['estimatedReadingTime']
  const wordCount = value['wordCount']
  const topics = value['topics']
  const createdAt = value['createdAt']
  const questions = value['questions']

  return (
    (id === undefined || typeof id === 'string') &&
    typeof title === 'string' &&
    typeof content === 'string' &&
    isReadingTextType(textType) &&
    isDifficulty(difficulty) &&
    (testingPart === undefined || isReadingA2Part(testingPart)) &&
    typeof estimatedReadingTime === 'number' &&
    typeof wordCount === 'number' &&
    Array.isArray(topics) &&
    topics.every((topic) => typeof topic === 'string') &&
    (createdAt === undefined || typeof createdAt === 'string') &&
    (questions === undefined ||
      (Array.isArray(questions) && questions.every(isGeneratedReadingQuestion)))
  )
}

function parseGeneratedReadingExercises(candidate: string): GeneratedReadingExercise[] | null {
  try {
    const parsed: unknown = JSON.parse(candidate)
    return Array.isArray(parsed) && parsed.every(isGeneratedReadingExercise) ? parsed : null
  } catch {
    return null
  }
}

interface GenerateReadingRequestBody {
  /** Single-prompt path (used by C1). */
  prompt?: string
  /** Multi-part path (used by A2): one prompt per Goethe Lesen Teil. */
  prompts?: ReadingPromptPart[]
  difficulty: Difficulty
}

interface GenerateReadingResponse {
  texts: ReadingExercise[]
  error?: string
}

/**
 * Extract and parse a GermanText array from an AI response. Handles both
 * fenced ```json blocks and a raw bracket-delimited array.
 */
function extractTextsFromResponse(rawText: string): GeneratedReadingExercise[] | null {
  // Try to find JSON array in markdown code block
  const blockStart = rawText.indexOf('```json')
  const fenceStart = blockStart >= 0 ? blockStart + 7 : -1

  if (fenceStart >= 0) {
    const fenceEnd = rawText.indexOf('```', fenceStart)
    if (fenceEnd > fenceStart) {
      const candidate = rawText.slice(fenceStart, fenceEnd).trim()
      const parsed = parseGeneratedReadingExercises(candidate)
      if (parsed) return parsed
    }
  }

  // Try to find JSON array by brackets
  const firstBracket = rawText.indexOf('[')
  if (firstBracket < 0) return null

  for (let j = rawText.length - 1; j > firstBracket; j--) {
    if (rawText[j] !== ']') continue
    const candidate = rawText.slice(firstBracket, j + 1)
    const parsed = parseGeneratedReadingExercises(candidate)
    if (parsed) return parsed
  }

  return null
}

/**
 * Normalise a raw, AI-generated exercise into a storage/quiz-ready GermanText:
 * assign unique IDs, force the requested part metadata, and coerce question
 * answers to numeric indices so the quiz UI can render them uniformly.
 */
function normaliseText(
  text: GeneratedReadingExercise,
  difficulty: Difficulty,
  part: ReadingA2Part | undefined
): ReadingExercise {
  const textId = generateReadingId(difficulty)

  const questions = text.questions?.map((question, questionIndex) => {
    const answerIndex = Number(question.correctAnswer)

    return {
      ...question,
      id: `${textId}-q${questionIndex + 1}`,
      textId,
      correctAnswer: Number.isInteger(answerIndex) && answerIndex >= 0 ? answerIndex : 0
    }
  }) ?? []

  const wordCount =
    typeof text.wordCount === 'number' && text.wordCount > 0
      ? text.wordCount
      : (text.content?.trim().split(/\s+/).filter(Boolean).length ?? 0)

  return {
    ...text,
    id: textId,
    difficulty,
    ...(part ? { testingPart: part } : {}),
    wordCount,
    createdAt: new Date().toISOString(),
    questions
  }
}

/**
 * Send a single prompt to the LLM and return the parsed GermanText array.
 * Returns null when the model produced no parsable array.
 */
async function generateForPrompt(
  llmConfig: LlmConfig,
  prompt: string
): Promise<GeneratedReadingExercise[] | null> {
  const rawText = await callLlm(
    llmConfig,
    [
      {
        role: 'system',
        content:
          'You are an expert Goethe-Institut exam creator. Generate reading comprehension exercises according to the specifications provided. Return ONLY a valid JSON array of GermanText objects with questions, no additional text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    { temperature: 0.8, maxTokens: 4000 }
  )

  if (!rawText) return null

  return extractTextsFromResponse(rawText)
}

export default defineEventHandler(async (event: H3Event): Promise<GenerateReadingResponse> => {
  const config = useRuntimeConfig()
  const llmConfig = getLlmConfig(config)
  const body = (await readBody<GenerateReadingRequestBody>(event)) || ({} as GenerateReadingRequestBody)

  if (!llmConfig) {
    return {
      texts: [],
      error: 'AI features are unavailable because no API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.'
    }
  }

  if (!isDifficulty(body.difficulty)) {
    return {
      texts: [],
      error: 'Unsupported reading difficulty. Expected A2 or C1.'
    }
  }

  // Normalise the request into a uniform list of { part, prompt } jobs.
  const jobs: ReadingPromptPart[] = Array.isArray(body.prompts) && body.prompts.length > 0
    ? body.prompts
    : body.prompt
      ? [{ part: 1, prompt: body.prompt }]
      : []

  // Single-prompt (C1) requests have no meaningful part metadata to attach.
  const isMultiPart = Array.isArray(body.prompts) && body.prompts.length > 0

  if (jobs.length === 0) {
    return { texts: [], error: 'No prompt provided for reading generation.' }
  }

  try {
    console.log(`[exam.one][reading] queue parts=${jobs.map(j => j.part).join(',')}`)

    // Run parts sequentially (one prompt at a time): the free upstream model
    // rate-limits concurrent calls, which silently drops parts. Retry each part
    // once so a transient parse/timeout failure does not lose a whole exercise.
    const texts: ReadingExercise[] = []
    for (const job of jobs) {
      console.log(`[exam.one][reading] start part=${job.part}`)
      let parsed = await generateForPrompt(llmConfig, job.prompt)
      if (!parsed || parsed.length === 0) {
        parsed = await generateForPrompt(llmConfig, job.prompt)
      }
      if (!parsed || parsed.length === 0) {
        console.error(`[exam.one][reading] failed part=${job.part} reason=parse_error`)
        continue
      }
      texts.push(
        ...parsed.map((text) =>
          normaliseText(text, body.difficulty, isMultiPart ? job.part : undefined)
        )
      )
      console.log(`[exam.one][reading] done part=${job.part} texts=${parsed.length}`)
    }

    if (texts.length === 0) {
      return {
        texts: [],
        error: 'Failed to parse reading exercises from AI response. Please try again.'
      }
    }

    console.log(
      `[exam.one][reading] complete texts=${texts.length} difficulty=${body.difficulty}` +
        (isMultiPart ? ` parts=${jobs.length}` : '')
    )

    return { texts }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { texts: [], error: error.message }
    }
    console.error('Error generating reading exercises:', error)
    return {
      texts: [],
      error: 'Failed to generate reading exercises. Please try again.'
    }
  }
})
