import type { H3Event } from 'h3'
import type {
  ListeningA2Exercise,
  ListeningA2Part,
  ListeningExerciseA2Teil1,
  ListeningExerciseA2Teil2,
  ListeningExerciseA2Teil3,
  ListeningExerciseA2Teil4,
  ListeningItemA2Teil1,
  ListeningItemA2Teil3,
  ListeningQuestionA2Teil2,
  ListeningQuestionA2Teil4
} from '~/utils/exercises/listening'
import type { Difficulty } from '~/utils/types'
import { generateListeningId } from '~/utils/uuid'
import { callLlm, getLlmConfig, type LlmConfig } from '~/server/utils/llm'

interface ListeningPromptPart {
  part: ListeningA2Part
  prompt: string
}

interface GenerateListeningRequestBody {
  prompts?: ListeningPromptPart[]
  difficulty: Difficulty
}

interface GenerateListeningResponse {
  exercises: ListeningA2Exercise[]
  error?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'A2' || value === 'C1'
}

function isListeningA2Part(value: unknown): value is ListeningA2Part {
  return value === 1 || value === 2 || value === 3 || value === 4
}

function isStringArrayOfLength(value: unknown, length: number): value is string[] {
  return Array.isArray(value) && value.length === length && value.every(item => typeof item === 'string')
}

function isIndexInRange(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

// --- Per-part validators (mirror the discriminated union in utils/exercises/listening.ts) ---

function isTeil1Item(value: unknown): value is ListeningItemA2Teil1 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['context']) &&
    nonEmptyString(value['transcript']) &&
    nonEmptyString(value['question']) &&
    isStringArrayOfLength(value['options'], 3) &&
    isIndexInRange(value['correctAnswer'], 2) &&
    nonEmptyString(value['explanation'])
  )
}

function isTeil3Item(value: unknown): value is ListeningItemA2Teil3 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['question']) &&
    nonEmptyString(value['transcript']) &&
    isStringArrayOfLength(value['options'], 3) &&
    isIndexInRange(value['correctAnswer'], 2) &&
    nonEmptyString(value['explanation'])
  )
}

function isTeil2Question(value: unknown): value is ListeningQuestionA2Teil2 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['person']) &&
    isIndexInRange(value['correctAnswer'], 8) &&
    nonEmptyString(value['explanation'])
  )
}

function isTeil4Question(value: unknown): value is ListeningQuestionA2Teil4 {
  if (!isRecord(value)) return false
  return (
    nonEmptyString(value['statement']) &&
    typeof value['correctAnswer'] === 'boolean' &&
    nonEmptyString(value['explanation']) &&
    value['type'] === 'true_false'
  )
}

function hasFiveItems(value: unknown, predicate: (item: unknown) => boolean): boolean {
  return Array.isArray(value) && value.length === 5 && value.every(predicate)
}

