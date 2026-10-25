# REST Response Envelope

REST endpoints return `{ data }` (`ApiResponse<T>` in `@exam-one/contracts`). `apiFetch` unwraps `data` and throws `ApiClientError` on failure.

```ts
{
  data: T
} // success, HTTP 2xx
throw new NotFoundException({
  // failure, HTTP 4xx/5xx
  code: 'EXERCISE_NOT_FOUND',
  message: 'Exercise not found',
})
```

- Do not return raw payloads.
- Do not reuse the AI envelope (`error: string | null` + HTTP 200). That is only for `/llm`, `/ai`, `/tts`, `/stt`.
- Success omits `error`. Controllers return `{ data }` only.
- Message-only actions use `MessageResponse` = `ApiResponse<{ message: string }>`.
- `/health/ready` still uses the envelope; throw HTTP 503 when the DB is down.
- Callers use `apiFetch`, not `aiFetch`.
