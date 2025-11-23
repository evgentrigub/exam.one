import type { H3Event } from 'h3'
import type { GermanText, Difficulty } from '~/utils/types'
import { generateReadingId } from '~/utils/uuid'

interface GenerateReadingRequestBody {
  prompt: string
  difficulty: Difficulty
}

interface GenerateReadingResponse {
  texts: GermanText[]
  error?: string
}

/**
 * Extract and parse GermanText array from OpenAI response
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
 * Generate unique question IDs for all questions in all texts
 */
function generateQuestionIds(texts: GermanText[], difficulty: Difficulty): GermanText[] {
  return texts.map((text) => {
    const textId = generateReadingId(difficulty)
    
    // Map questions with generated IDs, or use empty array if no questions
    const questions = text.questions?.map((question, questionIndex) => ({
      ...question,
      id: `${textId}-q${questionIndex + 1}`,
      textId
    })) ?? []
    
    return {
      ...text,
      id: textId,
      difficulty,
      createdAt: new Date().toISOString(),
      questions
    }
  })
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

  try {
    const { OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: openaiApiKey })

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert Goethe-Institut exam creator. Generate reading comprehension exercises according to the specifications provided. Return ONLY valid JSON array of GermanText objects with questions, no additional text.'
        },
        { 
          role: 'user', 
          content: body.prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    })

    const rawText = completion.choices?.[0]?.message?.content ?? ''
    
    if (!rawText) {
      return { 
        texts: [],
        error: 'No response from OpenAI.'
      }
    }

    const texts = extractTextsFromResponse(rawText)
    
    if (!texts || texts.length === 0) {
      console.error('Failed to parse reading texts from response:', rawText)
      return { 
        texts: [],
        error: 'Failed to parse reading exercises from AI response. Please try again.'
      }
    }

    // Replace AI-generated IDs with unique UUIDs and ensure all nested IDs are set
    const textsWithUniqueIds = generateQuestionIds(texts, body.difficulty)

    console.log(`✅ Generated ${textsWithUniqueIds.length} reading texts for ${body.difficulty} with unique IDs`)

    return { texts: textsWithUniqueIds }

  } catch (error: unknown) {
    if (error instanceof Error) {
      return { 
        texts: [],
        error: error.message
      }
    } else {
      console.error('Error generating reading exercises:', error)
      return { 
        texts: [],
        error: 'Failed to generate reading exercises. Please try again.'
      }
    }
  }
})

