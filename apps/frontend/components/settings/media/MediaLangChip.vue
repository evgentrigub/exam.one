<template>
  <span
    class="inline-grid place-items-center h-5 px-1.5 rounded bg-base-200 text-[10px] font-mono font-semibold text-base-content/60"
  >
    {{ mediaLanguage(lang)?.code ?? lang.toUpperCase() }}
  </span>
</template>

<script setup lang="ts">
import { mediaLanguage } from '~/data/account/mediaLanguages'

defineProps<{ lang: string }>()
</script>
