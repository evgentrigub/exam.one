# Core Practice & Exam Framework

Phase-aware rules for exam practice flows, seed content, and AI. Filename kept as `offline-first-core.md` for existing links; treat this as the **core practice** standard.

The product is a **generic, multi-language / multi-level exam framework** (Phase 1 shipping focus: German / Goethe A2 full skills + Goethe C1 Writing only; designed to extend to any language exam and any difficulty level). Keep core logic language-agnostic — never hard-code one language or provider into a core flow.

AI is an enhancement layer (exercise generation, review, grading), never a hard dependency of the core practice UI.

## Phase boundaries

### Phase 1 (current) — offline-capable frontend

Every core practice flow must work with **zero network**: reading, writing, listening, and speaking practice, mock exam mode, progress, drafts, and navigation. User/exam data lives in localStorage. Do not introduce a required backend or database for core flows in Phase 1.

**Goethe A2 skill progress:** Reading / Writing / Listening are practice-ready. Speaking Teil 1–2 is practice-ready with offline manual transcripts and optional STT/AI; **Teil 3 joint planning is the next implementation focus** (see `agent-os/product/roadmap.md`). Pronunciation and mock-exam integration follow.

### Phase 2 onward — local self-hosted stack

Core user and exam data (attempts, results, drafts, progress, settings that are not pure UI prefs) live in **PostgreSQL** behind the **NestJS** API. Network access to the **local Docker Compose stack** is expected. See `self-host-persistence.md`. AI remains optional and bring-your-own-key.

Theme and similar non-authoritative UI preferences may still use client storage (see `theme-catalog.md`).

## Exam references

Before changing exam-specific seed data, prompt templates, scoring, grading, or mock exam behavior, read the matching product reference:

- German / Goethe A2: `agent-os/product/german-exam-A2.md`
- German / Goethe C1 (Writing only in Phase 1): `agent-os/product/german-exam-C1.md`

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
    c1/exerciseGeneratorWritingC1.ts    # Goethe C1 Writing (Phase 1 partial)
    c1/answerGeneratorWritingC1.ts
    c1/reviewTextWritingC1.ts
  listening/
    exerciseListening.ts
    a2/exerciseGeneratorListeningA2.ts
  speaking/
    exerciseSpeaking.ts
    a2/reviewSpeakingA2.ts
```

- Each file exports typed arrays / functions (never untyped JSON)
- Imported directly; Vite bundles at build time — no runtime fetch of remote exam content for defaults
- Defaults are an **immutable seed**. Never mutate the default array at runtime.
- The bundled prompt templates that generate / review / grade exercises are **editable demo templates** — ship them as seed data the user can override, the same way exercises are seeded.

## Seed + merge on load (Phase 1)

Composables that own list data follow this lifecycle while localStorage is the persistence layer:

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

Phase 2 replaces this with a server-owned seed + API merge strategy; do not invent a second parallel localStorage source of truth for exam data after cutover.

## Rules

- **Phase 1:** a feature does not "require" the network if turning off AI still lets the user read, write, listen, speak, run a mock exam, and track progress
- **Phase 2+:** core flows may require the local API/DB; they must not require a cloud SaaS or external AI provider
- Do not import a provider SDK (e.g. `openai`) or call AI endpoints from core flows directly — route through a composable that degrades gracefully (see `server/ai-response-envelope.md`)
- AI is **bring-your-own-key**; supported providers today are **OpenAI** and **OpenRouter**. Core UI must render fine when every AI endpoint returns `{ data: null, error: ... }`
- New feature areas / exam skills add a `data/{skill}/` module with typed exports; do not ship unseeded empty states
