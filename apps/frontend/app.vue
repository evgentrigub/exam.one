<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Initialize theme system
const { theme, initTheme } = useTheme()

// Apply theme to HTML element
useHead({
  htmlAttrs: {
    'data-theme': theme,
  },
})

// Initialize theme from localStorage on mount
onMounted(() => {
  initTheme()
})
</script>
