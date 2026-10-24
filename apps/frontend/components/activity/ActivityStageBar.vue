<template>
  <div class="flex gap-[3px] h-1.5 w-full" role="progressbar" :aria-valuenow="Math.round(overallPercent(job.type, job.progress))" aria-valuemin="0" aria-valuemax="100">
    <div v-for="(stage, index) in stages" :key="stage.key" class="rounded-full overflow-hidden bg-base-content/10" :style="{ flex: stage.weight }">
      <div class="h-full transition-[width] duration-500 ease-out" :class="job.status === 'FAILED' ? 'bg-error' : 'bg-primary'" :style="{ width: `${fill(index) * 100}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { JOB_STAGES, overallPercent, type BackgroundJobDto } from '@exam-one/contracts'
const props = defineProps<{ job: BackgroundJobDto }>()
const stages = computed(() => JOB_STAGES[props.job.type].stages)
function fill(index: number) {
  const percent = overallPercent(props.job.type, props.job.progress)
  const start = stages.value.slice(0, index).reduce((sum, stage) => sum + stage.weight, 0)
  return Math.max(0, Math.min(1, (percent - start) / stages.value[index]!.weight))
}
</script>
