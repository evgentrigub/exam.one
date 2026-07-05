<template>
  <Component
    :is="icon"
    :size="size"
    :class="cls"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  name: string
  size?: number | string
  cls?: string
}>()

const icon = computed(() => {
  const key = props.name
    .split('-')
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('') as keyof typeof icons
  return (icons[key] ?? icons.HelpCircle) as typeof icons.HelpCircle
})
</script>
