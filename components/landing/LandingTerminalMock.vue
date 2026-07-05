<template>
  <div
    class="rounded-box overflow-hidden border font-mono text-[13px] text-left"
    :class="light ? 'border-white/10 bg-neutral' : 'border-base-300 bg-base-300/40'"
  >
    <div
      class="h-9 px-3 flex items-center gap-1.5 border-b"
      :class="light ? 'border-white/10' : 'border-base-300'"
    >
      <span class="w-2.5 h-2.5 rounded-full bg-error/80" />
      <span class="w-2.5 h-2.5 rounded-full bg-warning/80" />
      <span class="w-2.5 h-2.5 rounded-full bg-success/80" />
      <span
        class="ml-2 text-[11px]"
        :class="light ? 'text-white/40' : 'text-base-content/50'"
      >
        ~/exam.one
      </span>
    </div>

    <div
      class="p-4 space-y-1.5"
      :class="light ? 'text-white/85' : 'text-base-content/85'"
    >
      <div><span class="text-success">$</span> git clone github.com/exam-one/exam.one</div>
      <div><span class="text-success">$</span> docker compose up</div>
      <div :class="light ? 'text-white/40' : 'text-base-content/40'">
        → exam.one running on <span class="text-info">localhost:3000</span>
      </div>
      <div :class="light ? 'text-white/40' : 'text-base-content/40'">
        → bring your own LLM key · practice offline
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  light?: boolean
}>()
</script>
