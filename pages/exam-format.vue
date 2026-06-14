<template>
  <div class="max-w-[1100px] mx-auto p-6 space-y-6">
    <!-- Intro -->
    <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-6">
      <h1 class="text-2xl font-display font-semibold mb-1">Goethe-Zertifikat A2 — exam format</h1>
      <p class="text-sm text-base-content/60 max-w-2xl">
        Every part of the exam, what it asks, and what it tests. Four modules, {{ totalPoints }} points total
        ({{ Math.round(totalPoints * 0.6) }} to pass).
      </p>
      <div class="flex flex-wrap gap-3 mt-4">
        <div class="flex items-center gap-2 rounded-field bg-base-200/60 px-3 py-2">
          <Clock :size="15" class="text-base-content/50" />
          <span class="text-sm font-medium">~{{ totalMinutes }} min written</span>
        </div>
        <div class="flex items-center gap-2 rounded-field bg-base-200/60 px-3 py-2">
          <Trophy :size="15" class="text-base-content/50" />
          <span class="text-sm font-medium">{{ totalPoints }} points · 4 modules</span>
        </div>
      </div>
    </div>

    <!-- Modules -->
    <div
      v-for="mod in modules"
      :key="mod.id"
      class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden"
    >
      <!-- Module header -->
      <div class="p-5 border-b border-base-300 flex items-start justify-between gap-4 flex-wrap" :class="`${meta(mod.id).softBgClass}`">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-selector bg-base-100 flex items-center justify-center shrink-0">
            <component :is="icon(mod.id)" :size="18" :class="meta(mod.id).textClass" />
          </div>
          <div>
            <h2 class="text-lg font-semibold">{{ mod.label }}</h2>
            <p class="text-sm text-base-content/60 max-w-xl">{{ mod.summary }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="level-pip flex items-center gap-1"><Clock :size="11" /> {{ mod.minutes }} min</span>
          <span class="level-pip">{{ mod.points }} pts</span>
        </div>
      </div>

      <!-- Parts -->
      <div class="divide-y divide-base-200">
        <div v-for="part in mod.parts" :key="part.n" class="p-5 flex gap-4">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-mono text-sm font-bold"
            :class="`${meta(mod.id).softBgClass} ${meta(mod.id).textClass}`"
          >
            {{ part.n }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <h3 class="text-sm font-semibold">{{ part.title }}</h3>
              <span class="text-[11px] font-medium text-base-content/50">{{ part.format }}</span>
            </div>
            <p class="text-sm text-base-content/70 mt-1">{{ part.short }}</p>
            <div class="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
              <p class="text-xs text-base-content/50"><span class="font-semibold text-base-content/60">Goal:</span> {{ part.goal }}</p>
              <p class="text-xs text-base-content/50"><span class="font-semibold text-base-content/60">Tests:</span> {{ part.skill }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Scoring note -->
      <div class="px-5 py-3 border-t border-base-300 bg-base-200/40 text-xs text-base-content/60 flex items-center gap-2">
        <Calculator :size="13" />
        {{ mod.scoringNote }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, PenLine, Headphones, Mic, Clock, Trophy, Calculator } from 'lucide-vue-next'
import type { Component } from 'vue'
import { goetheA2Structure, goetheA2TotalMinutes, goetheA2TotalPoints } from '~/data/examStructure/goetheA2'
import { getSkillMeta, type SkillId } from '~/utils/labels'

usePageMeta('Exam format', 'Every part of the exam, what it asks, and what it tests')
useHead({ title: 'Exam format — Exam.one' })

const modules = goetheA2Structure
const totalMinutes = goetheA2TotalMinutes
const totalPoints = goetheA2TotalPoints

const ICONS: Record<SkillId, Component> = {
  reading: BookOpen,
  writing: PenLine,
  listening: Headphones,
  speaking: Mic,
}

function meta(skill: SkillId) {
  return getSkillMeta(skill)
}
function icon(skill: SkillId): Component {
  return ICONS[skill]
}
</script>
