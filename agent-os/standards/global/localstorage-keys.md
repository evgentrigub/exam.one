# localStorage Keys

> **Phase 1 persistence.** While the app is frontend-only, exam and user data use these keys. **Phase 2 onward:** attempts, drafts, results, progress, prompt overrides, and similar domains move to PostgreSQL via NestJS (see `self-host-persistence.md`). After cutover, do not add new authoritative exam-data keys here — keep localStorage for non-authoritative UI prefs only (for example theme).

All app-owned keys in `localStorage` use the `exam-one:` prefix with a colon separator and kebab-case path.

```
exam-one:exam                   # selected exam + level (e.g. goethe-a2, goethe-c1)
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
exam-one:theme                  # UI preference — may remain client-side in Phase 2+
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
