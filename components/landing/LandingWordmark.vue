<template>
  <div class="flex items-center gap-2">
    <div
      class="rounded-field bg-primary text-primary-content grid place-items-center font-display font-bold"
      :class="size === 'sm' ? 'w-6 h-6 text-sm' : 'w-7 h-7'"
    >
      E
    </div>
    <div
      class="font-display font-bold leading-none"
      :class="[size === 'sm' ? 'text-base' : 'text-lg', light ? 'text-white' : '']"
    >
      Exam<span class="text-primary">.one</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  light?: boolean
  size?: 'sm' | 'lg'
}>()
</script>
