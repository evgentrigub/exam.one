# SSR Storage Guards in Composables

Composables run on both server and client. Any access to `localStorage`, `sessionStorage`, `window`, `document`, `navigator`, or timers must be guarded with `import.meta.client` / `import.meta.server`.

## Read pattern

```ts
const KEY = 'exam-one:reading:texts'

function readAll(): ReadingExercise[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ReadingExercise[]) : []
  } catch {
    return []
  }
}
```

## Write pattern

```ts
function writeAll(items: ReadingExercise[]): void {
  if (import.meta.server) return
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch (e) {
    console.error(`[${KEY}] write failed`, e)
  }
}
```

## Rules

- **Every** localStorage access sits inside a function guarded by `import.meta.client` (early-return on server)
- Wrap reads in `try/catch` — corrupted JSON must not crash the app; return a safe default
- Do **not** read storage at module top level — defer into a function called from `onMounted` or on user action
- Prefer `import.meta.client` / `import.meta.server` over `process.client` / `process.server` (deprecated in Nuxt 3.10+)
- Define `const KEY = 'exam-one:...'` at the top of the file (see `localstorage-keys.md`)

## Related patterns

- UI rendering persisted state in `<template>`: use the SSR hydration guard (`components/ssr-hydration-guard.md`)
- Long-running persisted operations (generation state): include `startedAt` and auto-reset stale entries on load
