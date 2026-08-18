<template>
  <div v-if="score > 0" class="flex gap-1 mt-2">
    <span
      v-for="i in 3"
      :key="i"
      class="h-1 flex-1 rounded-full"
      :class="i <= score ? barClass : 'bg-base-300'"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ score: number }>()

const barClass = computed(() => {
  if (props.score <= 1) return 'bg-error'
  if (props.score === 2) return 'bg-warning'
  return 'bg-success'
})
</script>
