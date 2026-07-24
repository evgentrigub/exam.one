<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center p-4 bg-base-content/40 backdrop-blur-sm"
    @click="emit('close')"
  >
    <div
      class="w-full max-w-[560px] max-h-[90vh] flex flex-col bg-base-100 rounded-box border border-base-300 shadow-xl overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 pt-5 pb-4 border-b border-base-300/70 flex items-start gap-3 shrink-0">
        <span
          class="w-10 h-10 rounded-field bg-primary/10 text-primary grid place-items-center shrink-0"
        >
          <Sparkles :size="18" />
        </span>
        <div class="flex-1">
          <h2 class="font-display text-xl font-bold leading-tight">
            {{ $t('exercisesUi.generateTitle') }}
          </h2>
          <p class="text-sm text-base-content/60 mt-0.5">
            {{ $t('exercisesUi.generateSubtitle') }}
          </p>
        </div>
        <button class="btn btn-ghost btn-sm btn-circle" @click="emit('close')">
          <X :size="16" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5 overflow-y-auto">
        <!-- Level -->
        <div>
          <div class="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">
            {{ $t('exercisesUi.level') }}
          </div>
          <div class="flex gap-2">
            <button
              v-for="l in levels"
              :key="l"
              class="flex-1 h-10 rounded-field text-sm font-semibold border transition-colors"
              :class="
                lvl === l
                  ? 'bg-primary text-primary-content border-primary'
                  : 'bg-base-100 border-base-300 hover:border-base-content/30'
              "
              @click="lvl = l"
            >
              {{ l }}
            </button>
          </div>
        </div>

        <!-- Exam modules -->
        <div>
          <div class="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">
            {{ $t('exercisesUi.examModules') }}
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="s in skillOptions"
              :key="s.id"
              class="flex items-center gap-2.5 px-3 h-12 rounded-box border text-left transition-colors"
              :class="
                skills.includes(s.id)
                  ? `${s.borderActive} ${s.softBgClass}`
                  : 'border-base-300 hover:border-base-content/30'
              "
              @click="toggleSkill(s.id)"
            >
              <span
                class="w-7 h-7 rounded-field grid place-items-center shrink-0"
                :class="
                  skills.includes(s.id)
                    ? `${s.softBgClass} ${s.textClass}`
                    : 'bg-base-200 text-base-content/50'
                "
              >
                <component :is="s.icon" :size="14" />
              </span>
              <span class="text-sm font-medium flex-1">{{ s.label }}</span>
              <span
                class="w-5 h-5 rounded-md border grid place-items-center"
                :class="
                  skills.includes(s.id)
                    ? `module-chip-${s.id} is-active border-transparent`
                    : 'border-base-300'
                "
              >
                <Check v-if="skills.includes(s.id)" :size="12" />
              </span>
            </button>
          </div>
        </div>

        <!-- Count (derived from selected modules' parts) -->
        <div
          class="flex items-center justify-between gap-4 rounded-box border border-base-300 bg-base-200/40 px-4 py-3"
        >
          <div class="min-w-0">
            <div class="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">
              {{ $t('exercisesUi.howMany') }}
            </div>
            <div class="text-xs text-base-content/55">
              {{ $t('exercisesUi.exercisesToGenerate') }}
            </div>
            <div
              v-if="selectedBreakdown.length"
              class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1"
            >
              <span
                v-for="s in selectedBreakdown"
                :key="s.id"
                class="inline-flex items-center gap-1 text-[11px] font-medium"
                :class="s.textClass"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="`dot-${s.id}`" />{{ s.label }} ×{{
                  s.count
                }}
              </span>
            </div>
          </div>
          <div class="font-display text-3xl font-bold tabular-nums shrink-0">
            {{ totalExercises }}
          </div>
        </div>

        <!-- Difficulty (mock) -->
        <div>
          <div class="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">
            {{ $t('exercisesUi.difficulty') }}
          </div>
          <div class="flex gap-2">
            <button
              v-for="d in difficulties"
              :key="d.id"
              class="flex-1 h-9 rounded-full text-xs font-medium border transition-colors"
              :class="
                diff === d.id
                  ? 'bg-primary text-primary-content border-primary'
                  : 'bg-base-100 border-base-300 text-base-content/70 hover:border-base-content/30'
              "
              @click="diff = d.id"
            >
              {{ d.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 border-t border-base-300/70 flex items-center gap-3 bg-base-200/40 shrink-0"
      >
        <div class="text-xs text-base-content/55 flex items-center gap-1.5">
          <Layers :size="13" /> {{ totalExercises }} ·
          {{ $t('exercisesUi.modulesCount', { count: skills.length }) }}
        </div>
        <button class="btn btn-ghost btn-sm ml-auto" @click="emit('close')">
          {{ $t('exercisesUi.cancel') }}
        </button>
        <button
          class="btn btn-primary btn-sm rounded-full gap-2"
          :disabled="!canGen"
          @click="onGenerate"
        >
          <Sparkles :size="14" /> {{ $t('exercisesUi.generate') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, X, Check, Layers, BookOpen, PenLine, Headphones, Mic } from 'lucide-vue-next'
import type { Component } from 'vue'
import { SKILLS, getSkillLabel, type SkillId } from '~/utils/labels'
import { getAvailableExamParts } from '~/data/examStructure/goetheA2'

type ExamLevel = 'A2' | 'C1'
type Difficulty = 'easier' | 'balanced' | 'harder'

const props = defineProps<{
  level: ExamLevel
}>()

const emit = defineEmits<{
  close: []
  generate: [
    payload: {
      level: ExamLevel
      skills: SkillId[]
      parts: string[]
      count: number
      difficulty: Difficulty
    },
  ]
}>()

const { t } = useI18n()

const levels: ExamLevel[] = ['A2', 'C1']

const ICONS: Record<SkillId, Component> = {
  reading: BookOpen,
  writing: PenLine,
  listening: Headphones,
  speaking: Mic,
}

const BORDER_ACTIVE: Record<SkillId, string> = {
  reading: 'border-primary',
  writing: 'border-success',
  listening: 'border-info',
  speaking: 'border-warning',
}

const skillOptions = computed(() =>
  SKILLS.map(s => ({
    id: s.id,
    label: getSkillLabel(s.id, t),
    icon: ICONS[s.id],
    textClass: s.textClass,
    softBgClass: s.softBgClass,
    borderActive: BORDER_ACTIVE[s.id],
  }))
)

const difficulties = computed<{ id: Difficulty; label: string }[]>(() => [
  { id: 'easier', label: t('exercisesUi.gentle') },
  { id: 'balanced', label: t('exercisesUi.mixed') },
  { id: 'harder', label: t('exercisesUi.challenging') },
])

const lvl = ref<ExamLevel>(props.level)
const skills = ref<SkillId[]>(SKILLS.map(s => s.id))
const diff = ref<Difficulty>('balanced')

const canGen = computed(() => skills.value.length > 0)

function toggleSkill(id: SkillId) {
  if (skills.value.includes(id)) {
    skills.value = skills.value.filter(s => s !== id)
  } else {
    skills.value = [...skills.value, id]
  }
}

function partsForSkill(skill: SkillId) {
  return getAvailableExamParts(skill)
}

// One exercise is generated per part of each selected module.
const selectedBreakdown = computed(() =>
  skillOptions.value
    .filter(s => skills.value.includes(s.id))
    .map(s => ({
      id: s.id,
      label: s.label,
      textClass: s.textClass,
      count: partsForSkill(s.id).length,
    }))
)

const totalExercises = computed(() => selectedBreakdown.value.reduce((sum, s) => sum + s.count, 0))

// Full part keys (e.g. "reading:1") for every part of every selected module.
const selectedParts = computed<string[]>(() =>
  skills.value.flatMap(id => partsForSkill(id).map(p => `${id}:${p.n}`))
)

function onGenerate() {
  if (!canGen.value) return
  emit('generate', {
    level: lvl.value,
    skills: [...skills.value],
    parts: [...selectedParts.value],
    count: totalExercises.value,
    difficulty: diff.value,
  })
}
</script>
