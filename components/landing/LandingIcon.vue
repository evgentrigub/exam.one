<template>
  <Component
    :is="icon"
    :size="iconSize"
    :class="cls"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import * as icons from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    cls?: string
  }>(),
  {
    size: 16,
    cls: '',
  },
)

const icon = computed(() => {
  const key = props.name
    .split('-')
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('') as keyof typeof icons
  return (icons[key] ?? icons.HelpCircle) as typeof icons.HelpCircle
})

const iconSize = computed(() => (typeof props.size === 'string' ? Number.parseInt(props.size, 10) : props.size))
</script>
