<template>
  <div class="flex flex-col gap-6">
    <div class="grid size-14 place-items-center rounded-box bg-success/10 text-success">
      <Check :size="26" />
    </div>
    <NuxtLink :to="to" class="btn btn-primary w-full rounded-field gap-2">
      {{ ctaLabel }}
      <ArrowRight :size="16" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Check } from 'lucide-vue-next'

defineProps<{
  ctaLabel: string
  to: string
}>()
</script>
