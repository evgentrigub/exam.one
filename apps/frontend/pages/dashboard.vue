<template>
  <div class="max-w-[1240px] mx-auto p-6 space-y-6">
    <!-- Hero: days + readiness + in-card skills + CTAs -->
    <section class="grid grid-cols-12 gap-4">
      <div
        class="col-span-12 bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden"
      >
        <div class="p-5 flex items-start gap-5">
          <div class="shrink-0">
            <NuxtLink
              v-if="!hasExamDate"
              to="/settings?section=learning"
              class="w-24 h-24 rounded-box bg-base-200 text-base-content/70 grid place-items-center hover:bg-base-300 transition-colors"
            >
              <div class="text-center px-2">
                <div class="text-[10px] font-semibold uppercase tracking-wider">
                  {{ $t('shell.setExamDate') }}
                </div>
              </div>
            </NuxtLink>
            <div
              v-else
              class="w-24 h-24 rounded-box bg-primary text-primary-content grid place-items-center"
            >
              <div class="text-center">
                <div class="font-display text-3xl font-bold leading-none">{{ daysUntilExam }}</div>
                <div class="text-[10px] font-semibold uppercase tracking-wider opacity-90 mt-1">
                  {{ $t('dashboard.daysLeft') }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 text-xs text-base-content/60">
              <Flag :size="12" />
              Goethe {{ examLevel }}
            </div>
            <h2 class="font-display text-2xl font-bold mt-1">
              {{ $t('dashboard.examReady', { pct: overallReadiness }) }}
            </h2>
            <p class="text-sm text-base-content/70 mt-1">{{ readinessStatement }}</p>

            <ClientOnly>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <NuxtLink
                  v-for="stat in skillStats"
                  :key="stat.id"
                  :to="`/exercises?skill=${stat.id}`"
                  class="text-left p-3 rounded-field border border-base-300 hover:border-base-content/20 bg-base-100 card-hov exam-skill-chip"
                >
                  <div class="flex items-center justify-between">
                    <span
                      class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                      :class="meta(stat.id).textClass"
                    >
                      <component :is="icon(stat.id)" :size="12" />
                      {{ label(stat.id) }}
                    </span>
                    <ArrowRight :size="12" class="opacity-40" />
                  </div>
                  <div class="mt-2 font-display text-2xl font-bold">{{ stat.readiness }}%</div>
                  <progress
                    class="progress h-1.5 w-full mt-1"
                    :class="meta(stat.id).progressClass"
                    :value="stat.readiness"
                    max="100"
                  />
                  <p class="text-[11px] text-base-content/50 mt-2">
                    {{ stat.completed }}/{{ stat.total }} {{ $t('dashboard.done') }}
                  </p>
                </NuxtLink>
              </div>
              <template #fallback>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                  <div v-for="n in 4" :key="n" class="h-28 rounded-field skel" />
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
        <div class="flex items-center gap-2 p-3 border-t border-base-300 bg-base-200/50">
          <button class="btn btn-primary btn-sm gap-2" type="button" @click="primaryHeroAction">
            <Play :size="14" />
            {{
              continueExercises[0]
                ? $t('dashboard.continueFirst')
                : $t('dashboard.browseExercises')
            }}
          </button>
          <NuxtLink to="/mock-exam" class="btn btn-ghost btn-sm gap-2">
            <FileText :size="14" />
            {{ $t('dashboard.takeMockExam') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <ClientOnly>
      <!-- Continue practicing -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-display text-lg font-bold">{{ $t('dashboard.continuePracticing') }}</h2>
          <NuxtLink to="/exercises" class="btn btn-ghost btn-sm gap-1">
            {{ $t('dashboard.allExercises') }}
            <ArrowRight :size="14" />
          </NuxtLink>
        </div>

        <div
          v-if="continueExercises.length === 0"
          class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center"
        >
          <div
            class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
          >
            <BookOpen :size="20" class="text-primary" />
          </div>
          <p class="text-sm font-medium">{{ $t('dashboard.nothingInProgress') }}</p>
          <p class="text-xs text-base-content/50 mt-1">{{ $t('dashboard.startExerciseHint') }}</p>
          <NuxtLink to="/exercises" class="btn btn-primary btn-sm mt-4 gap-2">
            <Plus :size="14" /> {{ $t('dashboard.browseExercises') }}
          </NuxtLink>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            v-for="ex in continueExercises"
            :key="`${ex.skill}-${ex.id}`"
            type="button"
            class="text-left bg-base-100 border border-base-300 ring-soft rounded-box p-4 card-hov"
            @click="navigateToExercise(ex)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <SkillBadge :skill="ex.skill" size="xs" />
                <span class="level-pip">{{ ex.difficulty }}</span>
              </div>
              <span class="text-[10px] text-base-content/50"
                >{{ ex.minutes }} {{ $t('exercisesUi.min') }}</span
              >
            </div>
            <div class="font-display font-bold mt-2 truncate">{{ ex.title }}</div>
            <div v-if="ex.subtitle" class="text-xs text-base-content/60 truncate">
              {{ ex.subtitle }}
            </div>
            <div class="mt-3 flex items-center gap-2">
              <progress
                class="progress flex-1 h-1.5"
                :class="meta(ex.skill).progressClass"
                :value="ex.pct"
                max="100"
              />
              <span class="text-[11px] font-mono text-base-content/60 w-8 text-right"
                >{{ ex.pct }}%</span
              >
            </div>
            <div
              v-if="ex.hasDraft"
              class="mt-2 text-[11px] text-warning flex items-center gap-1"
            >
              <PencilLine :size="11" /> {{ $t('dashboard.draftSaved') }}
            </div>
          </button>
        </div>
      </section>

      <!-- Weak spots + recommended -->
      <section class="grid grid-cols-12 gap-4">
        <div
          class="col-span-12 lg:col-span-5 bg-base-100 border border-base-300 ring-soft rounded-box p-5"
        >
          <h2 class="font-display text-lg font-bold">{{ $t('dashboard.weakSpots') }}</h2>
          <div class="mt-3 space-y-3">
            <div v-for="stat in weakestSkills.slice(0, 4)" :key="stat.id">
              <div class="flex items-center justify-between text-sm">
                <span>{{ label(stat.id) }}</span>
                <span class="font-mono text-xs text-base-content/60">{{ stat.readiness }}%</span>
              </div>
              <progress
                class="progress h-1.5 w-full mt-1"
                :class="meta(stat.id).progressClass"
                :value="stat.readiness"
                max="100"
              />
            </div>
          </div>
        </div>

        <div
          class="col-span-12 lg:col-span-7 bg-base-100 border border-base-300 ring-soft rounded-box p-5"
        >
          <h2 class="font-display text-lg font-bold">{{ $t('dashboard.recommendedForYou') }}</h2>
          <div v-if="recommended.length === 0" class="text-sm text-base-content/50 mt-3">
            {{ $t('dashboard.nothingInProgress') }}
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <button
              v-for="ex in recommended"
              :key="`${ex.skill}-${ex.id}`"
              type="button"
              class="text-left p-3 rounded-field border border-base-300 hover:border-base-content/20 card-hov"
              @click="navigateToExercise(ex)"
            >
              <div class="flex items-center gap-2">
                <SkillBadge :skill="ex.skill" size="xs" />
                <span class="level-pip">{{ ex.difficulty }}</span>
                <span class="text-[10px] text-base-content/50 ml-auto"
                  >{{ ex.minutes }} {{ $t('exercisesUi.min') }}</span
                >
              </div>
              <div class="font-semibold mt-1 text-sm truncate">{{ ex.title }}</div>
              <div v-if="ex.subtitle" class="text-xs text-base-content/60 truncate">
                {{ ex.subtitle }}
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- Live mock sets -->
      <section class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
        <div class="p-5 flex items-center justify-between gap-3">
          <div>
            <h2 class="font-display text-lg font-bold">
              {{ $t('dashboard.yourMockExams') }} · {{ examLevel }}
            </h2>
          </div>
          <NuxtLink to="/mock-exam" class="btn btn-primary btn-sm gap-1">
            {{ $t('dashboard.goToMockExams') }}
            <ArrowRight :size="14" />
          </NuxtLink>
        </div>
        <div
          v-if="previewSets.length"
          class="grid grid-cols-12 gap-0 border-t border-base-300"
        >
          <div
            v-for="(set, i) in previewSets"
            :key="set.id"
            class="col-span-12 md:col-span-6"
            :class="i === 0 && previewSets.length > 1 ? 'md:border-r border-base-300' : ''"
          >
            <DashboardMockRow :set="set" />
          </div>
        </div>
      </section>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRight,
  BookOpen,
  FileText,
  Flag,
  Headphones,
  Mic,
  PencilLine,
  PenLine,
  Play,
  Plus,
} from 'lucide-vue-next'
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
import { getSkillMeta, getSkillLabel, getTypeLabel, type SkillId } from '~/utils/labels'

useHead({ title: 'Dashboard — Exam.one' })

const { t } = useI18n()
const router = useRouter()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)

const { skillStats, overallReadiness, weakestSkills } = useSkillStats()
const { daysUntilExam, hasExamDate, firstName } = useAccountProfile()

watchEffect(() => {
  const title = firstName.value
    ? t('dashboard.welcomeBack', { name: firstName.value })
    : t('dashboard.welcomeBackFallback')
  const subtitle = hasExamDate.value
    ? t('dashboard.examInDays', { level: examLevel.value, days: daysUntilExam.value })
    : t('dashboard.setExamDateSubtitle')
  usePageMeta(title, subtitle)
})

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
  getAllWritingSessions,
  getSession,
} = useProgress()
const { sets } = useMockExamSets()

