# Shared Label & Badge Maps

Do not duplicate `textTypeLabels` / `topicTypeLabels` / `badgeClasses` lookup objects inside components. Centralize them in `utils/labels.ts` and route user-facing text through i18n.

## Layout

```ts
// utils/labels.ts
export const TEXT_TYPE_BADGE_CLASS: Record<TextType, string> = {
  email: 'badge-info',
  notice: 'badge-warning',
  article: 'badge-success',
  advertisement: 'badge-secondary',
  instructions: 'badge-accent',
  announcement: 'badge-error',
}

export function getTextTypeBadgeClass(type: string): string {
  return TEXT_TYPE_BADGE_CLASS[type as TextType] ?? 'badge-ghost'
}

export function getTextTypeLabel(type: string, t: (k: string) => string): string {
  return t(`textType.${type}`) || type
}
```

## i18n keys

User-facing labels live in `i18n/locales/*.json`:

```json
{ "textType": { "email": "E-Mail", "notice": "Hinweis", "article": "Artikel" } }
```

## Usage in components

```vue
<script setup lang="ts">
import { getTextTypeBadgeClass, getTextTypeLabel } from '~/utils/labels'
const { t } = useI18n()
</script>

<template>
  <span :class="['badge', getTextTypeBadgeClass(text.textType)]">
    {{ getTextTypeLabel(text.textType, t) }}
  </span>
</template>
```

Rules:

- One map per taxonomy, exported from `utils/labels.ts`
- Class maps stay in TS (not i18n); translated labels go through `t()`
- Fallback to `'badge-ghost'` for class maps and the raw type string for labels when the key is unknown
- Remove any inline `textTypeLabels` / `badgeClasses` objects from components when touching them
