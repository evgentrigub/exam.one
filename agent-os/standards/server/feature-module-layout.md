# Feature Module Layout

One folder per resource under `apps/backend/src/`:

```
exercises/
  exercises.module.ts
  exercises.controller.ts
  exercises.service.ts
  dto/exercises.dto.ts
```

- Inject `PrismaService` from `@exam-one/nestjs-libraries`. Do not construct a second Prisma client.
- Register the module in `AppModule`. Export the service only when another module needs it.
- Shared Nest pieces live in `common/` (guards, interceptors, decorators, mappers, json helpers).
- LLM/TTS/STT keep provider adapters beside the module (`llm.adapter.ts`, …). Controllers stay thin.
