# localStorage Keys

Practice catalogs, progress, drafts, generation jobs, and mock exams are **API-backed**. Do not add new authoritative exam-data keys here.

All remaining app-owned keys in `localStorage` use the `exam-one:` prefix with a colon separator and kebab-case path.

```
exam-one:theme                  # UI preference — stays client-side
```

Related client prefs that are not localStorage keys:

- Locale cookie `exam-one:locale`
- Listening playback volume/speed (session UI prefs)
- Reading “saved texts” bookmarks (non-authoritative)

## Historical practice keys (retired)

These keys are retired. Do not read or write them. The one-time import helper has been removed.

```
exam-one:reading:texts
exam-one:reading:generation-state
exam-one:writing:topics
exam-one:writing:progress
exam-one:writing:session:{topicId}
exam-one:writing:reviews
exam-one:writing:model-answers
exam-one:writing:topic-generation-state
exam-one:listening:exercises
exam-one:listening:audio-overrides
exam-one:listening:progress
exam-one:listening:generation-state
exam-one:speaking:exercises
exam-one:speaking:progress
exam-one:speaking:generation-state
exam-one:mock-exam:sets
exam-one:mock-exam:{setId}
exam-one:mock-exam:generation-state
quiz-progress                   # legacy unprefixed
quiz-session
exame-one-reading-texts
exame-one-writing-topics
writing-progress
writing-session-*
writing-reviews
model-answers
```

**Not implemented:** `exam-one:prompt-templates`, `exam-one:ai-settings`. Prompts stay as TS modules; LLM keys are stored server-side per user, encrypted.

## Rules

- Prefix: `exam-one:` — never `examone:`, `exame-one-`, or bare keys like `theme`
- Separator inside the prefix: `:` (colon)
- Path segments: kebab-case, lowercase
- Structure: `exam-one:<feature>:<what>` (e.g., `exam-one:theme`)
- Define the key as a `const KEY = 'exam-one:...'` at the top of the owning composable / store; never inline string literals in multiple places
- **Secrets stay out of localStorage**. A bring-your-own-key API key is saved through `/settings/llm` and stored encrypted on the server
- **Never call `localStorage.clear()`** — it would wipe theme and other UI prefs

```ts
const STORAGE_KEY = 'exam-one:theme'
```
