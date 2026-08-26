<template>
  <div class="rounded-box bg-base-100 border border-base-300 ring-soft" :class="className">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    className?: string
  }>(),
  { className: 'p-6' }
)
</script>
