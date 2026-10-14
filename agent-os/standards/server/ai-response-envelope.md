# AI Response Envelope

Every AI endpoint that calls an LLM provider must return this shape:

```ts
interface AiResponse<T> {
  data: T | null
  error: string | null
}
```

- NestJS owns the AI/TTS/STT proxy under `/api/v1` (`/llm`, `/ai`, `/tts`, `/stt`). Keep this envelope so frontend composables stay stable.
- Shared type: `AiResponse<T>` in `@exam-one/contracts` (distinct from REST `ApiResponse`, whose `error` is `{ code, message }`).

AI is **bring-your-own-key, per user** with a provider-agnostic contract — each user saves a key, provider, model, fallback models and reasoning effort in Settings → AI provider (`/settings/llm`). Keys are encrypted at rest with `SECRETS_ENCRYPTION_KEY` and never returned to the client. **Supported providers: OpenAI, OpenRouter, Gemini, Anthropic and xAI**, all through the `openai` SDK with per-provider presets in `ai/llm-providers.ts`. Never hard-code a single provider into the endpoint contract; isolate provider specifics behind the presets.

## Rules

- **Business failures** (no API key, bad prompt, parse failure, empty AI output, TTS/STT offline) → HTTP 200 with `{ data: null, error: "user-safe message" }`. Do not throw.
- **Invalid body** → HTTP 400. **Missing session** → HTTP 401.
- `error` is a short, user-displayable string. Log the full error server-side.
- `data` is `null` whenever `error` is set, and non-null on success. Never both populated.
- Resolve the AI config through `LlmService` (current user from `packContext`); treat a missing key as a graceful business failure, not a crash.

## Example (NestJS)

```ts
@Post('generate-reading')
@HttpCode(200)
async generateReading(@Body() body: GenerateReadingDto): Promise<AiResponse<ReadingExercise[]>> {
  if (!(await this.llm.hasConfig())) {
    return { data: null, error: this.llm.missingKeyError() }
  }
  const parsed = await this.generate(body)
  if (!parsed) {
    return { data: null, error: 'Could not parse AI response. Please try again.' }
  }
  return { data: parsed, error: null }
}
```

## Client side

```ts
const res = await aiFetch<ReadingExercise[]>('/ai/generate-reading', {
  method: 'POST',
  body,
})
if (res.error || !res.data) {
  showError(res.error ?? 'Unknown error')
  return
}
useData(res.data)
```

Do not reuse `apiFetch` for these routes: it throws on any `error` object and expects the REST `{ code, message }` shape.
