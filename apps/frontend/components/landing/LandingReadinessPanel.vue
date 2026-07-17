<template>
  <div class="bg-base-100 rounded-box border border-base-300 ring-soft p-5 text-left">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-field bg-primary text-primary-content grid place-items-center font-mono text-sm font-bold">
          42
        </div>
        <div>
          <div class="font-display text-base font-bold leading-none">You're 64% exam-ready</div>
          <div class="text-[11px] text-base-content/60 mt-1">Goethe A2 · German · in 42 days</div>
        </div>
      </div>
      <span class="level-pip">A2</span>
    </div>

    <div class="grid gap-2.5" :class="compact ? 'grid-cols-2' : 'grid-cols-4'">
      <div
        v-for="s in readiness"
        :key="s.id"
        class="rounded-field border border-base-200 p-2.5"
      >
        <div class="flex items-center gap-1.5 mb-1.5">
          <LandingIcon :name="skillIcon(s.id)" :size="12" :cls="`text-${s.id}`" />
          <span class="text-[10px] font-semibold uppercase tracking-wide text-base-content/60">{{ s.label }}</span>
        </div>
        <div class="flex items-end justify-between gap-1">
          <div class="font-mono text-xl font-bold leading-none" :style="{ color: s.color }">{{ s.value }}%</div>
          <LandingSpark :values="sparkValues(s.value)" :color="s.color" />
        </div>
        <div class="mt-2 h-1.5 rounded-full bg-base-200 overflow-hidden">
          <div class="h-full rounded-full" :style="{ width: `${s.value}%`, background: s.color }" />
        </div>
      </div>
    </div>

    <div class="mt-4 flex items-center gap-2">
      <button class="btn btn-primary btn-sm rounded-field gap-1.5 flex-1">
        <LandingIcon name="play" :size="13" /> Start today's plan · 30 min
      </button>
      <button class="btn btn-ghost btn-sm rounded-field gap-1.5">
        <LandingIcon name="file-badge" :size="13" /> Mock exam
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()

const readiness = [
  { id: 'reading', label: 'Reading', value: 68, color: 'var(--color-primary)' },
  { id: 'writing', label: 'Writing', value: 42, color: 'var(--color-success)' },
  { id: 'listening', label: 'Listening', value: 30, color: 'var(--color-info)' },
  { id: 'speaking', label: 'Speaking', value: 35, color: 'var(--color-warning)' },
]

const skills = [
  { id: 'reading', icon: 'book-open' },
  { id: 'writing', icon: 'pen-line' },
  { id: 'listening', icon: 'headphones' },
  { id: 'speaking', icon: 'mic' },
]

function skillIcon(id: string) {
  return skills.find(k => k.id === id)?.icon ?? 'circle'
}

function sparkValues(value: number) {
  return [3, 5, 4, 7, 6, 9].map(v => v * (0.5 + value / 140))
}
</script>
