<template>
  <span
    class="inline-flex items-center rounded-full font-semibold uppercase tracking-wider"
    :class="[sizeClass, meta.softBgClass, meta.textClass]"
  >
    <component :is="icon" :size="iconSize" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { BookOpen, Headphones, Mic, PenLine } from 'lucide-vue-next'
import type { Component } from 'vue'
import { getSkillLabel, getSkillMeta, type SkillId } from '~/utils/labels'

const props = withDefaults(
  defineProps<{
    skill: SkillId
    size?: 'xs' | 'sm'
  }>(),
  { size: 'sm' }
)

const { t } = useI18n()

const ICONS: Record<SkillId, Component> = {
  reading: BookOpen,
  writing: PenLine,
  listening: Headphones,
  speaking: Mic,
}

const meta = computed(() => getSkillMeta(props.skill))
const icon = computed(() => ICONS[props.skill])
const label = computed(() => getSkillLabel(props.skill, t))
const sizeClass = computed(() =>
  props.size === 'xs' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-0.5 gap-1.5'
)
const iconSize = computed(() => (props.size === 'xs' ? 10 : 12))
</script>
