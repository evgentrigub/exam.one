<template>
  <div class="flex items-center gap-2.5">
    <span
      class="w-8 h-8 rounded-field bg-base-200 grid place-items-center text-base-content/60 shrink-0"
    >
      <component :is="icon" :size="15" />
    </span>
    <div class="leading-tight">
      <div class="font-display font-bold text-base tabular-nums">{{ value }}</div>
      <div class="text-[11px] text-base-content/55">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  label: string
  value: string
}>()
</script>
