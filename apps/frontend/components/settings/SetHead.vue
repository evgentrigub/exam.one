<template>
  <div class="flex items-start justify-between gap-4 mb-5">
    <div>
      <h3 class="font-display text-lg font-bold leading-tight" :class="danger ? 'text-error' : ''">
        {{ title }}
      </h3>
      <p v-if="desc" class="text-sm text-base-content/60 mt-1 text-pretty">{{ desc }}</p>
    </div>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  desc?: string
  danger?: boolean
}>()
</script>