function isValidForPart(value: unknown, part: ListeningA2Part): value is ListeningA2Exercise {
  if (!isRecord(value)) return false
  if (!nonEmptyString(value['title'])) return false

  if (part === 1) return hasFiveItems(value['items'], isTeil1Item)
  if (part === 3) return hasFiveItems(value['items'], isTeil3Item)
  if (part === 2) {
    return (
      nonEmptyString(value['context']) &&
      nonEmptyString(value['transcript']) &&
      isStringArrayOfLength(value['options'], 9) &&
      hasFiveItems(value['questions'], isTeil2Question)
    )
  }
  // part === 4
  return (
    nonEmptyString(value['context']) &&
    nonEmptyString(value['transcript']) &&
    hasFiveItems(value['questions'], isTeil4Question)
  )
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
 * Normalise a validated exercise: assign a unique exercise id + createdAt, force
 * the requested part and difficulty, and assign nested item/question ids.
 */
function normaliseExercise(
  exercise: ListeningA2Exercise,
  part: ListeningA2Part,
  difficulty: Difficulty
): ListeningA2Exercise {
  const id = generateListeningId(part, difficulty)
  const createdAt = new Date().toISOString()
  // The listening union is A2-only (ListeningDifficulty = 'A2'); force the literal.
  const base = { id, difficulty: 'A2' as const, createdAt }

  if (part === 1) {
    const ex = exercise as ListeningExerciseA2Teil1
    return {
      ...ex,
      ...base,
      testingPart: 1,
      items: ex.items.map((item, i) => ({ ...item, id: `${id}-i${i + 1}` })) as ListeningExerciseA2Teil1['items']
    }
  }

  if (part === 3) {
    const ex = exercise as ListeningExerciseA2Teil3
    return {
      ...ex,
      ...base,
      testingPart: 3,
      items: ex.items.map((item, i) => ({ ...item, id: `${id}-i${i + 1}` })) as ListeningExerciseA2Teil3['items']
    }
  }

  if (part === 2) {
    const ex = exercise as ListeningExerciseA2Teil2
    return {
      ...ex,
      ...base,
      testingPart: 2,
      questions: ex.questions.map((q, i) => ({ ...q, id: `${id}-q${i + 1}` })) as ListeningExerciseA2Teil2['questions']
    }
  }

  const ex = exercise as ListeningExerciseA2Teil4
  return {
    ...ex,
    ...base,
    testingPart: 4,
    questions: ex.questions.map((q, i) => ({ ...q, id: `${id}-q${i + 1}` })) as ListeningExerciseA2Teil4['questions']
  }
}

async function generateForPart(
  llmConfig: LlmConfig,
  job: ListeningPromptPart,
  difficulty: Difficulty
): Promise<ListeningA2Exercise[]> {
  const rawText = await callLlm(
    llmConfig,
    [
      {
        role: 'system',
        content:
          'You are an expert Goethe-Institut exam creator. Generate listening comprehension exercises according to the specifications provided. Return ONLY a valid JSON array of exercise objects, no additional text.'
      },
      { role: 'user', content: job.prompt }
    ],
    { temperature: 0.8, maxTokens: 4000 }
  )

  if (!rawText) return []

  const parsed = extractArrayFromResponse(rawText)
  if (!parsed) {
    console.error(`Failed to parse listening exercises for part ${job.part}`)
    return []
  }

  return parsed
    .filter((candidate): candidate is ListeningA2Exercise => isValidForPart(candidate, job.part))
    .map(candidate => normaliseExercise(candidate, job.part, difficulty))
}

export default defineEventHandler(async (event: H3Event): Promise<GenerateListeningResponse> => {
  const config = useRuntimeConfig()
  const llmConfig = getLlmConfig(config)
  const body = (await readBody<GenerateListeningRequestBody>(event)) || ({} as GenerateListeningRequestBody)

  if (!llmConfig) {
    return {
      exercises: [],
      error: 'AI features are unavailable because no API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.'
    }
  }

  if (!isDifficulty(body.difficulty)) {
    return { exercises: [], error: 'Unsupported listening difficulty. Expected A2 or C1.' }
  }

  const jobs = (Array.isArray(body.prompts) ? body.prompts : []).filter(
    (job): job is ListeningPromptPart => isRecord(job) && isListeningA2Part(job.part) && nonEmptyString(job.prompt)
  )

  if (jobs.length === 0) {
    return { exercises: [], error: 'No prompt provided for listening generation.' }
  }

  try {
    console.log(`[exam.one][listening] queue parts=${jobs.map(j => j.part).join(',')}`)

    // Sequential (one prompt at a time) + one retry per part: the free upstream
    // model rate-limits concurrent calls, which silently drops parts.
    const exercises: ListeningA2Exercise[] = []
    for (const job of jobs) {
      console.log(`[exam.one][listening] start part=${job.part}`)
      let partExercises = await generateForPart(llmConfig, job, body.difficulty)
      if (partExercises.length === 0) {
        partExercises = await generateForPart(llmConfig, job, body.difficulty)
      }
      if (partExercises.length === 0) {
        console.error(`[exam.one][listening] failed part=${job.part} reason=parse_error`)
      } else {
        console.log(`[exam.one][listening] done part=${job.part} exercises=${partExercises.length}`)
      }
      exercises.push(...partExercises)
    }

    if (exercises.length === 0) {
      return { exercises: [], error: 'Failed to parse listening exercises from AI response. Please try again.' }
    }

    console.log(`[exam.one][listening] complete exercises=${exercises.length} difficulty=${body.difficulty} parts=${jobs.length}`)
    return { exercises }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { exercises: [], error: error.message }
    }
    console.error('Error generating listening exercises:', error)
    return { exercises: [], error: 'Failed to generate listening exercises. Please try again.' }
  }
})
