import type { H3Event } from 'h3'
import type { GermanText, Difficulty } from '~/utils/types'
import { generateReadingId } from '~/utils/uuid'

interface PromptPart {
  part: 1 | 2 | 3 | 4
  prompt: string
}

interface GenerateReadingRequestBody {
  /** Single-prompt path (used by C1). */
  prompt?: string
  /** Multi-part path (used by A2): one prompt per Goethe Lesen Teil. */
  prompts?: PromptPart[]
  difficulty: Difficulty
}

interface GenerateReadingResponse {
  texts: GermanText[]
  error?: string
}

/**
 * Extract and parse a GermanText array from an OpenAI response. Handles both
 * fenced ```json blocks and a raw bracket-delimited array.
 */
function extractTextsFromResponse(rawText: string): GermanText[] | null {
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

/**
 * Normalise a raw, AI-generated exercise into a storage/quiz-ready GermanText:
 * assign unique IDs, force the requested part metadata, and coerce question
 * answers to numeric indices so the quiz UI can render them uniformly.
 */
function normaliseText(
  text: GermanText,
  difficulty: Difficulty,
  part: 1 | 2 | 3 | 4 | undefined
): GermanText {
  const textId = generateReadingId(difficulty)

  const questions = text.questions?.map((question, questionIndex) => ({
    ...question,
    id: `${textId}-q${questionIndex + 1}`,
    textId,
    correctAnswer: Number(question.correctAnswer) || 0
  })) ?? []

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
 * Send a single prompt to OpenAI and return the parsed GermanText array.
 * Returns null when the model produced no parsable array.
 */
async function generateForPrompt(
  client: import('openai').OpenAI,
  prompt: string
): Promise<GermanText[] | null> {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
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
    temperature: 0.8,
    max_tokens: 4000
  })

  const rawText = completion.choices?.[0]?.message?.content ?? ''
  if (!rawText) return null

  return extractTextsFromResponse(rawText)
}

export default defineEventHandler(async (event: H3Event): Promise<GenerateReadingResponse> => {
  const { openaiApiKey } = useRuntimeConfig()
  const body = (await readBody<GenerateReadingRequestBody>(event)) || ({} as GenerateReadingRequestBody)

  if (!openaiApiKey) {
    return {
      texts: [],
      error: 'OpenAI API key not configured. Please set NUXT_OPENAI_API_KEY in your environment.'
    }
  }

  // Normalise the request into a uniform list of { part, prompt } jobs.
  const jobs: PromptPart[] = Array.isArray(body.prompts) && body.prompts.length > 0
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
    const { OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: openaiApiKey })

    // Run all parts in parallel; each part yields one (or more) exercises.
    const results = await Promise.all(
      jobs.map(async (job) => {
        const parsed = await generateForPrompt(client, job.prompt)
        if (!parsed || parsed.length === 0) {
          console.error(`Failed to parse reading texts for part ${job.part}`)
          return [] as GermanText[]
        }
        return parsed.map((text) =>
          normaliseText(text, body.difficulty, isMultiPart ? job.part : undefined)
        )
      })
    )

    const texts = results.flat()

    if (texts.length === 0) {
      return {
        texts: [],
        error: 'Failed to parse reading exercises from AI response. Please try again.'
      }
    }

    console.log(
      `✅ Generated ${texts.length} reading texts for ${body.difficulty}` +
        (isMultiPart ? ` across ${jobs.length} parts` : '')
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
