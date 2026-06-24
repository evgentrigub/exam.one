<template>
  <aside class="w-60 shrink-0 h-full flex flex-col bg-base-100 border-r border-base-300 overflow-y-auto">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 px-4 h-14 shrink-0 border-b border-base-300">
      <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <span class="text-primary-content font-bold text-sm font-display">E</span>
      </div>
      <span class="font-display text-base font-semibold tracking-tight">Exam.one</span>
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
      <NuxtLink
        to="/exam-format"
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium transition-colors hover:bg-base-200"
        :class="isActive('/exam-format') ? 'nav-item-active' : 'text-base-content/70'"
      >
        <ListTree :size="16" />
        Exam format
      </NuxtLink>
      <NuxtLink
        to="/progress"
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium transition-colors hover:bg-base-200"
        :class="isActive('/progress') ? 'nav-item-active' : 'text-base-content/70'"
      >
        <TrendingUp :size="16" />
        Progress
      </NuxtLink>
      <!-- Mock exams deferred to a later milestone -->
      <span
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium opacity-40 cursor-not-allowed"
        title="Coming soon"
      >
        <FileText :size="16" />
        Mock exams
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
        <NuxtLink
          to="/exercises?skill=listening"
          class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm transition-colors hover:bg-base-200"
          :class="isSkillActive('listening') ? 'nav-item-active' : 'text-base-content/70'"
        >
          <span class="flex items-center gap-2">
            <Headphones :size="14" class="text-listening" />
            Listening
          </span>
          <span class="level-pip text-listening">{{ listeningCount }}</span>
        </NuxtLink>
        <NuxtLink
          to="/exercises?skill=speaking"
          class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm transition-colors hover:bg-base-200"
          :class="isSkillActive('speaking') ? 'nav-item-active' : 'text-base-content/70'"
        >
          <span class="flex items-center gap-2">
            <Mic :size="14" class="text-speaking" />
            Speaking
          </span>
          <span class="level-pip text-speaking">{{ speakingCount }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Exam target widget -->
    <div class="mx-3 mb-4 rounded-box border border-primary/20 bg-primary/5 p-3 shadow-sm">
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-selector bg-primary/10">
            <Flag :size="14" class="text-primary" />
          </span>
          <div>
            <span class="block text-xs font-semibold text-primary">Exam target</span>
            <span class="block text-[10px] leading-tight text-base-content/50">Filters exercises</span>
          </div>
        </div>
        <span class="level-pip bg-primary text-primary-content">{{ examLevel }}</span>
      </div>
      <div class="grid grid-cols-2 gap-1 rounded-field bg-base-200/70 p-1">
        <button
          v-for="level in levels"
          :key="level"
          type="button"
          class="min-h-9 rounded-field px-2 py-1.5 text-center font-mono text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :class="examLevel === level ? 'bg-primary text-primary-content shadow-sm' : 'text-base-content/55 hover:bg-base-100 hover:text-base-content'"
          :aria-pressed="examLevel === level"
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
  LayoutDashboard, BookOpen, FileText, TrendingUp, ListTree,
  PenLine, Headphones, Mic, Flag
} from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useListeningExercises } from '~/composables/useListeningExercises'
import { useSpeakingExercises } from '~/composables/useSpeakingExercises'

const route = useRoute()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)

// A2 only for this build; C1 returns later.
const levels: Array<'A2' | 'C1'> = ['A2' /*, 'C1' */]

const { getTexts } = useReadingTexts()
const { getTopics } = useWritingTopics()
const { getExercises: getListening } = useListeningExercises()
const { getTopics: getSpeaking } = useSpeakingExercises()

const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})

const readingCount = computed(() => isClient.value ? getTexts().filter(text => text.difficulty === examLevel.value).length : 0)
const writingCount = computed(() => isClient.value ? getTopics().filter(topic => topic.difficulty === examLevel.value).length : 0)
const listeningCount = computed(() => isClient.value ? getListening().length : 0)
const speakingCount = computed(() => isClient.value ? getSpeaking().filter(t => t.difficulty === examLevel.value).length : 0)

function isActive(path: string) {
  return route.path === path
}

function isSkillActive(skill: string) {
  return route.path === '/exercises' && route.query['skill'] === skill
}
</script>
