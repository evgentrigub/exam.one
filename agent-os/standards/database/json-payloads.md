# JSON Payloads

Exam-specific content lives in Json columns (`Exercise.payload`, `Attempt.answers`, `Result.review`, `Draft.payload`, `MockExamSet.content` / `modules`, `GenerationJob.payload`). Prisma stays exam-agnostic.

- Do not add Goethe- or skill-task columns. Typed shapes live in `@exam-one/exam-packs` and `@exam-one/contracts`.
- Add a Prisma column only when you must filter or index it (`skill`, `level`, `source`, `visibility`, `externalId`).
- Write JSON through `asJson()` so Prisma gets `InputJsonValue`.
- Seed upserts replace the whole payload; do not patch nested JSON in SQL.
