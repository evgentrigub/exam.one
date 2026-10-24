# Backend Module Layout

Backend architecture under `apps/backend/src/` is organized into cohesive domain modules alongside `core/` and `config/`:

## Directory Structure

- `config/`: Application configuration and environment variable loading (`app.config.ts`).
- `core/`: Crucial foundation infrastructure (`CoreModule`):
  - `auth/`: Authentication controller, service, token handling, and DTOs.
  - `health/`: Health and readiness controller & service.
  - `email/`: Nodemailer SMTP email service.
  - `guards/`: `JwtAuthGuard`.
  - `interceptors/`: `PackContextInterceptor`, `RequestIdInterceptor`.
  - `decorators/`: `@CurrentUser()`, `@Public()`.
  - `context/`: `active-pack.ts`.
- `users/`: User profile and learning settings (`UsersModule`):
  - `users.controller.ts`, `users.service.ts`
  - `settings.controller.ts`, `settings.service.ts`
- `practice/`: Core practice exercises, attempts, results, and drafts (`PracticeModule`):
  - `exercises.controller.ts`, `exercises.service.ts`
  - `attempts.controller.ts`, `attempts.service.ts`
  - `drafts.controller.ts`, `drafts.service.ts`
  - `results.service.ts`
- `ai/`: Unified LLM gateway and AI generation/review services (`AiModule`):
  - `llm.adapter.ts`, `llm.service.ts`, `llm.controller.ts`
  - `pack-ai.service.ts`, `generate-*.service.ts`, `review.service.ts`
- `speech/`: Speech synthesis and recognition (`SpeechModule`):
  - `tts/`: Kokoro TTS adapter, service, controller, audio slicing/caching utilities.
  - `stt/`: Parakeet STT adapter, service, controller.
- `mock-exam/`: Mock exam set administration and resumable generation jobs (`MockExamModule`):
  - `mock-exam.controller.ts`, `mock-exam.service.ts`
  - `generation-jobs.controller.ts`, `generation-jobs.service.ts`
- `common/`: Shared cross-cutting utilities (`mappers/`, `json.ts`).

## Guidelines

- Inject `PrismaService` from `@exam-one/nestjs-libraries`. Do not construct a second Prisma client.
- Register domain modules in `AppModule`. Core infrastructure is registered globally via `CoreModule`.
- Export services only when another module needs them.
- Provider adapters live beside their owning module/subdomain (`llm.adapter.ts`, `tts.adapter.ts`, `stt.adapter.ts`). Controllers stay thin.
