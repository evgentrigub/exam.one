<template>
  <div class="bg-base-100 rounded-box border border-base-300 ring-soft p-4 text-left">
    <div class="flex items-center gap-2 mb-3">
      <LandingIcon name="file-badge" :size="15" cls="text-primary" />
      <span class="text-sm font-semibold">Mock exam · exam-authentic</span>
      <span class="ml-auto font-mono text-xs px-2 py-0.5 rounded bg-error/10 text-error font-semibold">● 02:30:00</span>
    </div>

    <div class="grid grid-cols-4 gap-2">
      <div
        v-for="(item, i) in items"
        :key="item.label"
        class="rounded-field border border-base-200 p-2.5"
        :class="{ 'ring-2 ring-primary/40': i === 0 }"
      >
        <LandingIcon :name="item.icon" :size="13" :cls="`text-${item.tint}`" />
        <div class="text-xs font-semibold mt-1">{{ item.label }}</div>
        <div class="font-mono text-[11px] text-base-content/50">{{ item.minutes }} min</div>
      </div>
    </div>

    <div class="mt-3 text-[11px] text-base-content/55 flex items-center gap-1.5">
      <LandingIcon name="lock" :size="12" /> No pauses · no transcript until submit · single attempt
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { label: 'Reading', minutes: 30, tint: 'reading', icon: 'book-open' },
  { label: 'Listening', minutes: 25, tint: 'listening', icon: 'headphones' },
  { label: 'Writing', minutes: 30, tint: 'writing', icon: 'pen-line' },
  { label: 'Speaking', minutes: 15, tint: 'speaking', icon: 'mic' },
]
</script>
