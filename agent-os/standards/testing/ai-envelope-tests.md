# AI Envelope Tests

AI business failures resolve to `{ data: null, error: '…' }`. Do not expect a thrown `HttpException` for missing keys or parse failures.

```ts
await expect(service.generate(...)).resolves.toEqual({
  data: null,
  error: expect.any(String),
})
```

- Mock `LlmService` (`getConfig`, `complete`, `missingKeyError`). No network, no real API keys.
- Cover at least: no config, unparseable model output.
- Invalid body still HTTP 400 (pipe). Missing session still HTTP 401 (guard). Those stay thrown exceptions.
