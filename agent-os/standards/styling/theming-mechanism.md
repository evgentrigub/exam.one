# Theming Mechanism

Theme switching goes through one mechanism: the `data-theme` attribute on `<html>`, controlled by `useTheme()`.

## Setup (in `app.vue`)

```vue
<script setup lang="ts">
const { theme, initTheme } = useTheme()

useHead({ htmlAttrs: { 'data-theme': theme } })

onMounted(initTheme)
</script>
```

## Switching themes

```ts
const { theme, setTheme, availableThemes } = useTheme()
setTheme('dark')
```

Rules:

- Switch themes **only** via `useTheme().setTheme(...)` — never manipulate `data-theme` directly
- Never conditionally apply classes like `:class="{ dark: isDark }"` or toggle theme-specific utility classes
- Don't hand-write CSS variables for theming — daisyUI owns the token layer
- Tailwind `dark:` variants are allowed but redundant; prefer daisyUI tokens (see `components/theme-tokens.md`)
- Components read colors only through daisyUI semantic tokens; they must not know which theme is active
