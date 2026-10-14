<template>
  <button
    type="button"
    class="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:text-base-content"
    :aria-label="label"
    :title="label"
    @click="toggleTheme"
  >
    <Sun v-if="isDark" :size="16" aria-hidden="true" />
    <Moon v-else :size="16" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const { t } = useI18n()
const { theme, setTheme, lightThemes, darkThemes } = useTheme()
const isDark = computed(() => darkThemes.some(option => option.value === theme.value))
const label = computed(() => t(isDark.value ? 'settings.switchToLight' : 'settings.switchToDark'))

function toggleTheme() {
  const target = isDark.value ? lightThemes[0]?.value : darkThemes[0]?.value
  if (target) setTheme(target)
}
</script>
