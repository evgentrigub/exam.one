const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
export const LLM_MODEL = 'google/gemma-4-31b-it:free'

export interface LlmMessage {
  role: 'system' | 'user'
  content: string
}

export interface LlmOptions {
  temperature?: number
  maxTokens?: number
}

export async function callLlm(
  apiKey: string,
  messages: LlmMessage[],
  opts?: LlmOptions
): Promise<string> {
  const { OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey, baseURL: OPENROUTER_BASE_URL })

  const completion = await client.chat.completions.create({
    model: LLM_MODEL,
    messages,
    ...(opts?.temperature !== undefined && { temperature: opts.temperature }),
    ...(opts?.maxTokens !== undefined && { max_tokens: opts.maxTokens }),
  })

  return completion.choices?.[0]?.message?.content ?? ''
}
