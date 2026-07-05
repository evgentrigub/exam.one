<template>
  <div class="ring-prog" :style="{ '--p': value, '--c': color }">
    <span>{{ label ?? `${value}%` }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: number
  color?: string
  label?: string
}>()
</script>
