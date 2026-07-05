# localStorage Keys

All app-owned keys in `localStorage` use the `exam-one:` prefix with a colon separator and kebab-case path.

```
exam-one:exam                   # selected exam + level (e.g. cambridge-a2, goethe-a2)
exam-one:reading:texts
exam-one:reading:generation-state
exam-one:writing:drafts
exam-one:writing:reviews
exam-one:writing:submissions
exam-one:listening:exercises
exam-one:speaking:exercises
exam-one:mock-exam:state
exam-one:progress
exam-one:prompt-templates       # user-edited demo prompt templates
exam-one:ai-settings            # non-secret AI config (provider, model, base URL)
exam-one:theme
exam-one:settings
```

## Rules

- Prefix: `exam-one:` — never `examone:`, `exame-one-`, or bare keys like `theme`
- Separator inside the prefix: `:` (colon)
- Path segments: kebab-case, lowercase
- Structure: `exam-one:<feature>:<what>` (e.g., `exam-one:reading:texts`)
- One key per concern; don't stuff multiple feature blobs under one key
- Use one key per exam skill (`reading`, `writing`, `listening`, `speaking`) and one for `mock-exam`; keep them language/exam-agnostic so any configured exam reuses the same keys
- Define the key as a `const KEY = 'exam-one:...'` at the top of the owning composable / store; never inline string literals in multiple places
- **Secrets stay out of localStorage**: persist only non-secret AI config (provider, model, base URL) under `exam-one:ai-settings`. A bring-your-own-key API key should come from runtime/env config, not plaintext localStorage

## Legacy

Existing keys (`exame-one-reading-texts`, `writing-reviews`, `theme`, …) are grandfathered. When touching a file that uses an old key, rename to the new format as part of the change — no dedicated migration layer.

```ts
const STORAGE_KEY = 'exam-one:reading:texts'
```
