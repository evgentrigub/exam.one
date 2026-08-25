<template>
  <div
    class="relative hidden lg:flex flex-col justify-between p-10 bg-base-200 dot-pattern overflow-hidden"
  >
    <div
      class="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none"
    />
    <div
      class="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-info/10 blur-3xl pointer-events-none"
    />

    <div class="relative flex items-center gap-2">
      <div
        class="w-8 h-8 rounded-field bg-primary text-primary-content grid place-items-center font-display font-bold"
      >
        E
      </div>
      <div class="font-display text-lg font-bold leading-none">
        Exam<span class="text-primary">.one</span>
      </div>
    </div>

    <div class="relative">
      <p class="font-display text-3xl font-bold leading-tight max-w-sm text-pretty">
        {{ $t('auth.asideTitle') }}
      </p>
      <p class="mt-3 text-base-content/65 max-w-sm text-pretty">
        {{ $t('auth.asideBody') }}
      </p>

      <div class="mt-7 rounded-box bg-base-100 border border-base-300 p-5 shadow-sm max-w-sm">
        <div class="flex items-center gap-4">
          <div
            class="ring-prog"
            style="width: 56px; height: 56px"
            :style="{ '--p': 68, '--c': 'var(--color-primary)' }"
          >
            <span>68%</span>
          </div>
          <div class="min-w-0">
            <div class="font-semibold leading-tight">{{ $t('auth.asideExam') }}</div>
            <div class="text-xs text-base-content/60 mt-0.5">{{ $t('auth.asideExamMeta') }}</div>
          </div>
          <div class="ml-auto flex items-center gap-1 text-warning shrink-0">
            <Flame :size="16" />
            <span class="font-mono text-sm font-semibold">12</span>
          </div>
        </div>
        <div class="mt-4 flex flex-col gap-2.5">
          <div v-for="skill in skills" :key="skill.label" class="flex items-center gap-3">
            <span class="text-xs text-base-content/70 w-16 shrink-0">{{ skill.label }}</span>
            <span class="h-1.5 flex-1 rounded-full bg-base-300 overflow-hidden">
              <span
                class="block h-full rounded-full"
                :class="skill.cls"
                :style="{ width: `${skill.pct}%` }"
              />
            </span>
            <span class="font-mono text-[11px] text-base-content/55 w-8 text-right">
              {{ skill.pct }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <p class="relative text-[11px] text-base-content/45 leading-relaxed max-w-sm">
      {{ $t('auth.asideHint') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Flame } from 'lucide-vue-next'

const { t } = useI18n()

const skills = computed(() => [
  { label: t('skill.reading'), pct: 74, cls: 'bg-primary' },
  { label: t('skill.listening'), pct: 61, cls: 'bg-info' },
  { label: t('skill.writing'), pct: 48, cls: 'bg-success' },
  { label: t('skill.speaking'), pct: 39, cls: 'bg-warning' },
])
</script>
