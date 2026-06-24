import type { H3Event } from 'h3'
import type { WritingExercise, ModelAnswer } from '~/utils/types'

interface ModelAnswerRequestBody {
  topic: WritingExercise
  prompt: string
}

interface ModelAnswerResponse {
  text: string
  data: Partial<ModelAnswer> | null
  error: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidModelAnswerRequest(value: unknown): value is ModelAnswerRequestBody {
  return isRecord(value)
    && isRecord(value['topic'])
    && typeof value['prompt'] === 'string'
    && value['prompt'].trim().length > 0
}

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : undefined
}

function normalizeModelAnswer(value: unknown): Partial<ModelAnswer> | null {
  if (!isRecord(value) || typeof value['content'] !== 'string' || typeof value['wordCount'] !== 'number') {
    return null
  }

  const highlights = isRecord(value['highlights']) ? value['highlights'] : {}
  const normalizedHighlights: NonNullable<ModelAnswer['highlights']> = {}
  const mainPoints = stringArray(highlights['mainPoints'])
  const keyPhrases = stringArray(highlights['keyPhrases'])

  if (typeof highlights['greeting'] === 'string') normalizedHighlights.greeting = highlights['greeting']
  if (typeof highlights['closing'] === 'string') normalizedHighlights.closing = highlights['closing']
  if (mainPoints) normalizedHighlights.mainPoints = mainPoints
  if (keyPhrases) normalizedHighlights.keyPhrases = keyPhrases

  return {
    content: value['content'],
    wordCount: value['wordCount'],
    ...(Object.keys(normalizedHighlights).length > 0 && { highlights: normalizedHighlights }),
  }
}

function parseModelAnswerCandidate(candidate: string): Partial<ModelAnswer> | null {
  try {
    return normalizeModelAnswer(JSON.parse(candidate) as unknown)
  } catch {
    return null
  }
}

function tryExtractJsonObject(rawText: string): Partial<ModelAnswer> | null {
  const blockStart = rawText.indexOf('```json')
  const fenceStart = blockStart >= 0 ? blockStart + 7 : -1
  if (fenceStart >= 0) {
    const fenceEnd = rawText.indexOf('```', fenceStart)
    if (fenceEnd > fenceStart) {
      const candidate = rawText.slice(fenceStart, fenceEnd).trim()
      const parsed = parseModelAnswerCandidate(candidate)
      if (parsed) return parsed
    }
  }
  const firstBrace = rawText.indexOf('{')
  if (firstBrace < 0) return null
  for (let j = rawText.length - 1; j > firstBrace; j--) {
    if (rawText[j] !== '}') continue
    const candidate = rawText.slice(firstBrace, j + 1)
    const parsed = parseModelAnswerCandidate(candidate)
    if (parsed) return parsed
  }
  return null
}

export default defineEventHandler(async (event: H3Event): Promise<ModelAnswerResponse> => {
  const { openaiApiKey } = useRuntimeConfig()
  const body = await readBody<unknown>(event)

  if (!isValidModelAnswerRequest(body)) {
    return {
      text: '',
      data: null,
      error: 'Invalid model answer generation request.',
    }
  }

  if (!openaiApiKey) {
    return {
      text: '',
      data: null,
      error: 'AI model answers are unavailable because no API key is configured.',
    }
  }

  try {
    const { OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: openaiApiKey })
    
    const response = await client.responses.create({
      model: 'gpt-5',
      input: body.prompt,
    })
    
    const rawText = response.output_text ?? 'No response from OpenAI.'
    const data = tryExtractJsonObject(rawText)
    return { text: rawText, data, error: data ? null : 'Failed to parse model answer from AI response.' }
  } catch (error) {
    console.error('Error generating model answer:', error)
    return {
      text: '',
      data: null,
      error: 'AI model answer generation failed. Please check your API key and try again.',
    }
  }
})

