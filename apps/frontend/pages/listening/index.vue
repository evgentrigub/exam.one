<template>
  <div />
</template>

<script setup lang="ts">
// Legacy listing route — the unified hub owns listening discovery.
definePageMeta({ middleware: () => navigateTo('/exercises?skill=listening', { replace: true }) })
</script>
