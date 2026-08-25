# Exception Codes

REST failures throw Nest HTTP exceptions with `{ code, message }`. Do not return `{ error }` on HTTP 200.

```ts
throw new NotFoundException({
  code: 'EXERCISE_NOT_FOUND',
  message: 'Exercise not found',
})
```

- `code` is SCREAMING_SNAKE_CASE, usually `DOMAIN_REASON` (`SET_NOT_FOUND`, `EMAIL_TAKEN`, `SEED_LOCKED`).
- `message` is user-safe English. Tests assert on `code`, not message text.
- Reuse an existing code when the meaning matches. Do not invent parallel spellings.
- Codes are inline at throw sites today. A shared enum/registry is the intended home — do not scatter a second format while that refactor is pending.
- ValidationPipe 400s stay class-validator messages; do not wrap those as custom codes.