const previewSets = computed(() => {
  const bundled = sets.value.filter(set => !set.generated).slice(0, 1)
  const generated = sets.value.filter(set => set.generated).slice(-1)
  return [...bundled, ...generated]
})

const ICONS: Record<SkillId, Component> = {
  reading: BookOpen,
  writing: PenLine,
  listening: Headphones,
  speaking: Mic,
}
function icon(skill: SkillId): Component {
  return ICONS[skill]
}
function meta(skill: SkillId) {
  return getSkillMeta(skill)
}
function label(skill: SkillId) {
  return getSkillLabel(skill, t)
}

const readinessStatement = computed(() => {
  const r = overallReadiness.value
  if (r >= 80) return t('dashboard.readiness.wellPrepared')
  if (r >= 50) return t('dashboard.readiness.goodProgress')
  return t('dashboard.readiness.keepPracticing')
})

interface DashExercise {
  id: string
  skill: SkillId
  title: string
  subtitle: string
  difficulty: string
  minutes: number
  pct: number
  hasDraft: boolean
}

const allExercises = computed<DashExercise[]>(() => {
  const draftTopicIds = new Set(getAllWritingSessions().map(session => session.topicId))
  const readingSession = getSession()

  const reading = getTexts()
    .filter(item => item.difficulty === examLevel.value)
    .map(item => {
      const completed = isTextCompleted(item.id)
      let pct = getTextProgress(item.id)?.percentage ?? (completed ? 100 : 0)
      const hasDraft = Boolean(readingSession?.textId === item.id && !completed)
      if (hasDraft) pct = Math.max(pct, 10)
      const typeLabel = getTypeLabel(item.textType, t)
      const partLabel = item.testingPart ? `${t('exercisesUi.part')} ${item.testingPart}` : ''
      return {
        id: item.id,
        skill: 'reading' as const,
        title: item.title,
        subtitle: [typeLabel, partLabel].filter(Boolean).join(' · '),
        difficulty: item.difficulty,
        minutes: item.estimatedReadingTime,
        pct,
        hasDraft,
      }
    })
  const writing = getTopics()
    .filter(item => item.difficulty === examLevel.value)
    .map(item => {
      const completed = isWritingTopicCompleted(item.id)
      const hasDraft = draftTopicIds.has(item.id)
      return {
        id: item.id,
        skill: 'writing' as const,
        title: item.title,
        subtitle: item.description || getTypeLabel(item.topicType, t),
        difficulty: item.difficulty,
        minutes: item.estimatedTime,
        pct: completed ? 100 : hasDraft ? 50 : 0,
        hasDraft: hasDraft && !completed,
      }
    })
  const listening = getListening()
    .filter(item => item.difficulty === examLevel.value)
    .map(item => {
      const id = item.id ?? ''
      return {
        id,
        skill: 'listening' as const,
        title: item.title,
        subtitle: `${t('exercisesUi.part')} ${item.testingPart}`,
        difficulty: item.difficulty,
        minutes: 6,
        pct:
          getListeningProgress(id)?.percentage ?? (isListeningCompleted(id) ? 100 : 0),
        hasDraft: false,
      }
    })
  const speaking = getSpeaking()
    .filter(item => item.difficulty === examLevel.value)
    .map(item => ({
      id: item.id,
      skill: 'speaking' as const,
      title: item.theme,
      subtitle: getTypeLabel(item.topicType, t),
      difficulty: item.difficulty,
      minutes: 7,
      pct: isSpeakingCompleted(item.id) ? 100 : 0,
      hasDraft: false,
    }))
  return [...reading, ...writing, ...listening, ...speaking]
})

