<template>
  <div class="max-w-[1240px] mx-auto p-6 space-y-6">

    <!-- Hero -->
    <div class="grid lg:grid-cols-2 gap-5">
      <!-- Countdown -->
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
        <div class="h-1.5 w-full" style="background: linear-gradient(90deg, var(--color-primary), var(--color-accent, var(--color-secondary)));" />
        <div class="dot-pattern p-5">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-mono text-5xl font-bold leading-none">{{ daysLeft }}</div>
              <div class="text-sm text-base-content/50 mt-1">days until exam</div>
            </div>
            <span class="level-pip text-primary">{{ examLevel }}</span>
          </div>
          <div class="mt-3">
            <div class="font-display text-lg font-semibold">Goethe {{ examLevel }}</div>
            <div class="text-sm text-base-content/60 mt-0.5">{{ readinessStatement }}</div>
          </div>
        </div>
      </div>

      <!-- Overall readiness ring -->
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5 flex items-center gap-6">
        <ClientOnly>
          <div class="ring-prog shrink-0" style="width: 96px" :style="{ '--p': overallReadiness, '--c': 'var(--color-primary)' }">
            <span class="font-mono text-base">{{ overallReadiness }}%</span>
          </div>
          <template #fallback>
            <div class="w-24 h-24 rounded-full skel shrink-0" />
          </template>
        </ClientOnly>
        <div class="min-w-0">
          <p class="text-sm font-semibold mb-1">Overall readiness</p>
          <p class="text-xs text-base-content/50 mb-3">Across all four exam skills</p>
          <NuxtLink to="/progress" class="btn btn-sm btn-outline gap-1.5">
            <component :is="iconTrendingUp" :size="14" />
            View progress
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 4 skill tiles -->
    <ClientOnly>
      <section>
        <h2 class="text-sm font-semibold mb-3">Skill readiness</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <NuxtLink
            v-for="stat in skillStats"
            :key="stat.id"
            :to="`/exercises?skill=${stat.id}`"
            class="bg-base-100 border border-base-300 ring-soft rounded-box p-4 card-hov exam-skill-chip"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <component :is="icon(stat.id)" :size="15" :class="meta(stat.id).textClass" />
                <span class="text-xs font-semibold" :class="meta(stat.id).textClass">{{ label(stat.id) }}</span>
              </div>
              <span class="font-mono text-xs font-semibold text-base-content/50">{{ stat.readiness }}%</span>
            </div>
            <progress class="progress h-1.5 w-full" :class="meta(stat.id).progressClass" :value="stat.readiness" max="100" />
            <p class="text-[11px] text-base-content/50 mt-2">{{ stat.completed }}/{{ stat.total }} done</p>
          </NuxtLink>
        </div>
      </section>
    </ClientOnly>

    <!-- Continue practicing + weak spots -->
    <ClientOnly>
      <div class="grid lg:grid-cols-3 gap-5">
        <!-- Continue practicing -->
        <section class="lg:col-span-2">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold">Continue practicing</h2>
            <NuxtLink to="/exercises" class="text-xs text-primary hover:underline">All exercises</NuxtLink>
          </div>

          <div v-if="continueExercises.length === 0" class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <component :is="iconBookOpen" :size="20" class="text-primary" />
            </div>
            <p class="text-sm font-medium">Nothing in progress</p>
            <p class="text-xs text-base-content/50 mt-1">Start an exercise to see it here</p>
            <NuxtLink to="/exercises" class="btn btn-primary btn-sm mt-4 gap-2">
              <component :is="iconPlus" :size="14" /> Browse exercises
            </NuxtLink>
          </div>

          <div v-else class="grid sm:grid-cols-2 gap-4">
            <div
              v-for="ex in continueExercises"
              :key="`${ex.skill}-${ex.id}`"
              class="bg-base-100 border border-base-300 ring-soft rounded-box p-5 card-hov cursor-pointer"
              @click="navigateToExercise(ex)"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="w-9 h-9 rounded-selector flex items-center justify-center" :class="meta(ex.skill).softBgClass">
                  <component :is="icon(ex.skill)" :size="16" :class="meta(ex.skill).textClass" />
                </div>
                <span class="level-pip">{{ ex.difficulty }}</span>
              </div>
              <p class="text-sm font-semibold mb-1 line-clamp-2">{{ ex.title }}</p>
              <p class="text-xs text-base-content/50">{{ label(ex.skill) }} · {{ ex.minutes }} min</p>
              <div class="mt-3 flex items-center gap-2">
                <progress class="progress flex-1 h-1.5" :class="meta(ex.skill).progressClass" :value="ex.pct" max="100" />
                <span class="text-xs font-mono text-base-content/50">{{ ex.pct }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Weak spots + recommended -->
        <section class="space-y-5">
          <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
            <h2 class="text-sm font-semibold mb-3">Focus next</h2>
            <div class="space-y-3">
              <div v-for="stat in weakestSkills.slice(0, 3)" :key="stat.id" class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-selector flex items-center justify-center shrink-0" :class="meta(stat.id).softBgClass">
                  <component :is="icon(stat.id)" :size="14" :class="meta(stat.id).textClass" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">{{ label(stat.id) }}</span>
                    <span class="text-xs font-mono text-base-content/50">{{ stat.readiness }}%</span>
                  </div>
                  <progress class="progress h-1 w-full mt-1" :class="meta(stat.id).progressClass" :value="stat.readiness" max="100" />
                </div>
              </div>
            </div>
          </div>

          <!-- Recommended -->
          <div v-if="recommended" class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
            <h2 class="text-sm font-semibold mb-3">Recommended</h2>
            <div class="flex items-start gap-3 cursor-pointer" @click="navigateToExercise(recommended)">
              <div class="w-9 h-9 rounded-selector flex items-center justify-center shrink-0" :class="meta(recommended.skill).softBgClass">
                <component :is="icon(recommended.skill)" :size="16" :class="meta(recommended.skill).textClass" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold line-clamp-2">{{ recommended.title }}</p>
                <p class="text-xs text-base-content/50 mt-0.5">{{ label(recommended.skill) }} · {{ recommended.minutes }} min</p>
              </div>
            </div>
          </div>

          <!-- Mock exam (deferred) -->
          <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5 opacity-70">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold">Mock exam</h2>
              <span class="badge badge-ghost badge-sm">Soon</span>
            </div>
            <p class="text-xs text-base-content/50 mt-1">Full timed mock exams are coming in a later update.</p>
          </div>
        </section>
      </div>
    </ClientOnly>

  </div>
</template>

<script setup lang="ts">
import { BookOpen, PenLine, Headphones, Mic, Plus, TrendingUp } from 'lucide-vue-next'
import type { Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useListeningExercises } from '~/composables/useListeningExercises'
import { useSpeakingExercises } from '~/composables/useSpeakingExercises'
import { useProgress } from '~/composables/useProgress'
import { useSkillStats } from '~/composables/useSkillStats'
import { useAccountProfile } from '~/composables/useAccountProfile'
import { getSkillMeta, getSkillLabel, type SkillId } from '~/utils/labels'

usePageMeta('pageMeta.dashboardTitle', 'pageMeta.dashboardSubtitle')
useHead({ title: 'Dashboard — Exam.one' })

const { t } = useI18n()
const router = useRouter()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)

