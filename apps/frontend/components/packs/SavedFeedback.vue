<template>
  <p v-if="value == null" class="text-base-content/60">Not recorded</p>
  <p v-else-if="typeof value !== 'object'" class="whitespace-pre-wrap">{{ value }}</p>
  <ul v-else-if="Array.isArray(value)" class="space-y-3">
    <li v-for="(item, index) in value" :key="index"><SavedFeedback :value="item" /></li>
  </ul>
  <dl v-else class="space-y-3">
    <div v-for="(item, key) in visibleFields" :key="key">
      <dt class="text-sm font-semibold">{{ label(String(key)) }}</dt>
      <dd class="mt-1 border-l-2 border-base-300 pl-3"><SavedFeedback :value="item" /></dd>
    </div>
  </dl>
</template>
<script setup lang="ts">
const props = defineProps<{ value: unknown }>()
const hidden = new Set([
  'id',
  'packId',
  'exerciseId',
  'createdAt',
  'version',
  'kind',
  'difficulty',
  'testingPart',
])
const visibleFields = computed(() =>
  Object.fromEntries(
    Object.entries(props.value as Record<string, unknown>).filter(([key]) => !hidden.has(key))
  )
)
function label(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, letter => letter.toUpperCase())
}
</script>
