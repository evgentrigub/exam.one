<template>
  <div />
</template>

<script setup lang="ts">
// Legacy listing route — the unified hub owns speaking discovery.
definePageMeta({ middleware: () => navigateTo('/exercises?skill=speaking', { replace: true }) })
</script>
