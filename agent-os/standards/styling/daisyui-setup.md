# daisyUI Setup

The project uses **Tailwind CSS v4** + **daisyUI v5** as the single styling toolchain. All styles flow through one entry file.

## Entry file

`assets/styles/main.css`:

```css
@import 'tailwindcss';

@plugin "daisyui" {
  themes: light, dark;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  line-height: 1.6;
}
```

## Nuxt config

```ts
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  css: ['~/assets/styles/main.css'],
  vite: { plugins: [tailwindcss()] },
})
```

Rules:

- **One** global CSS file (`main.css`). No per-route or per-component global CSS imports.
- Enable **only the themes exposed in `useTheme.ts`** in the `@plugin "daisyui"` block — every enabled theme ships its token CSS. Keeps the bundle lean.
- Do not add PostCSS plugins, CSS-in-JS, or other style libraries. Tailwind v4 via `@tailwindcss/vite` is the only pipeline.
- Adding a daisyUI theme: update the `themes:` list here **and** the catalog in `composables/useTheme.ts` (see `theme-catalog.md`).
- `<style scoped>` is allowed only for keyframes/layout utilities that daisyUI + Tailwind can't express. Never put colors there (see `components/theme-tokens.md`).
