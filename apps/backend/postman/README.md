# Backend API collection (v1.0.0)

Import `exam-one-backend.postman_collection.json` into Postman. It provides complete coverage for all mounted NestJS `/api/v1` controllers, with full parity to the Swagger OpenAPI specification.

## Interactive Swagger Documentation

Comprehensive interactive documentation with full schemas, models, security requirements, and execution samples is served at:
**`http://localhost:3001/api/docs`** (available in local `pnpm dev` and in Compose when `SWAGGER_ENABLED=true`).

## Start here

1. Set `baseUrl`, `email` and `password` in collection variables. Defaults target `http://localhost:3001`; adjust if running on a custom port.
2. Run **Health → Readiness**, then **Auth → Register** or **Login**. Keep Postman's cookie jar enabled: authentication uses HTTP-only cookies (`exam_one_access`, `exam_one_refresh`), not a bearer token variable.
3. Leave `packId=goethe-de-a2` for the production pack. **Settings → Update me** selects that pack and derives its language/CEFR. Practice, speech, and mock requests send `x-exam-pack: {{packId}}` explicitly. Disable the header to test resolution from the user's active settings.
4. Choose `skill` (`READING`, `WRITING`, `LISTENING`, `SPEAKING`) and run **Exercises → List catalog**. It captures the first `exerciseExternalId` and `exercisePayload`, plus a skill-specific topic variable when applicable. Change them to select another exercise.

Use individual requests as a manual API toolbox. Running the whole collection also invokes password changes, logout, writes, resets/deletes, and optional provider calls; it is not intended as an unattended smoke-test sequence.

## Practice and history

- Generate an exercise with the selected pack's complete assembled generator prompt in `generationPrompt`. Set `part` and `cefr` consistently with that pack. Generation requests capture the first returned payload, ID, and skill. Save it through **Exercises → Save generated exercise** before submitting an attempt.
- The prompt examples are explicit placeholders: assemble the actual PromptSpec from `data/`, or copy the prompt shown/sent by the app. Generic packs use server-side pack prompts; legacy Goethe provider paths still accept the assembled prompt body. No live official A1 pack is bundled.
- Set `answers` to a JSON object matching the exercise. Generic objective tasks use question IDs and zero-based option indices. Goethe objective practice uses `{"responses":{"question-id":0}}`. Generic writing and recording use configured field/segment IDs.
- **Attempts → Create attempt** captures `attemptId`. The API creates the rendering/grading snapshot; clients do not submit one. **Get attempt detail** returns it with the answers and result.
- `history=true` lists all packs for the chosen skill. The explicit C1 examples use `historyPackId=goethe-de-c1`; set `skill=WRITING` and copy an ID into `historyAttemptId`. Reads remain owner-scoped. New C1 practice, grading, and settings selection are unavailable.
- Review endpoints require complete topic/answer context. Use `review` for a full returned criterion review when saving generic feedback; the writing and speaking screens persist their own wrappers around it, which the pack adapter unwraps. Fractional scores are supported, and invalid totals are rejected.

JSON-object variables such as `answers`, `exercisePayload`, `review`, `generatedMockSet`, and `mockState` are inserted as raw JSON, without quotes. Initial `{}` values are templates to replace with actual data. Collection-level pre-request code JSON-escapes prompt and writing text variables, allowing multiline content safely.

## Drafts, jobs, mocks and speech

- Drafts are scoped to user and pack; their JSON payloads are owned by the originating frontend flow. Background jobs (`/jobs`) run on the server through BullMQ and list across all of a user's packs; enqueue requests capture `jobId` for the cancel, retry and dismiss requests. Live updates stream from `GET /jobs/stream` (SSE), which Postman can open but not assert on.
- `mockSetId` defaults to bundled `goethe-a2-set-1` for reads. To save a generated set, provide its complete factory output in `generatedMockSet`; use that generated ID for deletion. Mock definitions retain timing, replay, scoring, and pass rules. A pack without a mock factory cannot create mock sets.
- TTS/STT read language and capabilities from the selected pack. Unsupported speech or missing optional services return explicit business errors (`{ data: null, error: "..." }`); do not assume HTTP 200 means `data` is present. **STT → Transcribe recording** requires choosing a local file in the multipart `file` field (maximum 25 MiB). Do not manually set its Content-Type boundary. TTS generation captures `audioMap` for the exercise audio update request.

There is no HTTP pack-list endpoint: packs are registered in `data/src/registry.ts`. Prompt override routes are unmounted and intentionally excluded from this collection.
