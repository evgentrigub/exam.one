<template>
  <div class="flex items-start gap-4 py-4">
    <div
      v-if="icon"
      class="grid size-10 place-items-center rounded-field shrink-0"
      :class="
        danger ? 'bg-error/10 text-error' : `bg-base-200 ${iconClass ?? 'text-base-content/50'}`
      "
    >
      <component :is="icon" :size="18" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="font-medium leading-tight">{{ title }}</div>
      <div v-if="desc" class="text-sm text-base-content/60 mt-1 text-pretty">{{ desc }}</div>
    </div>
    <div v-if="$slots['control']" class="shrink-0 flex items-center gap-2">
      <slot name="control" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon?: Component
  iconClass?: string
  title: string
  desc?: string
  danger?: boolean
}>()
</script>
