<template>
  <div class="mx-auto max-w-[1080px] space-y-6 px-4 py-8 sm:px-6">
    <div>
      <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        <FileBadge :size="14" /> {{ $t('mockExam.fullSimulation') }}
      </div>
      <h1 class="mt-2 font-display text-3xl font-bold">{{ $t('mockExam.title') }}</h1>
      <p class="mt-1 text-sm text-base-content/60">{{ $t('mockExam.listDescription') }}</p>
    </div>

    <ClientOnly>
      <div class="grid gap-5 lg:grid-cols-2">
        <article class="card border border-base-300 bg-base-100 ring-soft">
          <div class="card-body gap-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <span class="level-pip">A2</span>
                <h2 class="mt-2 font-display text-xl font-bold">{{ set.title }}</h2>
              </div>
              <span class="badge" :class="statusClass">{{ statusLabel }}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div v-for="module in set.modules" :key="module.skill" class="rounded-field bg-base-200 p-2.5">
                <div class="font-semibold">{{ $t(`skill.${module.skill}`) }}</div>
                <div class="mt-0.5 text-base-content/50">{{ module.minutes }} {{ $t('mockExam.minutes') }}</div>
              </div>
            </div>

            <div>
              <div class="mb-1 flex justify-between text-xs text-base-content/55">
                <span>{{ $t('mockExam.progress') }}</span>
                <span class="font-mono">{{ doneExerciseCount }}/{{ totalExerciseCount }}</span>
              </div>
              <progress class="progress progress-primary h-2 w-full" :value="doneExerciseCount" :max="totalExerciseCount" />
            </div>

            <div class="card-actions mt-auto justify-end">
              <NuxtLink :to="`/mock-exam/${set.id}`" class="btn btn-primary btn-sm gap-2">
                {{ actionLabel }} <ArrowRight :size="14" />
              </NuxtLink>
            </div>
          </div>
        </article>

        <article class="card border border-base-300 bg-base-100 opacity-60">
          <div class="card-body">
            <div class="flex items-start justify-between">
              <div>
                <span class="level-pip">A2</span>
                <h2 class="mt-2 font-display text-xl font-bold">Goethe-Zertifikat A2 · Set 2</h2>
              </div>
              <span class="badge badge-ghost">{{ $t('mockExam.comingSoon') }}</span>
            </div>
            <p class="text-sm text-base-content/55">{{ $t('mockExam.setTwoDescription') }}</p>
            <button class="btn btn-sm mt-auto" disabled>{{ $t('mockExam.notAvailable') }}</button>
          </div>
        </article>
      </div>

      <template #fallback>
        <div class="grid gap-5 lg:grid-cols-2">
          <div class="skeleton h-72 rounded-box" />
          <div class="skeleton h-72 rounded-box" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, FileBadge } from 'lucide-vue-next'
import { goetheA2MockExamSet1 as set } from '~/data/mockExam/goetheA2'
import { useMockExam } from '~/composables/useMockExam'

usePageMeta('Mock exams', 'Timed Goethe A2 exam simulations')
useHead({ title: 'Mock exams' })

const { state, doneExerciseCount, totalExerciseCount } = useMockExam(set)
const { t } = useI18n()

const lockedCount = computed(() => set.modules.filter(module => state.value.modules[module.skill].locked).length)
const statusLabel = computed(() => {
  if (state.value.finished) return t('mockExam.completed')
  if (state.value.startedAt || lockedCount.value > 0 || doneExerciseCount.value > 0) return t('mockExam.inProgress')
  return t('mockExam.new')
})
const statusClass = computed(() => {
  if (state.value.finished) return 'badge-success'
  if (state.value.startedAt || doneExerciseCount.value > 0) return 'badge-warning'
  return 'badge-ghost'
})
const actionLabel = computed(() => {
  if (state.value.finished) return t('mockExam.viewResults')
  if (state.value.startedAt || doneExerciseCount.value > 0) return t('mockExam.resumeExam')
  return t('mockExam.startExam')
})
</script>
