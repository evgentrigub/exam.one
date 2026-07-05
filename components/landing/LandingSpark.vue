<template>
  <div class="spark" :style="{ color }">
    <span
      v-for="(v, i) in normalized"
      :key="i"
      :style="{
        height: `${v.height}%`,
        opacity: 0.4 + 0.6 * v.opacity,
      }"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  values: number[]
  color?: string
}>()

const max = computed(() => Math.max(...props.values, 1))

const normalized = computed(() =>
  props.values.map(v => ({
    height: (v / max.value) * 100,
    opacity: v / max.value,
  })),
)
</script>
