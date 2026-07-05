# Offline-First Core

Every core practice flow must work with **zero network**: reading, writing, listening, and speaking practice, mock exam mode, progress, drafts, and navigation. AI is an enhancement layer (exercise generation, review, grading), never a dependency of the core flow.

The product is a **generic, multi-language exam framework** (today: English / Cambridge A2 and German / Goethe A2; designed to extend to any language exam). Keep core logic language-agnostic — never hard-code one language or provider into a core flow.

## Exam references

Before changing exam-specific seed data, prompt templates, scoring, grading, or mock exam behavior, read the matching product reference:

- German / Goethe A2: `agent-os/product/german-exam-A2.md`

Keep the shared data model and UI flow exam-agnostic, then express exam-specific behavior through typed metadata, task definitions, prompt templates, and review rules.

## Static seed data

All built-in content lives as typed TS modules under `data/{skill}/`, where `skill` is one of `reading`, `writing`, `listening`, `speaking`:

```
data/
  reading/
    exerciseReading.ts                  # default seed exercises
    a2/exerciseGeneratorReadingA2.ts    # editable demo prompt template
  writing/
    exerciseWriting.ts
    exerciseTips.ts
    a2/exerciseGeneratorWritingA2.ts
    a2/reviewWritingA2.ts
    a2/answerGeneratorWritingA2.ts
  listening/
    exerciseListening.ts
    a2/exerciseGeneratorListeningA2.ts
  speaking/
    exerciseSpeaking.ts
    a2/reviewSpeakingA2.ts
```

- Each file exports typed arrays / functions (never untyped JSON)
- Imported directly; Vite bundles at build time — no runtime fetch
- Defaults are an **immutable seed**. Never mutate the default array at runtime.
- The bundled prompt templates that generate / review / grade exercises are **editable demo templates** — ship them as seed data the user can override, the same way exercises are seeded.

## Seed + merge on load

Composables that own list data follow this lifecycle:

1. On first client load, if localStorage is empty, seed from the static defaults and persist
2. On subsequent loads, **merge**: `items = defaults ∪ stored.filter(x => !isDefault(x.id))`
3. When writing to localStorage, **only persist non-default items** (user-generated / AI-generated)

```ts
const defaultIds = new Set(defaultReadingTopics.map((t) => t.id))
const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]') as ReadingExercise[]
const extras = stored.filter((t) => !defaultIds.has(t.id))
texts.value = [...defaultReadingTopics, ...extras]
```

Why: defaults can ship new items via updates without bloating each user's localStorage, and user deletions can't wipe the seed.

## Rules

- A feature does not "require" the network if turning off AI still lets the user read, write, listen, speak, run a mock exam, and track progress
- Do not import a provider SDK (e.g. `openai`) or call `/api/*` from core flows — route through a composable that degrades gracefully (see `server/ai-response-envelope.md`)
- AI is **bring-your-own-key and provider-agnostic**; core UI must render fine when every AI endpoint returns `{ data: null, error: ... }` (no key configured, provider down, etc.)
- New feature areas / exam skills add a `data/{skill}/` module with typed exports; do not ship unseeded empty states
- Phase 1 is frontend-only (localStorage). Keep core data client-side; do not introduce a required backend/database for core flows (that is Phase 2)
