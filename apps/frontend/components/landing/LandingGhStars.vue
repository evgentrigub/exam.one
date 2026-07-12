<template>
  <a
    href="#"
    class="btn btn-sm gap-2 rounded-field"
    :class="
      light
        ? 'btn-outline border-white/25 text-white hover:bg-white hover:text-base-content'
        : 'btn-outline border-base-300'
    "
  >
    <LandingIcon name="star" :size="15" />
    Star
    <span
      class="font-mono text-xs px-1.5 py-0.5 rounded"
      :class="light ? 'bg-white/15' : 'bg-base-200'"
    >
      21.4k
    </span>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  light?: boolean
}>()
</script>
