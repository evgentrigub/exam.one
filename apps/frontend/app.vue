<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :page-key="route => `${route.path}:${auth.user.value?.id}:${settings.packId}`" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const auth = useAuth()
const settings = useSettingsStore()
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