const continueExercises = computed(() =>
  allExercises.value.filter(ex => ex.pct > 0 && ex.pct < 100).slice(0, 3)
)

const recommended = computed<DashExercise[]>(() => {
  const seen = new Set<string>()
  const out: DashExercise[] = []
  for (const stat of weakestSkills.value) {
    for (const ex of allExercises.value) {
      if (ex.skill !== stat.id || ex.pct !== 0) continue
      const key = `${ex.skill}-${ex.id}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(ex)
      if (out.length >= 4) return out
    }
  }
  for (const ex of allExercises.value) {
    if (ex.pct !== 0) continue
    const key = `${ex.skill}-${ex.id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(ex)
    if (out.length >= 4) break
  }
  return out
})

function navigateToExercise(ex: DashExercise) {
  if (ex.skill === 'reading') void router.push(`/reading/${ex.id}`)
  else if (ex.skill === 'writing') void router.push(`/writing/${ex.id}/exam`)
  else if (ex.skill === 'listening') void router.push(`/listening/${ex.id}`)
  else if (ex.skill === 'speaking') void router.push(`/speaking/${ex.id}`)
}

function primaryHeroAction() {
  const first = continueExercises.value[0]
  if (first) navigateToExercise(first)
  else void router.push('/exercises')
}
</script>
