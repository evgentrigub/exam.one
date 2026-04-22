# Offline-First Core

Base features (reading practice, writing practice, progress, drafts, navigation) must work with **zero network**. AI is an enhancement layer, never a dependency of the core flow.

## Static seed data

All built-in content lives as typed TS modules in `data/{feature}/`:

```
data/
  german-texts.ts               # shared default reading texts
  reading/
    dataToGenerateReadingA2.ts
    dataToGenerateReadingC1.ts
  writing/
    exerciseTopics.ts
    reviewTextA2tPrompt.ts
    reviewTextC1Prompt.ts
```

- Each file exports typed arrays / functions (never untyped JSON)
- Imported directly; Vite bundles at build time — no runtime fetch
- Defaults are **immutable seed**. Never mutate the default array at runtime.

## Seed + merge on load

Composables that own list data follow this lifecycle:

1. On first client load, if localStorage is empty, seed from the static defaults and persist
2. On subsequent loads, **merge**: `items = defaults ∪ stored.filter(x => !isDefault(x.id))`
3. When writing to localStorage, **only persist non-default items** (user-generated / AI-generated)

```ts
const defaultIds = new Set(defaultTexts.map(t => t.id))
const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]') as GermanText[]
const extras = stored.filter(t => !defaultIds.has(t.id))
texts.value = [...defaultTexts, ...extras]
```

Why: defaults can ship new items via updates without bloating each user's localStorage, and user deletions can't wipe the seed.

## Rules

- A feature does not "require" the network if turning off AI still lets the user read, write, and track progress
- Do not import `openai` or call `/api/*` from core flows — route through a composable that degrades gracefully (see `server/ai-response-envelope.md`)
- Core UI must render fine when all AI endpoints return `{ data: null, error: ... }`
- New feature areas add a `data/{feature}/` module with typed exports; do not ship unseeded empty states
