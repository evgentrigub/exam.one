# localStorage Keys

All app-owned keys in `localStorage` use the `exam-one:` prefix with a colon separator and kebab-case path.

```
exam-one:reading:texts
exam-one:reading:generation-state
exam-one:writing:drafts
exam-one:writing:reviews
exam-one:writing:submissions
exam-one:progress
exam-one:theme
exam-one:settings
```

## Rules

- Prefix: `exam-one:` — never `examone:`, `exame-one-`, or bare keys like `theme`
- Separator inside the prefix: `:` (colon)
- Path segments: kebab-case, lowercase
- Structure: `exam-one:<feature>:<what>` (e.g., `exam-one:reading:texts`)
- One key per concern; don't stuff multiple feature blobs under one key
- Define the key as a `const KEY = 'exam-one:...'` at the top of the owning composable / store; never inline string literals in multiple places

## Legacy

Existing keys (`exame-one-reading-texts`, `writing-reviews`, `theme`, …) are grandfathered. When touching a file that uses an old key, rename to the new format as part of the change — no dedicated migration layer.

```ts
const STORAGE_KEY = 'exam-one:reading:texts'
```
