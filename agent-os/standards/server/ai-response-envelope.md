# AI Response Envelope

Every `server/api/*.post.ts` endpoint that calls an AI provider must return this shape:

```ts
interface AiResponse<T> {
  data: T | null
  error: string | null
}
```

## Rules

- **Business failures** (no API key, bad prompt, parse failure, empty AI output) → HTTP 200 with `{ data: null, error: "user-safe message" }`. Do not throw.
- **Infrastructure / programmer errors** (SDK blew up, invalid body, auth) → throw via `createError({ statusCode: 5xx, statusMessage })`. Let H3 produce the real non-200.
- `error` is a short, user-displayable string. Log the full error server-side.
- `data` is `null` whenever `error` is set, and non-null on success. Never both populated.

## Example

```ts
export default defineEventHandler(async (event): Promise<AiResponse<GermanText[]>> => {
  const { openaiApiKey } = useRuntimeConfig()
  if (!openaiApiKey) {
    return { data: null, error: 'AI features are disabled on this deployment.' }
  }

  const body = await readBody<GenerateReadingBody>(event)
  if (!body?.prompt) {
    throw createError({ statusCode: 400, statusMessage: 'Missing prompt' })
  }

  try {
    const { OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: openaiApiKey })
    const raw = await callModel(client, body.prompt)
    const parsed = extractJsonArray<GermanText>(raw)
    if (!parsed) {
      return { data: null, error: 'Could not parse AI response. Please try again.' }
    }
    return { data: parsed, error: null }
  } catch (e) {
    console.error('[generate-reading] unexpected error', e)
    throw createError({ statusCode: 502, statusMessage: 'AI provider error' })
  }
})
```

## Client side

```ts
const res = await $fetch<AiResponse<GermanText[]>>('/api/generate-reading', { method: 'POST', body })
if (res.error || !res.data) {
  showError(res.error ?? 'Unknown error')
  return
}
useData(res.data)
```
