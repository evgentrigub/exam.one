<template>
  <div class="flex items-center gap-3">
    <span class="h-px flex-1 bg-base-300" />
    <span class="text-xs text-base-content/50">{{ label }}</span>
    <span class="h-px flex-1 bg-base-300" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>
