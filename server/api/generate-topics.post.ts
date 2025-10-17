import type { H3Event } from 'h3'
import type { WritingTopic } from '~/utils/types'
import { generateTopicId } from '~/utils/uuid'

interface GenerateTopicsRequestBody {
  prompt: string
  part: 1 | 2
}

interface GenerateTopicsResponse {
  topics: WritingTopic[]
  error?: string
}

/**
 * Extract and parse WritingTopic array from OpenAI response
 */
function extractTopicsFromResponse(rawText: string): WritingTopic[] | null {
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

export default defineEventHandler(async (event: H3Event): Promise<GenerateTopicsResponse> => {
  const { openaiApiKey } = useRuntimeConfig()
  const body = (await readBody<GenerateTopicsRequestBody>(event)) || ({} as GenerateTopicsRequestBody)

  if (!openaiApiKey) {
    return { 
      topics: [],
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
          content: 'You are an expert Goethe-Institut exam creator. Generate writing topics according to the specifications provided. Return ONLY valid JSON array of WritingTopic objects, no additional text.'
        },
        { 
          role: 'user', 
          content: body.prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2500,
    })

    const rawText = completion.choices?.[0]?.message?.content ?? ''
    
    if (!rawText) {
      return { 
        topics: [],
        error: 'No response from OpenAI.'
      }
    }

    const topics = extractTopicsFromResponse(rawText)
    
    if (!topics || topics.length === 0) {
      console.error('Failed to parse topics from response:', rawText)
      return { 
        topics: [],
        error: 'Failed to parse topics from AI response. Please try again.'
      }
    }

    // Replace AI-generated IDs with unique UUIDs to prevent collisions
    const topicsWithUniqueIds = topics.map(topic => ({
      ...topic,
      id: generateTopicId(body.part),
      createdAt: new Date().toISOString()
    }))

    console.log(`✅ Generated ${topicsWithUniqueIds.length} topics for Teil ${body.part} with unique IDs`)

    return { topics: topicsWithUniqueIds }

  } catch (error: any) {
    console.error('Error generating topics:', error)
    return { 
      topics: [],
      error: error?.message || 'Failed to generate topics. Please try again.'
    }
  }
})

