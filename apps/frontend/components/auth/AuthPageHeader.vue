<template>
  <div>
    <NuxtLink
      v-if="backTo"
      :to="backTo"
      class="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary mb-5"
    >
      <ArrowLeft :size="15" /> {{ backLabel }}
    </NuxtLink>
    <div class="mb-6">
      <h1 class="font-display text-3xl font-bold leading-tight">{{ title }}</h1>
      <p v-if="subtitle" class="text-base-content/60 mt-1.5 text-pretty">{{ subtitle }}</p>
    </div>
    <slot />
    <div v-if="$slots['footer']" class="pt-6 text-center text-sm text-base-content/60">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

defineProps<{
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
}>()
</script>
