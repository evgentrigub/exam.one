# Backend API exploration

[Back to the application](../../../README.md#project-structure)

The [Postman collection](exam-one-backend.postman_collection.json) is a manual toolbox for exam.one's NestJS API: accounts, practice, reviews, drafts, jobs, mocks, speech, and media. Shared endpoints operate against a selected exam pack rather than a particular language.

Swagger at `http://localhost:3001/api/docs` describes the running API. It is available in local development and in Compose when `SWAGGER_ENABLED=true`. Check mounted controllers/Swagger when extending the API; collection examples may need updates as contracts evolve.

## Start here

1. Set `baseUrl`, `email`, and `password`. The default API origin is `http://localhost:3001`.
2. Run **Health → Readiness**, then register or sign in. Keep the cookie jar enabled: auth uses httpOnly `exam_one_access` and `exam_one_refresh` cookies.
3. Choose `packId` from the [registry](../../../data/src/registry.ts). The collection's existing examples default to `goethe-de-a2`; the app's new-account default is `cambridge-en-a2`. Update part, level, exercise, and mock IDs together when selecting another pack.
4. **Settings → Update me** persists the pack selection. Practice requests send `x-exam-pack: {{packId}}`; disabling it exercises selection from the user's settings.
5. Choose a skill and list its catalog. Use the captured exercise ID/payload, or select another actual catalog entry.

There is no HTTP pack-list endpoint; availability comes from the package registry. Part numbers are skill-specific.

## Practice and reviews

Generation uses the selected pack's server-assembled PromptSpecs. Older collection bodies retain prompt variables; these do not select a separate legacy generator. Check the current request DTO before changing an example. Save generated content through the exercise API before creating a practice attempt, or use the server-owned generation jobs used by the app.

Provide `answers` matching the exercise's fields/question/segment IDs. Objective choices use zero-based indices; typed gaps use strings. The API creates the rendering/rubric snapshot. Historical detail reads remain owner-scoped and use the saved pack/snapshot. `history=true` lists the selected skill across packs; inactive C1 is available for historical reads, not new practice.

Writing and speaking review requests require complete task/answer context. When persisting feedback, retain the validated review shape expected by that pack's adapter. Fractional scores are supported.

Raw JSON variables such as `answers`, `exercisePayload`, `review`, `generatedMockSet`, and `mockState` must contain real JSON rather than quoted JSON strings. Empty objects in the collection are placeholders. Its pre-request code escapes multiline prompt/text variables.

## Jobs, mocks, and media

- `/jobs` lists the user's server-side background jobs across packs. Enqueue captures `jobId` for cancel/retry/dismiss. `GET /jobs/stream` provides SSE updates.
- Mock IDs must belong to the selected pack. The collection's bundled example is `goethe-a2-set-1`; select the appropriate ID for another pack. Generated sets retain timing, replay, scoring, group, and scale rules.
- Speech capability checks use the selected pack's language/voices. Business failures can return `{ data: null, error }` with HTTP 200; inspect the envelope.
- STT multipart requests need a recording in the `file` field, up to 25 MiB. Let Postman set the Content-Type boundary.
- Media endpoints inspect audio and voice models. Generated files are user-scoped; seed WAVs and installed voices are shared instance resources.

Run requests selectively: the collection includes password changes, logout, deletion, and optional provider calls. It is not an unattended smoke suite. Prompt-override routes are unmounted and excluded. For automated browser/stack tests, see the sibling [E2E repository](../../../../exam-one-e2e/README.md).
