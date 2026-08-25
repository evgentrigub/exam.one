# Contracts DTOs and Mappers

HTTP payloads use types from `@exam-one/contracts`. Never return a Prisma model from a controller or service-to-HTTP path.

```ts
return { data: toExerciseDto(row) }
```

- Map in `apps/backend/src/common/mappers/` (`toUserDto`, `toExerciseDto`, …).
- Dates → ISO strings (`toISOString()`). Date-only fields → `YYYY-MM-DD`.
- Omit secrets (`passwordHash`, token hashes). JSON columns stay `unknown` / `payload`.
- Request bodies are class-validator DTOs in the feature folder; response shapes live in contracts, not duplicated in Nest.
- JSON writes go through `asJson()`; exercise payload ids through `payloadId()` (`common/json.ts`).
