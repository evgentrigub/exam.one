<template>
  <aside
    class="w-60 shrink-0 h-full flex flex-col bg-base-100 border-r border-base-300 overflow-y-auto"
  >
    <!-- Logo -->
    <a
      :href="landingUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="$t('shell.openLanding')"
      class="flex items-center gap-2.5 px-4 h-14 shrink-0 border-b border-base-300 transition-colors hover:bg-base-200"
    >
      <div class="w-7 h-7 rounded-field bg-primary text-primary-content grid place-items-center shrink-0">
        <span class="font-display font-bold text-sm">E</span>
      </div>
      <span class="font-display text-lg font-bold leading-none tracking-tight">
        Exam<span class="text-primary">.one</span>
      </span>
    </a>

    <!-- Main nav -->
    <nav class="flex flex-col gap-0.5 px-2 pt-3 pb-1">
      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium transition-colors hover:bg-base-200"
        :class="isActive('/dashboard') ? 'nav-item-active' : 'text-base-content/70'"
      >
        <LayoutDashboard :size="16" />
        {{ $t('nav.dashboard') }}
      </NuxtLink>
      <NuxtLink
        to="/exercises"
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium transition-colors hover:bg-base-200"
        :class="isActive('/exercises') ? 'nav-item-active' : 'text-base-content/70'"
      >
        <BookOpen :size="16" />
        {{ $t('nav.exercises') }}
      </NuxtLink>
      <NuxtLink
        to="/exam-format"
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium transition-colors hover:bg-base-200"
        :class="isActive('/exam-format') ? 'nav-item-active' : 'text-base-content/70'"
      >
        <ListTree :size="16" />
        {{ $t('nav.examFormat') }}
      </NuxtLink>
      <NuxtLink
        to="/mock-exam"
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium transition-colors hover:bg-base-200"
        :class="isActive('/mock-exam') ? 'nav-item-active' : 'text-base-content/70'"
      >
        <FileText :size="16" />
        {{ $t('nav.mockExams') }}
      </NuxtLink>
      <NuxtLink
        to="/progress"
        class="flex items-center gap-2.5 px-3 py-2 rounded-field text-sm font-medium transition-colors hover:bg-base-200"
        :class="isActive('/progress') ? 'nav-item-active' : 'text-base-content/70'"
      >
        <TrendingUp :size="16" />
        {{ $t('nav.progress') }}
      </NuxtLink>
    </nav>

    <!-- Practice by skill -->
    <div class="px-4 mt-4">
      <p class="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-1.5">
        {{ $t('shell.practiceBySkill') }}
      </p>
      <div class="flex flex-col gap-0.5">
        <NuxtLink
          to="/exercises?skill=reading"
          class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm transition-colors hover:bg-base-200"
          :class="isSkillActive('reading') ? 'nav-item-active' : 'text-base-content/70'"
        >
          <span class="flex items-center gap-2">
            <BookOpen :size="14" class="text-reading" />
            {{ $t('skill.reading') }}
          </span>
          <span class="text-xs text-base-content/50">{{ readingCount }}</span>
        </NuxtLink>
        <NuxtLink
          to="/exercises?skill=writing"
          class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm transition-colors hover:bg-base-200"
          :class="isSkillActive('writing') ? 'nav-item-active' : 'text-base-content/70'"
        >
          <span class="flex items-center gap-2">
            <PenLine :size="14" class="text-writing" />
            {{ $t('skill.writing') }}
          </span>
          <span class="text-xs text-base-content/50">{{ writingCount }}</span>
        </NuxtLink>
        <NuxtLink
          to="/exercises?skill=listening"
          class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm transition-colors hover:bg-base-200"
          :class="isSkillActive('listening') ? 'nav-item-active' : 'text-base-content/70'"
        >
          <span class="flex items-center gap-2">
            <Headphones :size="14" class="text-listening" />
            {{ $t('skill.listening') }}
          </span>
          <span class="text-xs text-base-content/50">{{ listeningCount }}</span>
        </NuxtLink>
        <NuxtLink
          to="/exercises?skill=speaking"
          class="flex items-center justify-between px-2 py-1.5 rounded-field text-sm transition-colors hover:bg-base-200"
          :class="isSkillActive('speaking') ? 'nav-item-active' : 'text-base-content/70'"
        >
          <span class="flex items-center gap-2">
            <Mic :size="14" class="text-speaking" />
            {{ $t('skill.speaking') }}
          </span>
          <span class="text-xs text-base-content/50">{{ speakingCount }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Exam target widget -->
    <div class="mt-auto p-3 border-t border-base-300">
      <div class="rounded-box bg-base-200 p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs font-semibold text-base-content/70">{{ $t('shell.examTarget') }}</div>
          <NuxtLink to="/exercises" class="text-[10px] text-primary font-medium hover:underline">
            {{ $t('shell.viewExercises') }}
          </NuxtLink>
        </div>
        <NuxtLink
          to="/exercises"
          class="w-full flex items-center gap-2 rounded-field p-1 -m-1 hover:bg-base-300/60 transition-colors text-left"
        >
          <div
            class="w-9 h-9 rounded-field bg-primary/10 text-primary grid place-items-center shrink-0"
          >
            <Flag :size="16" />
          </div>
          <div class="min-w-0">
            <div class="text-sm font-semibold leading-tight">{{ pack.title }}</div>
            <div class="text-[11px] text-base-content/60">
              <template v-if="hasExamDate">
                {{ $t('shell.examTargetMeta', { days: daysUntilExam }) }}
              </template>
              <button
                v-else
                type="button"
                class="text-base-content/50 hover:text-primary hover:underline"
                @click.stop="router.push('/settings?section=learning')"
              >
                {{ $t('shell.setExamDate') }}
              </button>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  TrendingUp,
  ListTree,
  PenLine,
  Headphones,
  Mic,
  Flag,
} from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useListeningExercises } from '~/composables/useListeningExercises'
import { useSpeakingExercises } from '~/composables/useSpeakingExercises'
import { useAccountProfile } from '~/composables/useAccountProfile'

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)
const { pack } = useActivePack()
const { daysUntilExam, hasExamDate } = useAccountProfile()

const landingUrl = computed(() => {
  const configuredUrl = String(runtimeConfig.public.frontendLandingUrl || '').trim()
  if (/^https?:\/\//i.test(configuredUrl)) return configuredUrl
  return `http://${configuredUrl || 'localhost:3001'}`
})

const { getTexts } = useReadingTexts()
const { getTopics } = useWritingTopics()
const { getExercises: getListening } = useListeningExercises()
const { getTopics: getSpeaking } = useSpeakingExercises()

const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})

const readingCount = computed(() =>
  isClient.value ? getTexts().filter(text => text.difficulty === examLevel.value).length : 0
)
const writingCount = computed(() =>
  isClient.value ? getTopics().filter(topic => topic.difficulty === examLevel.value).length : 0
)
const listeningCount = computed(() => (isClient.value ? getListening().length : 0))
const speakingCount = computed(() =>
  isClient.value ? getSpeaking().filter(t => t.difficulty === examLevel.value).length : 0
)

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function isSkillActive(skill: string) {
  return route.path === '/exercises' && route.query['skill'] === skill
}
</script>
