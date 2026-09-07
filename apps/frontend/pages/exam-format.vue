<template>
  <div class="max-w-[1240px] mx-auto p-6 space-y-4">
    <!-- Overview banner -->
    <div class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
      <div class="grid md:grid-cols-[1.4fr_1fr]">
        <div class="p-6">
          <div
            class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/50"
          >
            <Flag :size="13" /> {{ pack.title }}
          </div>
          <h1 class="font-display text-2xl font-bold mt-2 leading-tight">
            {{ $t('examFormatUi.tagline') }}
          </h1>

          <p class="text-sm text-base-content/65 mt-2 max-w-xl">
            {{ $t('examFormatUi.intro', { parts: totalParts }) }}
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="mod in modules"
              :key="mod.id"
              class="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap border border-base-300 hover:border-base-content/30 transition-colors"
              @click="practice(mod.id)"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="`dot-${mod.id}`" />
              {{ shortLabel(mod) }} <span class="opacity-50">· {{ mod.parts.length }}</span>
            </button>
          </div>
        </div>

        <!-- 2×2 module tiles -->
        <div
          class="grid grid-cols-2 border-t md:border-t-0 md:border-l border-base-300"
        >
          <div
            v-for="(mod, i) in modules"
            :key="mod.id"
            class="p-5 border-base-300"
            :class="[i % 2 === 0 ? 'border-r' : '', i < 2 ? 'border-b' : '']"
          >
            <span
              class="w-9 h-9 rounded-field grid place-items-center"
              :class="[`bg-${mod.id}-tint`, `text-${mod.id}`]"
            >
              <component :is="icon(mod.id)" :size="16" />
            </span>
            <div class="font-display font-bold mt-2 leading-none">{{ shortLabel(mod) }}</div>
            <div class="text-[11px] text-base-content/55 mt-1">
              {{ mod.parts.length }} {{ $t('examFormatUi.partsLower') }} · {{ mod.minutes }}
              {{ $t('examFormatUi.min') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Totals strip -->
    <div class="flex flex-wrap gap-3">
      <div class="flex items-center gap-2 rounded-field bg-base-200/60 px-3 py-2">
        <Clock :size="15" class="text-base-content/50" />
        <span class="text-sm font-medium"
          >~{{ totalMinutes }} {{ $t('examFormatUi.minTotal') }}</span
        >
      </div>
      <div class="flex items-center gap-2 rounded-field bg-base-200/60 px-3 py-2">
        <Trophy :size="15" class="text-base-content/50" />
        <span class="text-sm font-medium"
          >{{ totalPoints }} {{ $t('examFormatUi.points') }} ·
          {{ $t('examFormatUi.modulesCount', { count: modules.length }) }}</span
        >
      </div>
    </div>

    <!-- Per-skill structure cards -->
    <section
      v-for="mod in modules"
      :key="mod.id"
      class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden"
    >
      <!-- Skill header -->
      <div
        class="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-base-300 bg-base-200/40"
      >
        <span
          class="w-11 h-11 rounded-box grid place-items-center shrink-0"
          :class="[`bg-${mod.id}-tint`, `text-${mod.id}`]"
        >
          <component :is="icon(mod.id)" :size="20" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="font-display text-xl font-bold leading-none">{{ shortLabel(mod) }}</h2>
            <span
              class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
              :class="[`bg-${mod.id}-tint`, `text-${mod.id}`]"
              >{{ mod.parts.length }} {{ $t('examFormatUi.partsLower') }}</span
            >
          </div>
          <p class="text-sm text-base-content/60 mt-1 max-w-2xl">{{ mod.summary }}</p>
        </div>
        <div class="flex items-center gap-5 shrink-0">
          <StructureStat
            :icon="Clock"
            :label="$t('examFormatUi.examTime')"
            :value="`${mod.minutes} ${$t('examFormatUi.min')}`"
          />
          <StructureStat
            :icon="Layers"
            :label="$t('examFormatUi.parts')"
            :value="String(mod.parts.length)"
          />
        </div>
      </div>

      <!-- Parts -->
      <div class="divide-y divide-base-300">
        <div
          v-for="part in mod.parts"
          :key="part.n"
          class="flex flex-col gap-4 px-5 py-4 transition-colors md:flex-row"
          :class="partRowClass(part.available)"
        >
          <div class="flex md:flex-col items-center md:items-start gap-2 md:w-32 shrink-0">
            <span
              class="w-9 h-9 rounded-field grid place-items-center font-display font-bold"
              :class="`module-chip-${mod.id} is-active`"
              >{{ part.n }}</span
            >
            <span
              class="text-[11px] font-semibold uppercase tracking-wider text-base-content/45 md:mt-1"
              >{{ $t('examFormatUi.part') }} {{ part.n }}</span
            >
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <div class="font-display text-[17px] font-bold leading-tight">{{ part.title }}</div>
              <span v-if="part.available === false" class="badge badge-warning badge-sm">
                {{ $t('examFormatUi.comingLater') }}
              </span>
            </div>
            <div
              class="mt-1 inline-flex items-center gap-1.5 text-xs font-mono text-base-content/70 bg-base-200 rounded-selector px-2 py-1"
            >
              <ListChecks :size="12" /> {{ part.format }}
            </div>
            <div class="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              <div class="flex gap-2">
                <Target :size="14" class="mt-0.5 shrink-0" :class="`text-${mod.id}`" />
                <div>
                  <div
                    class="text-[10px] font-semibold uppercase tracking-wider text-base-content/45"
                  >
                    {{ $t('examFormatUi.goal') }}
                  </div>
                  <div class="text-[13px] text-base-content/80 leading-snug">{{ part.goal }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <CheckCircle2 :size="14" class="mt-0.5 shrink-0" :class="`text-${mod.id}`" />
                <div>
                  <div
                    class="text-[10px] font-semibold uppercase tracking-wider text-base-content/45"
                  >
                    {{ $t('examFormatUi.skillTested') }}
                  </div>
                  <div class="text-[13px] text-base-content/80 leading-snug">{{ part.skill }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="shrink-0 md:self-center">
            <button
              class="btn btn-sm btn-ghost gap-1.5 rounded-full hover:bg-base-200"
              :disabled="part.available === false"
              @click="practice(mod.id, part.n)"
            >
              {{ $t('examFormatUi.practice') }} <ArrowRight :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Scoring note -->
      <div
        class="px-5 py-3 border-t border-base-300 bg-base-200/40 text-xs text-base-content/60 flex items-center gap-2"
      >
        <Calculator :size="13" />
        {{ mod.scoringNote }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  PenLine,
  Headphones,
  Mic,
  Clock,
  Trophy,
  Calculator,
  Flag,
  Layers,
  ListChecks,
  Target,
  CheckCircle2,
  ArrowRight,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { ExamModule } from '@exam-one/exam-packs'
import { packTotalMinutes, packTotalPoints } from '@exam-one/exam-packs'
import type { SkillId } from '~/utils/labels'
import StructureStat from '~/components/examFormat/StructureStat.vue'

usePageMeta('pageMeta.examFormatTitle', 'pageMeta.examFormatSubtitle')
useHead({ title: 'Exam format — Exam.one' })

const router = useRouter()

const { pack } = useActivePack()
const modules = computed(() => pack.value.structure)
const totalMinutes = computed(() => packTotalMinutes(pack.value))
const totalPoints = computed(() => packTotalPoints(pack.value))
const totalParts = computed(() => modules.value.reduce((sum, m) => sum + m.parts.length, 0))

const ICONS: Record<SkillId, Component> = {
  reading: BookOpen,
  writing: PenLine,
  listening: Headphones,
  speaking: Mic,
}

function icon(skill: SkillId): Component {
  return ICONS[skill]
}

// "Reading (Lesen)" → "Reading"
function shortLabel(mod: ExamModule): string {
  return mod.label.replace(/\s*\(.*\)\s*/, '')
}

function practice(skill: SkillId, part?: number) {
  router.push({
    path: '/exercises',
    query: part ? { skill, part: String(part) } : { skill },
  })
}

function partRowClass(available?: boolean): string {
  return available === false ? 'bg-base-200/40 opacity-75' : 'hover:bg-base-200/30'
}
</script>
