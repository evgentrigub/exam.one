<template>
  <aside class="w-60 shrink-0 h-full flex flex-col bg-base-100 border-r border-base-300 overflow-y-auto">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 px-4 h-14 shrink-0 border-b border-base-300">
      <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <span class="text-primary-content font-bold text-sm font-display">E</span>
      </div>
      <span class="font-display text-base font-semibold tracking-tight">Examl.one</span>
    </div>

    <!-- Main nav -->
    <nav class="flex flex-col gap-0.5 px-2 pt-3 pb-1">
      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium transition-colors hover:bg-base-200"
        :class="isActive('/dashboard') ? 'nav-item-active' : 'text-base-content/70'"
      >
        <LayoutDashboard :size="16" />
        Dashboard
      </NuxtLink>
      <NuxtLink
        to="/exercises"
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium transition-colors hover:bg-base-200"
        :class="isActive('/exercises') ? 'nav-item-active' : 'text-base-content/70'"
      >
        <BookOpen :size="16" />
        Exercises
      </NuxtLink>
      <span
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium opacity-40 cursor-not-allowed"
      >
        <FileText :size="16" />
        Mock exams
      </span>
      <span
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium opacity-40 cursor-not-allowed"
      >
        <TrendingUp :size="16" />
        Progress
      </span>
    </nav>

    <!-- Practice by skill -->
    <div class="px-4 mt-4">
      <p class="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-1.5">Practice by skill</p>
      <div class="flex flex-col gap-0.5">
        <NuxtLink
          to="/exercises?skill=reading"
          class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm transition-colors hover:bg-base-200"
          :class="isSkillActive('reading') ? 'nav-item-active' : 'text-base-content/70'"
        >
          <span class="flex items-center gap-2">
            <BookOpen :size="14" class="text-reading" />
            Reading
          </span>
          <span class="level-pip text-reading">{{ readingCount }}</span>
        </NuxtLink>
        <NuxtLink
          to="/exercises?skill=writing"
          class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm transition-colors hover:bg-base-200"
          :class="isSkillActive('writing') ? 'nav-item-active' : 'text-base-content/70'"
        >
          <span class="flex items-center gap-2">
            <PenLine :size="14" class="text-writing" />
            Writing
          </span>
          <span class="level-pip text-writing">{{ writingCount }}</span>
        </NuxtLink>
        <span class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm opacity-40 cursor-not-allowed">
          <span class="flex items-center gap-2">
            <Headphones :size="14" class="text-listening" />
            Listening
          </span>
          <span class="level-pip">0</span>
        </span>
        <span class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm opacity-40 cursor-not-allowed">
          <span class="flex items-center gap-2">
            <Mic :size="14" class="text-speaking" />
            Speaking
          </span>
          <span class="level-pip">0</span>
        </span>
      </div>
    </div>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Exam target widget -->
    <div class="mx-3 mb-4 rounded-box p-3" style="background: color-mix(in oklab, var(--color-primary) 10%, transparent);">
      <div class="flex items-center gap-2 mb-2">
        <Flag :size="14" class="text-primary" />
        <span class="text-xs font-semibold text-primary">Exam target</span>
      </div>
      <div class="flex gap-1">
        <button
          v-for="level in levels"
          :key="level"
          class="level-pip flex-1 text-center cursor-pointer transition-all"
          :class="examLevel === level ? 'bg-primary text-primary-content' : 'hover:bg-base-200'"
          @click="examLevel = level"
        >
          {{ level }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  LayoutDashboard, BookOpen, FileText, TrendingUp,
  PenLine, Headphones, Mic, Flag
} from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useWritingTopics } from '~/composables/useWritingTopics'

const route = useRoute()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)

const levels: Array<'A2' | 'C1'> = ['A2', 'C1']

const { getTexts } = useReadingTexts()
const { getTopics } = useWritingTopics()

const readingCount = computed(() => getTexts().length)
const writingCount = computed(() => getTopics().length)

function isActive(path: string) {
  return route.path === path
}

function isSkillActive(skill: string) {
  return route.path === '/exercises' && route.query['skill'] === skill
}
</script>
