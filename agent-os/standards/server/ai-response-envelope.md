# AI Response Envelope

Every AI endpoint that calls an LLM provider must return this shape:

```ts
interface AiResponse<T> {
  data: T | null
  error: string | null
}
```

- **Phase 1 / until 2.4:** Nuxt server routes under `server/api/*.post.ts`
- **Phase 2.4 onward:** NestJS owns the long-term AI proxy; keep the same envelope so the frontend composables stay stable

AI is **bring-your-own-key** with a provider-agnostic contract — the key, provider, model, and (optional) base URL come from runtime/env config supplied by the self-hoster. **Supported providers today: OpenAI and OpenRouter.** Never hard-code a single provider into the endpoint contract; isolate provider specifics behind a helper.

## Rules

- **Business failures** (no API key, bad prompt, parse failure, empty AI output) → HTTP 200 with `{ data: null, error: "user-safe message" }`. Do not throw.
- **Infrastructure / programmer errors** (SDK blew up, invalid body, auth) → throw via `createError({ statusCode: 5xx, statusMessage })` in Nitro, or the NestJS equivalent. Produce a real non-200 for infra failures.
- `error` is a short, user-displayable string. Log the full error server-side.
- `data` is `null` whenever `error` is set, and non-null on success. Never both populated.
- Read the AI key/config from runtime config; treat a missing key as a graceful business failure, not a crash.

## Example (Phase 1 Nitro)

```ts
export default defineEventHandler(async (event): Promise<AiResponse<ReadingExercise[]>> => {
  const { llmOpenaiApiKey, llmOpenrouterApiKey, llmProvider } = useRuntimeConfig()
  const apiKey = llmProvider === 'openai' ? llmOpenaiApiKey : llmOpenrouterApiKey
  if (!apiKey) {
    return {
      data: null,
      error: 'AI features are disabled. Add your provider API key to enable them.',
    }
  }

  const body = await readBody<GenerateReadingBody>(event)
  if (!body?.prompt) {
    throw createError({ statusCode: 400, statusMessage: 'Missing prompt' })
  }

  try {
    // callProvider isolates OpenAI / OpenRouter behind one helper.
    const raw = await callProvider(body.prompt)
    const parsed = extractJsonArray<ReadingExercise>(raw)
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
const res = await $fetch<AiResponse<ReadingExercise[]>>('/api/generate-reading', {
  method: 'POST',
  body,
})
if (res.error || !res.data) {
  showError(res.error ?? 'Unknown error')
  return
}
useData(res.data)
```
