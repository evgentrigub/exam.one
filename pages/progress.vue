<template>
  <div class="max-w-[1100px] mx-auto p-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-display font-semibold">Your progress</h1>
      <p class="text-sm text-base-content/60">Readiness across all four skills, from your local practice history.</p>
    </div>

    <ClientOnly>
      <!-- Summary stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5 flex items-center gap-4">
          <div class="ring-prog shrink-0" :style="{ '--p': overallReadiness, '--c': 'var(--color-primary)' }">
            <span class="font-mono">{{ overallReadiness }}%</span>
          </div>
          <div>
            <p class="text-xs text-base-content/50">Overall readiness</p>
            <p class="text-sm font-semibold">{{ readinessLabel }}</p>
          </div>
        </div>
        <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
          <div class="text-3xl font-bold font-mono text-primary">{{ totalCompleted }}</div>
          <p class="text-xs text-base-content/50 mt-1">Exercises completed</p>
        </div>
        <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
          <div class="text-3xl font-bold font-mono text-success">{{ totalSessions }}</div>
          <p class="text-xs text-base-content/50 mt-1">Total attempts</p>
        </div>
        <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
          <div class="text-3xl font-bold font-mono">{{ daysLeft }}</div>
          <p class="text-xs text-base-content/50 mt-1">Days until exam</p>
        </div>
      </div>

      <!-- Per-skill readiness + chart -->
      <div class="grid lg:grid-cols-3 gap-5">
        <!-- Skill cards -->
        <div class="lg:col-span-2 space-y-3">
          <h2 class="text-sm font-semibold">Per-skill readiness</h2>
          <div
            v-for="stat in skillStats"
            :key="stat.id"
            class="bg-base-100 border border-base-300 ring-soft rounded-box p-4 flex items-center gap-4"
          >
            <div class="w-10 h-10 rounded-selector flex items-center justify-center shrink-0" :class="meta(stat.id).softBgClass">
              <component :is="icon(stat.id)" :size="18" :class="meta(stat.id).textClass" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-semibold">{{ label(stat.id) }}</span>
                <span class="font-mono text-sm font-semibold" :class="meta(stat.id).textClass">{{ stat.readiness }}%</span>
              </div>
              <progress class="progress h-2 w-full" :class="meta(stat.id).progressClass" :value="stat.readiness" max="100" />
              <p class="text-[11px] text-base-content/50 mt-1">
                {{ stat.completed }}/{{ stat.total }} completed · {{ stat.sessions }} attempts
              </p>
            </div>
          </div>
        </div>

        <!-- Readiness chart -->
        <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
          <h2 class="text-sm font-semibold mb-4">Readiness by skill</h2>
          <div class="flex items-end justify-around gap-2 h-44">
            <div v-for="stat in skillStats" :key="stat.id" class="flex flex-col items-center gap-2 flex-1">
              <span class="font-mono text-[10px] text-base-content/50">{{ stat.readiness }}%</span>
              <div class="w-full flex items-end justify-center" style="height: 120px">
                <div
                  class="w-7 rounded-t-md transition-all"
                  :class="meta(stat.id).textClass"
                  :style="{ height: `${Math.max(4, (stat.readiness / 100) * 120)}px`, background: 'currentColor' }"
                />
              </div>
              <component :is="icon(stat.id)" :size="14" :class="meta(stat.id).textClass" />
            </div>
          </div>
        </div>
      </div>

      <!-- Recent activity + strengths/focus -->
      <div class="grid lg:grid-cols-3 gap-5">
        <!-- Recent activity -->
        <div class="lg:col-span-2 bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
          <div class="p-4 border-b border-base-300">
            <h2 class="text-sm font-semibold">Recent activity</h2>
          </div>
          <div v-if="recentActivity.length === 0" class="p-8 text-center text-sm text-base-content/50">
            No activity yet. Complete an exercise to start tracking.
          </div>
          <div v-else class="divide-y divide-base-200">
            <div v-for="item in recentActivity" :key="`${item.skill}-${item.id}-${item.completedAt}`" class="flex items-center gap-3 p-4">
              <div class="w-8 h-8 rounded-selector flex items-center justify-center shrink-0" :class="meta(item.skill).softBgClass">
                <component :is="icon(item.skill)" :size="14" :class="meta(item.skill).textClass" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ item.title }}</p>
                <p class="text-xs text-base-content/50">{{ label(item.skill) }} · {{ item.detail }}</p>
              </div>
              <span v-if="item.percentage !== undefined" class="font-mono text-sm font-semibold" :class="scoreClass(item.percentage)">
                {{ item.percentage }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Strengths / focus -->
        <div class="space-y-5">
          <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
            <div class="flex items-center gap-2 mb-3">
              <TrendingUp :size="15" class="text-success" />
              <h2 class="text-sm font-semibold">Strengths</h2>
            </div>
            <div v-if="strongest" class="flex items-center gap-2 text-sm">
              <component :is="icon(strongest.id)" :size="14" :class="meta(strongest.id).textClass" />
              <span>{{ label(strongest.id) }} — {{ strongest.readiness }}%</span>
            </div>
            <p v-else class="text-xs text-base-content/50">Practice more to reveal your strengths.</p>
          </div>

          <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
            <div class="flex items-center gap-2 mb-3">
              <Target :size="15" class="text-warning" />
              <h2 class="text-sm font-semibold">Focus areas</h2>
            </div>
            <div class="space-y-2">
              <NuxtLink
                v-for="stat in weakestSkills.slice(0, 3)"
                :key="stat.id"
                :to="`/exercises?skill=${stat.id}`"
                class="flex items-center justify-between gap-2 text-sm hover:text-primary transition-colors"
              >
                <span class="flex items-center gap-2">
                  <component :is="icon(stat.id)" :size="14" :class="meta(stat.id).textClass" />
                  {{ label(stat.id) }}
                </span>
                <span class="font-mono text-xs text-base-content/50">{{ stat.readiness }}%</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, PenLine, Headphones, Mic, TrendingUp, Target } from 'lucide-vue-next'
import type { Component } from 'vue'
import { useSkillStats } from '~/composables/useSkillStats'
import { useAccountProfile } from '~/composables/useAccountProfile'
import { getSkillMeta, getSkillLabel, getScoreTextClass, type SkillId } from '~/utils/labels'

usePageMeta('Progress', 'Track your readiness across all four skills')
useHead({ title: 'Progress — Exam.one' })

const { t } = useI18n()
const { skillStats, overallReadiness, totalCompleted, weakestSkills, recentActivity } = useSkillStats()
const { daysUntilExam } = useAccountProfile()
const daysLeft = daysUntilExam

const ICONS: Record<SkillId, Component> = { reading: BookOpen, writing: PenLine, listening: Headphones, speaking: Mic }
function icon(skill: SkillId): Component { return ICONS[skill] }
function meta(skill: SkillId) { return getSkillMeta(skill) }
function label(skill: SkillId) { return getSkillLabel(skill, t) }
function scoreClass(pct: number) { return getScoreTextClass(pct) }

const totalSessions = computed(() => skillStats.value.reduce((sum, s) => sum + s.sessions, 0))

const strongest = computed(() => {
  const withProgress = [...skillStats.value].filter(s => s.readiness > 0)
  if (withProgress.length === 0) return null
  return withProgress.sort((a, b) => b.readiness - a.readiness)[0]
})

const readinessLabel = computed(() => {
  const r = overallReadiness.value
  if (r >= 80) return 'Exam-ready'
  if (r >= 50) return 'On track'
  if (r > 0) return 'Getting started'
  return 'Not started'
})
</script>
