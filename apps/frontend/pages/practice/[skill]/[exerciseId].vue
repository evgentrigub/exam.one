<script setup lang="ts">
const route = useRoute()
const skill = String(route.params['skill'] || '')
const exerciseId = String(route.params['exerciseId'] || '')
const target =
  skill === 'writing'
    ? `/writing/${exerciseId}/exam`
    : skill === 'reading'
      ? `/reading/${exerciseId}`
      : `/${skill}/${exerciseId}`

await navigateTo(target, { replace: true })
</script>

<template>
  <div />
</template>
