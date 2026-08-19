<template>
  <div
    class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-sm font-semibold tabular-nums"
    :class="chipClass"
  >
    <Clock :size="14" aria-hidden="true" />
    <span>{{ formatted }}</span>
  </div>
</template>

<script setup lang="ts">
import { Clock } from 'lucide-vue-next'

const props = defineProps<{ seconds: number }>()

const formatted = computed(() => {
  const seconds = Math.max(0, props.seconds)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
})

const chipClass = computed(() =>
  props.seconds <= 120
    ? 'border-error/40 bg-error/10 text-error'
    : 'border-base-300 bg-base-100 text-base-content'
)
</script>