const { skillStats, overallReadiness, weakestSkills } = useSkillStats()
const { daysUntilExam } = useAccountProfile()
const daysLeft = daysUntilExam

const { getTexts } = useReadingTexts()
const { getTopics } = useWritingTopics()
const { getExercises: getListening } = useListeningExercises()
const { getTopics: getSpeaking } = useSpeakingExercises()
const {
  getTextProgress,
  isTextCompleted,
  isWritingTopicCompleted,
  getListeningProgress,
  isListeningCompleted,
  isSpeakingCompleted,
} = useProgress()

const ICONS: Record<SkillId, Component> = { reading: BookOpen, writing: PenLine, listening: Headphones, speaking: Mic }
const iconBookOpen = BookOpen
const iconPlus = Plus
const iconTrendingUp = TrendingUp
function icon(skill: SkillId): Component { return ICONS[skill] }
function meta(skill: SkillId) { return getSkillMeta(skill) }
function label(skill: SkillId) { return getSkillLabel(skill, t) }

const readinessStatement = computed(() => {
  const r = overallReadiness.value
  if (r >= 80) return 'You\'re well prepared — keep it up!'
  if (r >= 50) return 'Good progress — focus on your weak spots'
  return 'Keep practicing to build your readiness'
})

interface DashExercise {
  id: string
  skill: SkillId
  title: string
  difficulty: string
  minutes: number
  pct: number
}

const allExercises = computed<DashExercise[]>(() => {
  const reading = getTexts().filter(t => t.difficulty === examLevel.value).map(t => ({
    id: t.id, skill: 'reading' as const, title: t.title, difficulty: t.difficulty,
    minutes: t.estimatedReadingTime,
    pct: getTextProgress(t.id)?.percentage ?? (isTextCompleted(t.id) ? 100 : 0),
  }))
  const writing = getTopics().filter(t => t.difficulty === examLevel.value).map(t => ({
    id: t.id, skill: 'writing' as const, title: t.title, difficulty: t.difficulty,
    minutes: t.estimatedTime, pct: isWritingTopicCompleted(t.id) ? 100 : 0,
  }))
  const listening = getListening().filter(e => e.difficulty === examLevel.value).map(e => ({
    id: e.id ?? '', skill: 'listening' as const, title: e.title, difficulty: e.difficulty,
    minutes: 6, pct: getListeningProgress(e.id ?? '')?.percentage ?? (isListeningCompleted(e.id ?? '') ? 100 : 0),
  }))
  const speaking = getSpeaking().filter(t => t.difficulty === examLevel.value).map(t => ({
    id: t.id, skill: 'speaking' as const, title: t.theme, difficulty: t.difficulty,
    minutes: 7, pct: isSpeakingCompleted(t.id) ? 100 : 0,
  }))
  return [...reading, ...writing, ...listening, ...speaking]
})

const continueExercises = computed(() =>
  allExercises.value.filter(ex => ex.pct > 0 && ex.pct < 100).slice(0, 4),
)

// First not-started exercise from the weakest skill that has exercises.
const recommended = computed<DashExercise | null>(() => {
  for (const stat of weakestSkills.value) {
    const candidate = allExercises.value.find(ex => ex.skill === stat.id && ex.pct === 0)
    if (candidate) return candidate
  }
  return allExercises.value.find(ex => ex.pct === 0) ?? null
})

function navigateToExercise(ex: DashExercise) {
  if (ex.skill === 'reading') router.push(`/reading/${ex.id}`)
  else if (ex.skill === 'writing') router.push(`/writing/${ex.id}/exam`)
  else if (ex.skill === 'listening') router.push(`/listening/${ex.id}`)
  else if (ex.skill === 'speaking') router.push(`/speaking/${ex.id}`)
}
</script>
