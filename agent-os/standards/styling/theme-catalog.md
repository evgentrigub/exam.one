# Theme Catalog

`composables/useTheme.ts` is the single source of truth for which daisyUI themes the app exposes.

## Shape

```ts
export type Theme = 'light' | 'dark' /* | 'bumblebee' | ... */

type ThemeEntry = { value: Theme; label: string; icon: string }

export const LIGHT_THEMES: ThemeEntry[] = [{ value: 'light', label: 'Light', icon: '☀️' }]
export const DARK_THEMES: ThemeEntry[] = [{ value: 'dark', label: 'Dark', icon: '🌙' }]
export const AVAILABLE_THEMES = [...LIGHT_THEMES, ...DARK_THEMES]
```

## State

Theme is stored via Nuxt `useState` + direct `localStorage` — **not** the Pinia settings store.

Theme is a **non-authoritative UI preference**, separate from exam/user data that lives in PostgreSQL (`self-host-persistence.md`).

```ts
const theme = useState<Theme>('theme', () => 'bumblebee')
```

Why: `useHead({ htmlAttrs: { 'data-theme': theme } })` runs during SSR before Pinia hydration. `useState` + manual `localStorage` lets the server render the correct attribute and the client reconcile on mount.

## Adding a theme

Three updates, always together:

1. `composables/useTheme.ts` — add to `Theme` union and to the appropriate `LIGHT_THEMES` / `DARK_THEMES` array
2. `assets/styles/main.css` — add to the `@plugin "daisyui" { themes: ... }` list
3. Nothing else — components consume only daisyUI tokens

## Rules

- Do not introduce a second theme store or parallel "dark mode" boolean
- Do not store theme in the Pinia settings store
- Do not hard-code theme names in components — read the catalog via `useTheme().availableThemes`
- `setTheme` must persist to `localStorage` and update `data-theme` on the client
