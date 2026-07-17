# Icons

Use `@nuxt/icon` (Iconify) as the icon library. Pick from the `heroicons` set to match the existing look.

```vue
<Icon name="heroicons:trash" class="w-4 h-4" />
<Icon name="heroicons:check-circle" class="w-5 h-5 text-success" />
```

**Sizes (contextual):**
- `w-4 h-4` — inline with text, badges, small buttons
- `w-5 h-5` — card headers, section icons
- `w-6 h-6` — alerts, modal headers, primary actions
- `w-8 h-8`+ — hero illustrations, empty states

**Coloring:** use `text-{role}` tokens (e.g., `text-primary`, `text-success`). Never hard-code stroke/fill colors.

**Legacy:** existing files use inline `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">` blocks. Replace with `<Icon>` when touching those components. Do not add new inline SVG icons.

**Setup (one-time):** add `@nuxt/icon` to `nuxt.config.ts` `modules` and install `@iconify-json/heroicons` so icons ship bundled (reliable self-host without depending on an external icon CDN).
