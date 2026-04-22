<template>
  <div class="max-w-[1240px] mx-auto p-6 space-y-6">

    <!-- Hero section -->
    <div class="grid lg:grid-cols-2 gap-5">

      <!-- Left: Countdown + skill readiness -->
      <div class="flex flex-col gap-4">
        <!-- Countdown card -->
        <div class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
          <!-- Gradient top strip with dot pattern -->
          <div class="h-1.5 w-full" style="background: linear-gradient(90deg, var(--color-primary), var(--color-accent));" />
          <div class="dot-pattern p-5">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-mono text-5xl font-bold text-base-content leading-none">{{ daysLeft }}</div>
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

        <!-- 4 skill chips with spark bars -->
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink
            v-for="skill in skills"
            :key="skill.key"
            :to="`/exercises?skill=${skill.key}`"
            class="bg-base-100 border border-base-300 ring-soft rounded-box p-4 card-hov flex flex-col gap-2 exam-skill-chip"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <component :is="skill.icon" :size="14" :class="`text-${skill.key}`" />
                <span class="text-xs font-semibold" :class="`text-${skill.key}`">{{ skill.label }}</span>
              </div>
              <span class="font-mono text-xs font-semibold text-base-content/50">{{ skill.pct }}%</span>
            </div>
            <!-- Spark bar -->
            <div class="spark" :class="`text-${skill.key}`">
              <span v-for="(h, i) in skill.spark" :key="i" :style="{ height: h + 'px' }" />
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Right: Upcoming sessions placeholder -->
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold">Upcoming sessions</span>
          <NuxtLink to="/exercises" class="text-xs text-primary hover:underline">See all</NuxtLink>
        </div>

        <div v-if="continueExercises.length === 0" class="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <BookOpen :size="20" class="text-primary" />
          </div>
          <p class="text-sm font-medium text-base-content">No sessions yet</p>
          <p class="text-xs text-base-content/50 mt-1">Start an exercise to see it here</p>
          <NuxtLink to="/exercises" class="btn btn-primary btn-sm mt-4 gap-2">
            <Plus :size="14" />
            Browse exercises
          </NuxtLink>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="ex in continueExercises"
            :key="ex.id"
            class="flex items-center gap-3 p-3 rounded-field bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
            @click="navigateToExercise(ex)"
          >
            <div class="w-8 h-8 rounded-selector flex items-center justify-center shrink-0" :class="`bg-${ex.skill}-soft`">
              <component :is="skillIcon(ex.skill)" :size="14" :class="`text-${ex.skill}`" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ ex.title }}</p>
              <p class="text-xs text-base-content/50">{{ ex.minutes }} min · {{ ex.difficulty }}</p>
            </div>
            <ChevronRight :size="14" class="text-base-content/30 shrink-0" />
          </div>
        </div>
      </div>
    </div>

    <!-- Continue practicing -->
    <ClientOnly>
      <section v-if="allExercises.length > 0">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold">Continue practicing</h2>
          <NuxtLink to="/exercises" class="text-xs text-primary hover:underline">All exercises</NuxtLink>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="ex in recentExercises"
            :key="ex.id"
            class="bg-base-100 border border-base-300 ring-soft rounded-box p-5 card-hov cursor-pointer"
            @click="navigateToExercise(ex)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="w-9 h-9 rounded-selector flex items-center justify-center" :class="`bg-${ex.skill}-soft`">
                <component :is="skillIcon(ex.skill)" :size="16" :class="`text-${ex.skill}`" />
              </div>
              <span class="level-pip">{{ ex.difficulty }}</span>
            </div>
            <p class="text-sm font-semibold mb-1 line-clamp-2">{{ ex.title }}</p>
            <p class="text-xs text-base-content/50 capitalize">{{ ex.skill }} · {{ ex.type }}</p>
            <div class="mt-3 flex items-center gap-2">
              <progress class="progress progress-primary flex-1 h-1.5" :value="getProgress(ex)" max="100" />
              <span class="text-xs font-mono text-base-content/50">{{ getProgress(ex) }}%</span>
            </div>
          </div>
        </div>
      </section>
    </ClientOnly>

    <!-- Progress overview -->
    <ClientOnly>
      <section>
        <h2 class="text-sm font-semibold mb-3">Progress overview</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="stat in statsCards"
            :key="stat.label"
            class="bg-base-100 border border-base-300 ring-soft rounded-box p-4"
          >
            <div class="text-2xl font-bold font-mono" :class="stat.color">{{ stat.value }}</div>
            <div class="text-xs text-base-content/50 mt-0.5">{{ stat.label }}</div>
          </div>
        </div>
      </section>
    </ClientOnly>

  </div>
</template>

