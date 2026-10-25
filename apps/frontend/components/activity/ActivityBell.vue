<template>
  <ClientOnly>
    <button
      ref="bellButton"
      type="button"
      class="relative w-9 h-9 rounded-full grid place-items-center hover:bg-base-200"
      :aria-label="$t('activity.title')"
      :aria-expanded="open"
      @click="open = !open"
    >
      <svg
        v-if="center.active.value.length"
        class="absolute inset-0 -rotate-90"
        width="36"
        height="36"
        viewBox="0 0 36 36"
        aria-hidden="true"
      >
        <circle
          cx="18"
          cy="18"
          r="17"
          fill="none"
          stroke="var(--color-base-300)"
          stroke-width="2"
        />
        <circle
          cx="18"
          cy="18"
          r="17"
          fill="none"
          stroke="var(--color-primary)"
          stroke-width="2"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference * (1 - center.overall.value / 100)"
        />
      </svg>
      <Loader v-if="center.active.value.length" :size="16" class="animate-spin text-primary" /><Bell
        v-else
        :size="16"
      />
      <span
        v-if="center.unreadCount.value"
        class="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-error text-error-content text-[9px] font-bold grid place-items-center"
        >{{ center.unreadCount.value }}</span
      >
    </button>
    <ActivityPanel v-if="open" @close="open = false" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { Bell, Loader } from 'lucide-vue-next'
const center = useJobCenter()
const open = ref(false)
const bellButton = ref<HTMLButtonElement | null>(null)
watch(open, isOpen => {
  if (!isOpen && import.meta.client)
    void nextTick(() => {
      try {
        bellButton.value?.focus()
      } catch {
        return
      }
    })
})
const circumference = 2 * Math.PI * 17
</script>
