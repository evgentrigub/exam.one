<template>
  <div class="bg-base-100 rounded-box border border-base-300 ring-soft overflow-hidden text-left">
    <div class="px-4 h-11 flex items-center gap-2 border-b border-base-300">
      <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-speaking">
        <LandingIcon name="mic" :size="13" /> Speaking · Monologue
      </span>
      <span class="ml-auto font-mono text-xs text-base-content/50">0:48 / 1:30</span>
    </div>

    <div class="p-4">
      <div class="flex items-center gap-3 mb-3">
        <button class="btn btn-circle btn-sm bg-warning text-warning-content border-0">
          <LandingIcon name="pause" :size="15" />
        </button>
        <div class="flex items-end gap-[3px] h-8 text-warning flex-1">
          <span
            v-for="(h, i) in bars"
            :key="i"
            class="wave-bar"
            :style="{ height: `${h * 5}%`, opacity: i < 11 ? 1 : 0.35 }"
          />
        </div>
      </div>

      <div class="rounded-field bg-base-200/70 border border-base-300 p-3">
        <div class="text-[10px] uppercase tracking-wide font-semibold text-base-content/50 mb-1">Live transcript</div>
        <p class="text-sm text-base-content/85 leading-relaxed">
          „Ich heiße Lena und ich komme aus München. In meiner Freizeit <span class="text-base-content/40">…</span>"
        </p>
        <div class="mt-2 flex items-center gap-2">
          <span class="badge badge-sm badge-warning badge-soft gap-1">
            <LandingIcon name="gauge" :size="11" /> Fluency 3.9
          </span>
          <span class="badge badge-sm badge-ghost gap-1">
            <LandingIcon name="spell-check" :size="11" /> 2 corrections
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const bars = [4, 9, 6, 13, 8, 15, 7, 11, 5, 14, 9, 6, 12, 8, 4, 10, 6, 13, 7, 5]
</script>
