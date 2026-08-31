<template>
  <div class="flex items-start justify-between gap-4 mb-6">
    <div class="flex items-start gap-3 min-w-0">
      <NuxtLink
        v-if="to"
        :to="to"
        class="mt-1 w-9 h-9 rounded-full border border-base-300 hover:bg-base-200 grid place-items-center text-base-content/70 shrink-0"
        :aria-label="backLabel"
      >
        <ArrowLeft :size="14" aria-hidden="true" />
      </NuxtLink>
      <button
        v-else
        type="button"
        class="mt-1 w-9 h-9 rounded-full border border-base-300 hover:bg-base-200 grid place-items-center text-base-content/70 shrink-0"
        :aria-label="backLabel"
        @click="emit('back')"
      >
        <ArrowLeft :size="14" aria-hidden="true" />
      </button>
      <div class="min-w-0">
        <div
          class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-base-content/50 flex-wrap"
        >
          <component :is="icon" :size="11" aria-hidden="true" />
          {{ $t('exercisesUi.skillPractice', { skill: $t(`skill.${skill}`) }) }}
          <template v-if="type"> · {{ type }}</template>
        </div>
        <h1 class="font-display text-[28px] font-bold leading-tight mt-1 text-base-content truncate">
          {{ title }}
        </h1>
        <div v-if="subtitle" class="text-sm text-base-content/60 mt-1">{{ subtitle }}</div>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0 flex-wrap justify-end">
      <slot name="aside">
        <span
          v-if="level"
          class="text-[11px] font-mono font-semibold px-2 py-1 rounded-full bg-base-200"
          >{{ level }}</span
        >
        <span v-if="part" class="level-pip">Teil {{ part }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, BookOpen, Headphones, Mic, PenLine } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { SkillId } from '~/utils/labels'

const props = defineProps<{
  skill: SkillId
  title: string
  subtitle?: string | undefined
  type?: string | undefined
  level?: string | undefined
  part?: number | undefined
  to?: string | undefined
  backLabel?: string | undefined
}>()

const emit = defineEmits<{ back: [] }>()

const ICONS: Record<SkillId, Component> = {
  reading: BookOpen,
  writing: PenLine,
  listening: Headphones,
  speaking: Mic,
}

const icon = computed(() => ICONS[props.skill])
</script>
