import type { H3Event } from 'h3'
import type { WritingTopic, AiReviewData } from '~/utils/types'

interface ReviewRequestBody {
  topic: WritingTopic
  userContent: string
  prompt: string
}

function tryExtractJsonObject(rawText: string): AiReviewData | null {
  const blockStart = rawText.indexOf('```json')
  const fenceStart = blockStart >= 0 ? blockStart + 7 : -1
  if (fenceStart >= 0) {
    const fenceEnd = rawText.indexOf('```', fenceStart)
    if (fenceEnd > fenceStart) {
      const candidate = rawText.slice(fenceStart, fenceEnd).trim()
      try {
        return JSON.parse(candidate) as AiReviewData
      } catch {
        // fall through to brace scan
      }
    }
  }
  const firstBrace = rawText.indexOf('{')
  if (firstBrace < 0) return null
  for (let j = rawText.length - 1; j > firstBrace; j--) {
    if (rawText[j] !== '}') continue
    const candidate = rawText.slice(firstBrace, j + 1)
    try {
      return JSON.parse(candidate) as AiReviewData
    } catch {
      // continue trying shorter tails
    }
  }
  return null
}

export default defineEventHandler(async (event: H3Event) => {
  const { openaiApiKey } = useRuntimeConfig()
  const body = (await readBody<ReviewRequestBody>(event)) || ({} as ReviewRequestBody)

  // Example server-side OpenAI usage (disabled):
    if (openaiApiKey) {
        const { OpenAI } = await import('openai')
        const client = new OpenAI({ apiKey: openaiApiKey })
        // const completion = await client.chat.completions.create({
        // model: 'gpt-4o-mini',
        // messages: [
        //     { role: 'user', content: body.prompt},
        // ],
        // })
        // const text = completion.choices?.[0]?.message?.content ?? 'No response from OpenAI.'
        const response = await client.responses.create({
            model: "gpt-5",
            input: body.prompt
        });
        const rawText = response.output_text ?? 'No response from OpenAI.'
        const data = tryExtractJsonObject(rawText)
        return { text: rawText, data }
    }
    // Offline mode: return only text for now; client will keep it as plain text
    return { text: 'No API key found to use review service.', data: null }

})