<script setup lang="ts">
import { BookOpen, PenLine, Headphones, Mic, Plus, ChevronRight } from 'lucide-vue-next'
import type { Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useProgress } from '~/composables/useProgress'
import { germanTexts } from '~/data/german-texts'

usePageMeta('Dashboard', 'Your exam preparation overview')

useHead({ title: 'Dashboard — Examl.one' })

const router = useRouter()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)

const { getTexts } = useReadingTexts()
const { getTopics } = useWritingTopics()
const { getProgressStats, getWritingStats, isTextCompleted, isWritingTopicCompleted } = useProgress()

// Days left calculation — target 90 days from app launch as placeholder
const daysLeft = computed(() => {
  const target = new Date('2026-07-01')
  const diff = Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000))
  return diff
})

const readinessStatement = computed(() => {
  const stats = getProgressStats()
  const rate = stats.completionRate ?? 0
  if (rate >= 80) return 'You\'re well prepared — keep it up!'
  if (rate >= 50) return 'Good progress — focus on weak spots'
  return 'Keep practicing to improve your readiness'
})

// Skill chips data
const skills = computed(() => {
  const readingTexts = getTexts()
  const writingTopics = getTopics()
  const readingDone = readingTexts.filter(t => isTextCompleted(t.id)).length
  const writingDone = writingTopics.filter(t => isWritingTopicCompleted(t.id)).length

  return [
    {
      key: 'reading',
      label: 'Reading',
      icon: BookOpen,
      pct: readingTexts.length ? Math.round((readingDone / readingTexts.length) * 100) : 0,
      spark: [8, 14, 10, 18, 12, 20, 16, 24, 18, 28]
    },
    {
      key: 'writing',
      label: 'Writing',
      icon: PenLine,
      pct: writingTopics.length ? Math.round((writingDone / writingTopics.length) * 100) : 0,
      spark: [6, 10, 8, 14, 10, 16, 12, 18, 14, 20]
    },
    {
      key: 'listening',
      label: 'Listening',
      icon: Headphones,
      pct: 0,
      spark: [4, 8, 6, 10, 8, 12, 10, 14, 12, 16]
    },
    {
      key: 'speaking',
      label: 'Speaking',
      icon: Mic,
      pct: 0,
      spark: [5, 9, 7, 11, 9, 13, 11, 15, 13, 17]
    }
  ]
})

type DashExercise = {
  id: string
  skill: string
  title: string
  type: string
  difficulty: string
  minutes: number
  pct: number
}

// Unified exercise list
const allExercises = computed<DashExercise[]>(() => {
  const rStats = getProgressStats()
  const reading: DashExercise[] = getTexts().map(t => {
    const activity = rStats.recentActivity?.find((a: { textId: string; percentage: number }) => a.textId === t.id)
    return {
      id: t.id,
      skill: 'reading',
      title: t.title,
      type: t.textType,
      difficulty: t.difficulty,
      minutes: t.estimatedReadingTime,
      pct: activity ? activity.percentage : 0
    }
  })
  const writing: DashExercise[] = getTopics().map(t => ({
    id: t.id,
    skill: 'writing',
    title: t.title,
    type: t.topicType,
    difficulty: t.difficulty,
    minutes: t.estimatedTime,
    pct: isWritingTopicCompleted(t.id) ? 100 : 0
  }))
  return [...reading, ...writing]
})

// 3 most recent not completed for "continue" section
const continueExercises = computed(() =>
  allExercises.value.filter(ex => ex.pct === 0).slice(0, 3)
)

// 6 exercises for the "continue practicing" grid
const recentExercises = computed(() => allExercises.value.slice(0, 6))

function getProgress(ex: DashExercise): number {
  return ex.pct
}

function skillIcon(skill: string): Component {
  const map: Record<string, Component> = {
    reading: BookOpen,
    writing: PenLine,
    listening: Headphones,
    speaking: Mic
  }
  return map[skill] ?? BookOpen
}

function navigateToExercise(ex: DashExercise) {
  if (ex.skill === 'reading') router.push(`/reading/${ex.id}`)
  else if (ex.skill === 'writing') router.push(`/writing/${ex.id}/exam`)
}

// Stats cards
const statsCards = computed(() => {
  const rStats = getProgressStats()
  const wStats = getWritingStats()
  return [
    { label: 'Reading completed', value: `${rStats.totalTextsCompleted ?? 0}/${germanTexts.length}`, color: 'text-reading' },
    { label: 'Writing completed', value: `${wStats.totalTopicsCompleted ?? 0}/${getTopics().length}`, color: 'text-writing' },
    { label: 'Best reading score', value: `${rStats.bestScore ?? 0}%`, color: 'text-primary' },
    { label: 'Total attempts', value: String((rStats.totalAttempts ?? 0) + (wStats.totalSubmissions ?? 0)), color: 'text-base-content/70' }
  ]
})
</script>
