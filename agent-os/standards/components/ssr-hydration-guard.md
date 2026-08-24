# SSR Hydration Guard

Any value derived from client-only sources (`localStorage`, `pinia-plugin-persistedstate`, `window`, `document`, timers) must not render differently on server vs client. Pick one of these patterns.

This applies to client-only reads regardless of where authoritative exam data lives. Hydration guards are about SSR/client mismatch, not about choosing the persistence layer.

Session cookies live on the NestJS API host, so Nuxt SSR cannot know the signed-in user. Gated app routes use `ssr: false` (`nuxt.config` `routeRules`). Auth pages (`/auth/**`) remain SSR'd. Profile chips, initials, and other session-derived UI in the default layout must use `<ClientOnly>` (or an `isClient` fallback) so they do not hydrate `EX` / empty name against the real account.

## Prefer: `<ClientOnly>` for whole subtrees

When a block has no meaningful server rendering (progress badges, draft banners, etc.):

```vue
<ClientOnly>
  <template #fallback>
    <div class="skeleton h-4 w-20" />
  </template>
  <span class="badge badge-success">{{ bestScore }}%</span>
</ClientOnly>
```

## When you need a real SSR fallback value: `isClient` ref

Use when the same element must render on the server with a safe default and "upgrade" on the client.

```vue
<script setup lang="ts">
const isClient = ref(false)
onMounted(() => {
  isClient.value = true
})

const textCompleted = computed(() => (isClient.value ? isTextCompleted(props.text.id) : false))
</script>
```

Rules:

- Never read `localStorage`, persisted Pinia state, or `window` directly at `setup()` top level
- Composables that touch persisted state must return SSR-safe defaults when called during SSR
- Do not sprinkle `if (process.client)` inside templates — use `<ClientOnly>` or the `isClient` computed pattern
