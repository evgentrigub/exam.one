<template>
  <span class="rounded-field grid place-items-center shrink-0" :class="tone" :style="{ width: `${size}px`, height: `${size}px` }">
    <Check v-if="status === 'COMPLETED'" :size="size * 0.48" />
    <TriangleAlert v-else-if="status === 'FAILED'" :size="size * 0.48" />
    <AudioLines v-else-if="type === 'LISTENING_AUDIO'" :size="size * 0.48" />
    <FileBadge v-else-if="type === 'MOCK_EXAM_SET'" :size="size * 0.48" />
    <Sparkles v-else :size="size * 0.48" />
  </span>
</template>

<script setup lang="ts">
import { AudioLines, Check, FileBadge, Sparkles, TriangleAlert } from 'lucide-vue-next'
import type { BackgroundJobStatus, BackgroundJobType } from '@exam-one/contracts'
const props = withDefaults(defineProps<{ type: BackgroundJobType; status: BackgroundJobStatus; size?: number }>(), { size: 34 })
const tone = computed(() => {
  if (props.status === 'COMPLETED') return 'bg-success/15 text-success'
  if (props.status === 'FAILED') return 'bg-error/15 text-error'
  if (props.type === 'LISTENING_AUDIO') return 'bg-info/15 text-info'
  if (props.type === 'MOCK_EXAM_SET') return 'bg-secondary/15 text-secondary'
  return 'bg-primary/15 text-primary'
})
</script>
