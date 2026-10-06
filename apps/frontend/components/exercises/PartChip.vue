<template>
  <button
    ref="chipRef"
    type="button"
    class="part-chip inline-flex items-center gap-1.5 h-7 px-2.5 rounded-selector text-xs border whitespace-nowrap"
    :class="chipClass"
    :disabled="part?.available === false"
    @click="toggle"
    @mouseenter="openPopover"
    @mouseleave="hover = false"
    @focus="openPopover"
    @blur="hover = false"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="`dot-${skill}`" />
    {{ compact ? n : $t('exercisesUi.partN', { n }) }}
    <Info :size="11" class="opacity-40" />
  </button>

  <Teleport to="body">
    <div
      v-if="hover && part"
      class="fixed w-72 pointer-events-none z-[80]"
      :style="{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translateX(-50%)',
        animation: 'fadeIn 120ms ease-out',
      }"
    >
      <div class="bg-base-100 rounded-box border border-base-300 shadow-xl overflow-hidden">
        <div
          class="flex items-center gap-2 px-3 py-2 border-b border-base-300"
          :class="`bg-${skill}-tint`"
        >
          <span
            class="w-6 h-6 rounded-field grid place-items-center font-display font-bold text-[12px]"
            :class="`module-chip-${skill} is-active`"
            >{{ n }}</span
          >
          <span class="text-[11px] font-semibold uppercase tracking-wider" :class="`text-${skill}`">
            {{ skillLabel }} · {{ $t('exercisesUi.partN', { n }) }}
          </span>
        </div>
        <div class="p-3">
          <div class="font-display font-bold text-[15px] leading-tight">{{ part.title }}</div>
          <div
            class="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-mono text-base-content/70 bg-base-200 rounded-selector px-2 py-0.5"
          >
            <ListChecks :size="11" /> {{ part.format }}
          </div>
          <p class="text-[12.5px] text-base-content/75 leading-snug mt-2">{{ part.short }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Info, ListChecks } from 'lucide-vue-next'
import type { SkillId } from '~/utils/labels'

const props = defineProps<{
  skill: SkillId
  n: number
  active: boolean
  compact?: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

const structure = useLocalizedStructure()
const chipRef = ref<HTMLButtonElement | null>(null)
const hover = ref(false)
const pos = ref({ x: 0, y: 0 })

const part = computed(() =>
  structure.value.find(m => m.id === props.skill)?.parts.find(p => p.n === props.n)
)

const skillLabel = computed(() => {
  const raw = structure.value.find(m => m.id === props.skill)?.label ?? props.skill
  return raw.replace(/\s*\(.*\)\s*/, '')
})

const chipClass = computed(() => {
  if (part.value?.available === false) {
    return 'bg-base-200 border-base-300 text-base-content/40 cursor-not-allowed'
  }
  return props.active
    ? `part-chip-${props.skill} is-active font-semibold`
    : 'bg-base-100 border-base-300 hover:border-base-content/30'
})

function toggle() {
  if (part.value?.available === false) return
  emit('toggle')
}

function openPopover() {
  const r = chipRef.value?.getBoundingClientRect()
  if (r) pos.value = { x: r.left + r.width / 2, y: r.bottom + 8 }
  hover.value = true
}
</script>
