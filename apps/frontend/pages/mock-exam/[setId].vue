<template>
  <div v-if="!validSet" class="mx-auto max-w-2xl px-6 py-16 text-center">
    <h1 class="font-display text-2xl font-bold">{{ $t('mockExam.notFound') }}</h1>
    <NuxtLink to="/mock-exam" class="btn btn-primary btn-sm mt-5">{{
      $t('mockExam.backToList')
    }}</NuxtLink>
  </div>

  <div v-else-if="view === 'result'" class="mx-auto max-w-[940px] space-y-6 px-4 py-8 sm:px-6">
    <div class="rounded-box border p-6" :class="resultBannerClass">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-base-100/70">
          <Trophy :size="30" />
        </div>
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider">
            {{ $t('mockExam.provisionalResult') }}
          </div>
          <h1 class="mt-1 font-display text-3xl font-bold">{{ roundedOverall }} / {{ maximumPoints }}</h1>
          <p class="mt-1 text-sm opacity-80">
            {{ roundedOverall >= passPoints ? $t('mockExam.passMessage') : $t('mockExam.almostMessage') }}
          </p>
        </div>
        <div class="sm:ml-auto sm:text-right">
          <div class="font-mono text-3xl font-bold">{{ Math.round(roundedOverall / maximumPoints * 100) }}%</div>
          <div class="text-xs opacity-70">{{ passPoints }} / {{ maximumPoints }}</div>
        </div>
      </div>
    </div>

    <div class="alert border border-warning/30 bg-warning/10 text-sm">
      <Info :size="18" class="text-warning" />
      <span>{{ $t('mockExam.provisionalSpeakingNote') }}</span>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <article
        v-for="definition in set.modules"
        :key="definition.skill"
        class="card border border-base-300 bg-base-100 ring-soft transition-colors"
        :class="resultModuleCardClass(definition.skill)"
        role="link"
        :tabindex="canOpenModuleReview(definition.skill) ? 0 : -1"
        :aria-disabled="!canOpenModuleReview(definition.skill)"
        @click="openModuleReview(definition.skill)"
        @keydown.enter="openModuleReview(definition.skill)"
      >
        <div class="card-body gap-3 p-5">
          <div class="flex items-center gap-3">
            <div
              class="grid h-10 w-10 place-items-center rounded-field"
              :class="moduleIconClass(definition.skill)"
            >
              <component :is="moduleIcon(definition.skill)" :size="19" />
            </div>
            <div>
              <h2 class="font-semibold">{{ $t(`skill.${definition.skill}`) }}</h2>
              <p class="text-xs text-base-content/50">{{ gradingLabel(definition.skill) }}</p>
            </div>
            <div class="ml-auto font-mono text-lg font-bold">
              {{ scoreLabel(definition.skill) }}
            </div>
            <span
              v-if="!canOpenModuleReview(definition.skill)"
              class="loading loading-spinner loading-sm text-primary"
              aria-hidden="true"
            />
            <ChevronRight v-else :size="20" class="text-base-content/35" />
          </div>
          <progress
            class="progress h-2 w-full"
            :class="moduleProgressClass(definition.skill)"
            :value="state.modules[definition.skill].scoreFinal ?? 0"
            :max="definition.maxFinalPoints"
          />
        </div>
      </article>
    </div>

    <details
      class="collapse-arrow collapse border border-base-300 bg-base-100"
      :open="overviewExpanded"
      @toggle="handleOverviewToggle"
    >
      <summary class="collapse-title flex items-center gap-3 pr-12">
        <span class="grid h-9 w-9 place-items-center rounded-field bg-primary/10 text-primary">
          <Sparkles :size="20" />
        </span>
        <span>
          <span class="block font-semibold">{{ $t('mockExam.aiOverviewTitle') }}</span>
          <span class="block text-xs font-normal text-base-content/50">{{
            $t('mockExam.aiOverviewDescription')
          }}</span>
        </span>
      </summary>
      <div class="collapse-content">
        <div
          v-if="state.aiOverview.status === 'idle'"
          class="rounded-box bg-base-200/50 p-5 text-center"
        >
          <p class="text-sm text-base-content/60">{{ $t('mockExam.aiOverviewEmpty') }}</p>
          <button
            class="btn btn-primary btn-sm mt-4"
            :disabled="hasPendingAiGrading"
            @click="generateOverview"
          >
            <Sparkles :size="16" />
            {{ $t('mockExam.generateAiOverview') }}
          </button>
          <p v-if="hasPendingAiGrading" class="mt-3 text-xs text-base-content/50">
            {{ $t('mockExam.waitingForAiGrades') }}
          </p>
        </div>

        <div
          v-else-if="state.aiOverview.status === 'loading'"
          class="flex items-center justify-center gap-3 rounded-box bg-base-200/50 p-8 text-sm"
        >
          <span class="loading loading-spinner loading-md text-primary" />
          {{ $t('mockExam.generatingAiOverview') }}
        </div>

        <div
          v-else-if="state.aiOverview.status === 'error'"
          class="alert border border-error/30 bg-error/10"
        >
          <CircleAlert :size="20" class="text-error" />
          <div class="min-w-0 flex-1">
            <div class="font-medium">{{ $t('mockExam.aiOverviewFailed') }}</div>
            <div class="text-xs">{{ state.aiOverview.error }}</div>
          </div>
          <button
            class="btn btn-error btn-outline btn-sm"
            :disabled="hasPendingAiGrading"
            @click="generateOverview"
          >
            {{ $t('mockExam.tryAgain') }}
          </button>
        </div>

        <div v-else-if="state.aiOverview.data" class="space-y-5">
          <p class="leading-7">{{ state.aiOverview.data.summary }}</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <section class="rounded-box border border-success/30 bg-success/5 p-4">
              <h3 class="flex items-center gap-2 font-semibold text-success">
                <CircleCheck :size="20" />
                {{ $t('mockExam.strengths') }}
              </h3>
              <ul class="mt-3 space-y-2 text-sm">
                <li
                  v-for="item in state.aiOverview.data.strengths"
                  :key="`${item.skill}-${item.text}`"
                >
                  <span class="font-semibold">{{ $t(`skill.${item.skill}`) }}:</span>
                  {{ item.text }}
                </li>
              </ul>
            </section>
            <section class="rounded-box border border-warning/30 bg-warning/5 p-4">
              <h3 class="flex items-center gap-2 font-semibold text-warning">
                <TrendingUp :size="20" />
                {{ $t('mockExam.focusAreas') }}
              </h3>
              <ul class="mt-3 space-y-2 text-sm">
                <li
                  v-for="item in state.aiOverview.data.focusAreas"
                  :key="`${item.skill}-${item.text}`"
                >
                  <span class="font-semibold">{{ $t(`skill.${item.skill}`) }}:</span>
                  {{ item.text }}
                </li>
              </ul>
            </section>
          </div>
          <section>
            <h3 class="font-semibold">{{ $t('mockExam.nextSteps') }}</h3>
            <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li v-for="step in state.aiOverview.data.nextSteps" :key="step">{{ step }}</li>
            </ol>
          </section>
        </div>
      </div>
    </details>

    <div class="flex flex-wrap justify-between gap-3">
      <NuxtLink to="/mock-exam" class="btn btn-ghost btn-sm gap-2"
        ><ArrowLeft :size="14" /> {{ $t('mockExam.backToList') }}</NuxtLink
      >
      <button class="btn btn-error btn-outline btn-sm gap-2" @click="reset">
        <RotateCcw :size="14" /> {{ $t('mockExam.restart') }}
      </button>
    </div>
  </div>

  <div
    v-else-if="view === 'exercise' && activeModule && activeExercise"
    class="mx-auto max-w-[1180px] space-y-5 px-4 py-6 sm:px-6"
  >
    <div
      class="sticky top-0 z-10 flex items-center gap-3 rounded-box border border-base-300 bg-base-100/95 p-3 shadow-sm backdrop-blur"
    >
      <button class="btn btn-ghost btn-sm gap-1" @click="leaveExercise">
        <ArrowLeft :size="14" /> {{ $t('mockExam.moduleOverview') }}
      </button>
      <div class="min-w-0">
        <div class="truncate text-sm font-semibold">{{ activeExercise.title }}</div>
        <div class="text-xs text-base-content/50">
          {{ activeIndex + 1 }}/{{ activeModule.exercises.length }}
        </div>
      </div>
      <TimerChip class="ml-auto" :seconds="remaining" />
    </div>

    <div v-if="activeSkill === 'reading' && readingExercise" class="space-y-5">
      <article class="rounded-box border border-base-300 bg-base-100 p-5 ring-soft sm:p-7">
        <h1 class="font-display text-2xl font-bold">{{ readingExercise.title }}</h1>
        <div class="mt-4 whitespace-pre-line text-[15px] leading-7">
          {{ readingExercise.content }}
        </div>
      </article>
      <QuizSession
        :text="readingExercise"
        exam-mode
        :initial-answers="activeResponse?.answers ?? {}"
        @finish="leaveExercise"
        @progress="saveProgress"
        @exam-complete="completeActiveExercise"
      />
    </div>

    <ListeningSession
      v-else-if="activeSkill === 'listening' && listeningExercise"
      :exercise="listeningExercise"
      :configured-replays="activeExercise?.replays"
      exam-mode
      :initial-answers="activeResponse?.answers ?? {}"
      @finish="leaveExercise"
      @progress="saveProgress"
      @exam-complete="completeActiveExercise"
    />

    <WritingSession
      v-else-if="activeSkill === 'writing' && writingExercise"
      :topic="writingExercise"
      exam-mode
      :initial-content="activeResponse?.content ?? ''"
      @finish="leaveExercise"
      @progress="saveProgress"
      @exam-complete="completeActiveExercise"
    />

    <SpeakingSession
      v-else-if="activeSkill === 'speaking' && speakingExercise"
      :topic="speakingExercise"
      exam-mode
      :initial-transcripts="activeResponse?.transcripts ?? {}"
      @finish="leaveExercise"
      @progress="saveProgress"
      @exam-complete="completeActiveExercise"
    />
  </div>

  <div
    v-else-if="view === 'part' && activeModule && activeSkill"
    class="mx-auto max-w-[860px] space-y-5 px-4 py-8 sm:px-6"
  >
    <div class="flex items-center gap-3">
      <button class="btn btn-ghost btn-sm gap-1" @click="goOverview">
        <ArrowLeft :size="14" /> {{ $t('mockExam.examOverview') }}
      </button>
      <TimerChip class="ml-auto" :seconds="remaining" />
    </div>

    <article class="card border border-base-300 bg-base-100 ring-soft">
      <div class="card-body p-5 sm:p-7">
        <div class="flex items-center gap-3">
          <div
            class="grid h-12 w-12 place-items-center rounded-field"
            :class="moduleIconClass(activeSkill)"
          >
            <component :is="moduleIcon(activeSkill)" :size="22" />
          </div>
          <div>
            <h1 class="font-display text-2xl font-bold">{{ $t(`skill.${activeSkill}`) }}</h1>
            <p class="text-sm text-base-content/55">
              {{ doneCount }}/{{ activeModule.exercises.length }} {{ $t('mockExam.tasksDone') }}
            </p>
          </div>
        </div>

        <div class="alert mt-5 border border-warning/30 bg-warning/10 text-sm">
          <Lock :size="16" class="text-warning" />
          <span>{{ $t('mockExam.lockWarning') }}</span>
        </div>

        <div class="mt-5 space-y-2">
          <button
            v-for="(exercise, index) in activeModule.exercises"
            :key="exercise.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-box border p-4 text-left transition-colors"
            :class="exerciseRowClass(index)"
            :disabled="!canOpenExercise(index)"
            @click="openExercise(index)"
          >
            <span
              class="grid h-7 w-7 shrink-0 place-items-center rounded-full border"
              :class="exerciseNumberClass(index)"
            >
              <Check v-if="activeDone[index]" :size="14" />
              <Lock v-else-if="!canOpenExercise(index)" :size="12" />
              <span v-else class="font-mono text-xs">{{ index + 1 }}</span>
            </span>
            <div class="flex-1">
              <div class="font-medium">{{ exercise.title }}</div>
              <div class="text-xs text-base-content/50">
                {{ $t('mockExam.rawPoints', { points: exercise.maxRawPoints }) }}
              </div>
            </div>
            <span v-if="activeDone[index]" class="badge badge-success badge-sm">{{
              $t('mockExam.locked')
            }}</span>
            <ArrowRight v-else-if="canOpenExercise(index)" :size="14" />
          </button>
        </div>

        <div
          v-if="
            activeGrading === 'pending' &&
            doneCount === activeModule.exercises.length &&
            (activeSkill === 'writing' || activeSkill === 'speaking')
          "
          class="alert mt-5 border border-info/30 bg-info/10 text-sm"
        >
          <Info :size="16" class="text-info" />
          <span>{{ $t('mockExam.pendingCanLock') }}</span>
        </div>

        <div class="card-actions mt-6 items-center border-t border-base-300 pt-5">
          <button class="btn btn-ghost btn-sm" @click="goOverview">
            {{ $t('mockExam.leaveKeepProgress') }}
          </button>
          <button
            class="btn btn-primary btn-sm ml-auto gap-2"
            :disabled="doneCount !== activeModule.exercises.length"
            @click="finishModule"
          >
            <Lock :size="14" /> {{ $t('mockExam.finishLockModule') }}
          </button>
        </div>
      </div>
    </article>
  </div>

  <div v-else class="mx-auto max-w-[1080px] space-y-5 px-4 py-8 sm:px-6">
    <div class="flex items-center justify-between gap-3">
      <NuxtLink to="/mock-exam" class="btn btn-ghost btn-sm gap-1"
        ><ArrowLeft :size="14" /> {{ $t('mockExam.backToList') }}</NuxtLink
      >
      <button class="btn btn-ghost btn-sm text-error" @click="reset">
        <RotateCcw :size="14" /> {{ $t('mockExam.reset') }}
      </button>
    </div>

    <article class="card border border-base-300 bg-base-100 ring-soft">
      <div class="card-body p-5 sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-primary">
              {{ $t('mockExam.fullSimulation') }} · {{ set.level }}
            </div>
            <h1 class="mt-2 font-display text-3xl font-bold">{{ set.title }}</h1>
            <p class="mt-1 text-sm text-base-content/60">
              {{ $t('mockExam.overviewDescription') }}
            </p>
          </div>
          <div class="text-right">
            <div class="font-mono text-2xl font-bold">
              {{ lockedCount }}/{{ set.modules.length }}
            </div>
            <div class="text-xs text-base-content/50">{{ $t('mockExam.modulesDone') }}</div>
          </div>
        </div>

        <div class="mt-5">
          <div class="mb-1 flex justify-between text-xs text-base-content/55">
            <span>{{ $t('mockExam.progress') }}</span>
            <span class="font-mono">{{ doneExerciseCount }}/{{ totalExerciseCount }}</span>
          </div>
          <progress
            class="progress progress-primary h-2 w-full"
            :value="lockedCount"
            :max="set.modules.length"
          />
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <article
            v-for="definition in set.modules"
            :key="definition.skill"
            class="rounded-box border p-5"
            :class="moduleCardClass(definition.skill)"
          >
            <div class="flex items-center gap-3">
              <div
                class="grid h-11 w-11 place-items-center rounded-field"
                :class="moduleIconClass(definition.skill)"
              >
                <component :is="moduleIcon(definition.skill)" :size="20" />
              </div>
              <div class="flex-1">
                <h2 class="font-display text-lg font-bold">
                  {{ $t(`skill.${definition.skill}`) }}
                </h2>
                <p class="text-xs text-base-content/50">
                  {{ definition.exercises.length }} {{ $t('mockExam.exercises') }} ·
                  {{ definition.minutes }} {{ $t('mockExam.minutes') }}
                </p>
              </div>
              <span
                v-if="state.modules[definition.skill].locked"
                class="badge badge-success badge-sm gap-1"
                ><Lock :size="11" /> {{ $t('mockExam.locked') }}</span
              >
              <div v-else class="flex items-center gap-2">
                <TimerChip
                  v-if="state.modules[definition.skill].endsAt"
                  :seconds="moduleRemainingSeconds(definition.skill)"
                />
                <span class="text-xs text-base-content/45"
                  >{{ state.modules[definition.skill].done.filter(Boolean).length }}/{{
                    definition.exercises.length
                  }}</span
                >
              </div>
            </div>
            <div
              v-if="state.modules[definition.skill].locked"
              class="mt-4 flex items-center justify-between"
            >
              <span class="text-xs text-base-content/55">{{ gradingLabel(definition.skill) }}</span>
              <span class="font-mono font-bold">{{ scoreLabel(definition.skill) }}</span>
            </div>
            <button
              v-else
              class="btn btn-sm mt-4 w-full"
              :class="moduleButtonClass(definition.skill)"
              @click="openModule(definition.skill)"
            >
              <Play :size="13" />
              {{
                state.modules[definition.skill].endsAt
                  ? $t('mockExam.continueModule')
                  : $t('mockExam.startModule')
              }}
            </button>
          </article>
        </div>

        <div class="card-actions mt-6 items-center border-t border-base-300 pt-5">
          <p class="text-sm text-base-content/55">
            {{ allLocked ? $t('mockExam.allLocked') : $t('mockExam.finishAll') }}
          </p>
          <button
            class="btn btn-primary btn-sm ml-auto gap-2"
            :disabled="!allLocked"
            @click="showResults"
          >
            {{ $t('mockExam.viewResults') }} <ArrowRight :size="14" />
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Headphones,
  Info,
  Lock,
  Mic,
  PenLine,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import QuizSession from '~/components/reading/QuizSession.vue'
import ListeningSession from '~/components/listening/ListeningSession.vue'
import WritingSession from '~/components/writing/WritingSession.vue'
import SpeakingSession from '~/components/speaking/SpeakingSession.vue'
import TimerChip from '~/components/mockExam/TimerChip.vue'
import type {
  CriterionReview,
  MockExamExerciseDefinition,
  MockExamModuleDefinition,
  MockExamOverview,
  MockExamOverviewInput,
  MockExamSet,
} from '@exam-one/exam-packs'
import { useMockExam, type MockExerciseResult } from '~/composables/useMockExam'
import type { WritingExercise } from '~/utils/types'
import { UNAVAILABLE_MOCK_SET } from '~/utils/mockExam/unavailableSet'
import { useReviewOutputLanguage } from '~/utils/reviewLocale'
import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import type { ReadingExercise } from '~/utils/exercises/reading'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import type { SkillId } from '~/utils/labels'

type ViewName = 'overview' | 'part' | 'exercise' | 'result'

const route = useRoute()
const { t } = useI18n()
const reviewOutputLanguage = useReviewOutputLanguage()
const { assemble } = usePackPrompt()
const requestedSetId = String(route.params['setId'] || '')
const { getSet, isInitialized: setsInitialized } = useMockExamSets()
const { pack } = useActivePack()
const foundSet = computed(() => getSet(requestedSetId))
const bundledSet = computed(() => pack.value.bundledMockSet as MockExamSet | undefined)
const set = computed(() => foundSet.value ?? bundledSet.value ?? UNAVAILABLE_MOCK_SET)
const validSet = computed(() => Boolean(foundSet.value) || !setsInitialized.value)

usePageMeta('Mock exam', pack.value.title)
useHead({ title: computed(() => `${set.value.title} – Mock exam`) })

const {
  state,
  allLocked,
  doneExerciseCount,
  totalExerciseCount,
  overallPoints,
  startModule,
  saveExerciseProgress,
  completeExercise,
  updateExerciseGrade,
  lockModule,
  finishExam,
  resetExam,
  remainingSeconds,
  startOverview,
  completeOverview,
  failOverview,
} = useMockExam(set)

const view = ref<ViewName>('overview')
const activeSkill = ref<SkillId | null>(null)
const activeIndex = ref(0)
const nowTick = ref(Date.now())
const overviewExpanded = ref(true)
const activeGradingJobs = new Set<string>()
let timerHandle: ReturnType<typeof setInterval> | null = null

const activeModule = computed<MockExamModuleDefinition | null>(
  () => set.value.modules.find(module => module.skill === activeSkill.value) ?? null
)
const activeModuleState = computed(() =>
  activeSkill.value ? state.value.modules[activeSkill.value] : null
)
const activeDone = computed(() => activeModuleState.value?.done ?? [])
const activeGrading = computed(() => activeModuleState.value?.grading ?? 'pending')
const activeExercise = computed<MockExamExerciseDefinition | null>(
  () => activeModule.value?.exercises[activeIndex.value] ?? null
)
const activeResponse = computed<MockExerciseResult | undefined>(() => {
  if (!activeSkill.value || !activeExercise.value) return undefined
  return state.value.modules[activeSkill.value].responses[activeExercise.value.id]
})
const remaining = computed(() => {
  void nowTick.value
  return activeSkill.value ? remainingSeconds(activeSkill.value) : 0
})
const doneCount = computed(() => activeModuleState.value?.done.filter(Boolean).length ?? 0)
const lockedCount = computed(
  () => set.value.modules.filter(module => state.value.modules[module.skill].locked).length
)
const roundedOverall = computed(() => Math.round(overallPoints.value))
const maximumPoints = computed(() => set.value.rules?.maximumPoints ?? 100)
const passPoints = computed(() => set.value.rules?.passPoints ?? 60)
const hasPendingAiGrading = computed(() =>
  (['writing', 'speaking'] as const).some(skill => isAiReviewInProgress(skill))
)
const resultBannerClass = computed(() =>
  roundedOverall.value >= passPoints.value
    ? 'border-success/40 bg-success/10 text-success'
    : 'border-warning/40 bg-warning/10 text-warning'
)

const readingExercise = computed<ReadingExercise | undefined>(() =>
  activeExercise.value
    ? set.value.content.reading.find(exercise => exercise.id === activeExercise.value?.id)
    : undefined
)
const listeningExercise = computed<ListeningA2Exercise | undefined>(() =>
  activeExercise.value
    ? set.value.content.listening.find(exercise => exercise.id === activeExercise.value?.id)
    : undefined
)
const writingExercise = computed<WritingExercise | undefined>(() =>
  activeExercise.value
    ? set.value.content.writing.find(exercise => exercise.id === activeExercise.value?.id)
    : undefined
)
const speakingExercise = computed<SpeakingA2Topic | undefined>(() =>
  activeExercise.value
    ? set.value.content.speaking.find(exercise => exercise.id === activeExercise.value?.id)
    : undefined
)

onMounted(() => {
  if (state.value.finished) {
    view.value = 'result'
    void gradePendingModules()
  }
  timerHandle = setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
})
onUnmounted(() => {
  if (timerHandle) clearInterval(timerHandle)
})

watch(
  () => state.value.finished,
  finished => {
    if (finished) {
      view.value = 'result'
      void gradePendingModules()
    }
  }
)

function moduleIcon(skill: SkillId): Component {
  return { reading: BookOpen, listening: Headphones, writing: PenLine, speaking: Mic }[skill]
}

function moduleIconClass(skill: SkillId): string {
  return {
    reading: 'bg-primary/10 text-primary',
    listening: 'bg-info/10 text-info',
    writing: 'bg-success/10 text-success',
    speaking: 'bg-warning/10 text-warning',
  }[skill]
}

function moduleProgressClass(skill: SkillId): string {
  return {
    reading: 'progress-primary',
    listening: 'progress-info',
    writing: 'progress-success',
    speaking: 'progress-warning',
  }[skill]
}

function moduleButtonClass(skill: SkillId): string {
  return {
    reading: 'btn-primary',
    listening: 'btn-info',
    writing: 'btn-success',
    speaking: 'btn-warning',
  }[skill]
}

function moduleCardClass(skill: SkillId): string {
  return state.value.modules[skill].locked
    ? 'border-success/40 bg-success/5'
    : 'border-base-300 bg-base-100'
}

function canOpenModuleReview(skill: SkillId): boolean {
  return !isAiReviewInProgress(skill)
}

function isAiReviewInProgress(skill: SkillId): boolean {
  if (skill !== 'writing' && skill !== 'speaking') return false
  return Object.values(state.value.modules[skill].responses).some(
    response =>
      response.grading === 'pending' && typeof response.rawScore !== 'number' && !response.error
  )
}

function hasAiReviewError(skill: SkillId): boolean {
  if (skill !== 'writing' && skill !== 'speaking') return false
  return Object.values(state.value.modules[skill].responses).some(response =>
    Boolean(response.error)
  )
}

function resultModuleCardClass(skill: SkillId): string {
  return canOpenModuleReview(skill)
    ? 'cursor-pointer hover:border-primary/50'
    : 'cursor-not-allowed opacity-60'
}

function scoreLabel(skill: SkillId): string {
  const definition = set.value.modules.find(module => module.skill === skill)
  const score = state.value.modules[skill].scoreFinal
  if (!definition || score === null) return `—/${definition?.maxFinalPoints ?? 0}`
  return `${Number(score.toFixed(2))}/${definition.maxFinalPoints}`
}

function openModuleReview(skill: SkillId): void {
  if (!canOpenModuleReview(skill)) return
  void navigateTo(`/mock-exam/review/${set.value.id}/${skill}`)
}

function handleOverviewToggle(event: Event): void {
  overviewExpanded.value = (event.currentTarget as HTMLDetailsElement).open
}

function overviewInput(): MockExamOverviewInput {
  return {
    overallPoints: roundedOverall.value,
    modules: set.value.modules.map(definition => ({
      skill: definition.skill,
      score: state.value.modules[definition.skill].scoreFinal,
      maximum: definition.maxFinalPoints,
      grading: state.value.modules[definition.skill].grading,
      exercises: definition.exercises.map(exercise => {
        const response = state.value.modules[definition.skill].responses[exercise.id]
        return {
          part: exercise.part,
          score: response?.rawScore ?? response?.score ?? null,
          total: response?.total ?? exercise.maxRawPoints,
          ...(typeof response?.wordCount === 'number' ? { wordCount: response.wordCount } : {}),
          ...(response?.content ? { content: response.content } : {}),
          ...(response?.transcripts ? { transcripts: { ...response.transcripts } } : {}),
        }
      }),
    })),
  }
}

async function generateOverview(): Promise<void> {
  if (state.value.aiOverview.status === 'loading' || hasPendingAiGrading.value) return
  startOverview()
  try {
    const response = await aiFetch<MockExamOverview>('/llm/review-mock-exam', {
      method: 'POST',
      body: { result: overviewInput(), outputLanguage: reviewOutputLanguage.value },
    })
    if (response.error || !response.data)
      throw new Error(response.error || 'AI overview is unavailable.')
    completeOverview(response.data)
  } catch (error: unknown) {
    failOverview(error instanceof Error ? error.message : 'AI overview is unavailable.')
  }
}

function gradingLabel(skill: SkillId): string {
  const status = state.value.modules[skill].grading
  if (status === 'auto') return t('mockExam.automaticScoring')
  if (status === 'done')
    return skill === 'speaking' ? t('mockExam.aiProvisional') : t('mockExam.aiGraded')
  if (hasAiReviewError(skill) && !isAiReviewInProgress(skill))
    return t('mockExam.gradingUnavailable')
  return t('mockExam.gradingPending')
}

function openModule(skill: SkillId): void {
  if (state.value.modules[skill].locked) return
  activeSkill.value = skill
  startModule(skill)
  view.value = 'part'
}

function canOpenExercise(index: number): boolean {
  if (
    !activeModuleState.value ||
    activeModuleState.value.locked ||
    activeModuleState.value.done[index]
  )
    return false
  return index === 0 || activeModuleState.value.done.slice(0, index).every(Boolean)
}

function openExercise(index: number): void {
  if (!canOpenExercise(index)) return
  activeIndex.value = index
  view.value = 'exercise'
}

function exerciseRowClass(index: number): string {
  if (activeModuleState.value?.done[index]) return 'border-success/40 bg-success/5 cursor-default'
  if (!canOpenExercise(index)) return 'border-base-300 bg-base-200/60 opacity-60 cursor-not-allowed'
  return 'border-base-300 bg-base-100 hover:border-primary/50 hover:bg-primary/5'
}

function exerciseNumberClass(index: number): string {
  if (activeModuleState.value?.done[index]) return 'border-success bg-success text-success-content'
  return canOpenExercise(index)
    ? 'border-base-300 text-base-content/60'
    : 'border-base-300 text-base-content/30'
}

function saveProgress(payload: Omit<MockExerciseResult, 'exerciseId'>): void {
  if (!activeSkill.value || !activeExercise.value) return
  saveExerciseProgress(activeSkill.value, activeExercise.value.id, payload)
}

function completeActiveExercise(payload: Omit<MockExerciseResult, 'exerciseId'>): void {
  if (!activeSkill.value || !activeExercise.value) return
  const skill = activeSkill.value
  const exercise = activeExercise.value
  const result: MockExerciseResult = {
    ...activeResponse.value,
    ...payload,
    exerciseId: exercise.id,
  }

  if (skill === 'writing') {
    const part = writingExercise.value?.testingPart ?? 1
    const zeroThreshold = part === 1 ? 10 : 15
    const wordCount = payload.wordCount ?? 0
    result.rawScore = wordCount < zeroThreshold ? 0 : null
    result.grading = wordCount < zeroThreshold ? 'done' : 'pending'
  } else if (skill === 'speaking') {
    result.rawScore = null
    result.grading = 'pending'
  }

  completeExercise(skill, activeIndex.value, result)
  view.value = 'part'
  if (skill === 'writing' || skill === 'speaking') void gradeResponse(skill, exercise.id)
}

function leaveExercise(): void {
  view.value = 'part'
}

function goOverview(): void {
  activeSkill.value = null
  view.value = 'overview'
}

function finishModule(): void {
  if (!activeSkill.value || doneCount.value !== activeModule.value?.exercises.length) return
  lockModule(activeSkill.value)
  goOverview()
}

function moduleRemainingSeconds(skill: SkillId): number {
  void nowTick.value
  return remainingSeconds(skill)
}

function showResults(): void {
  finishExam()
  view.value = 'result'
  void gradePendingModules()
}

function reset(): void {
  if (import.meta.client && !confirm(t('mockExam.resetConfirm'))) return
  resetExam()
  activeSkill.value = null
  view.value = 'overview'
}

async function gradeResponse(skill: 'writing' | 'speaking', exerciseId: string): Promise<void> {
  const response = state.value.modules[skill].responses[exerciseId]
  if (!response || typeof response.rawScore === 'number') return
  const jobId = `${skill}:${exerciseId}`
  if (activeGradingJobs.has(jobId)) return
  activeGradingJobs.add(jobId)
  updateExerciseGrade(skill, exerciseId, null)

  try {
    if (skill === 'writing') {
      const topic = set.value.content.writing.find(item => item.id === exerciseId)
      if (!topic || !response.content?.trim()) return
      const part = topic.testingPart === 2 ? 2 : 1
      const prompt = assemble('writing', part, 'review', {
        task: topic.task,
        requirements: topic.requirements?.join(', ') ?? '',
        userContent: response.content,
        outputLanguage: reviewOutputLanguage.value,
        topicId: topic.id,
      })
      if (!prompt) throw new Error(`No writing review prompt is configured for part ${part}`)
      const review = await aiFetch<CriterionReview>('/llm/review', {
        method: 'POST',
        body: {
          topic,
          userContent: response.content,
          prompt,
          outputLanguage: reviewOutputLanguage.value,
        },
      })
      if (review.error || !review.data) throw new Error(review.error || 'Writing grade unavailable.')
      // `totalPoints` is the same number `teil_points_mess` was: the criteria sum to
      // `maxPoints: 10`, so the score the page shows is unchanged.
      updateExerciseGrade('writing', exerciseId, review.data.totalPoints, null, review.data)
      return
    }

    const topic = set.value.content.speaking.find(item => item.id === exerciseId)
    if (!topic || !response.transcripts) return
    const review = await aiFetch<CriterionReview>('/llm/review-speaking', {
      method: 'POST',
      body: {
        topic,
        answers: response.transcripts,
        outputLanguage: reviewOutputLanguage.value,
      },
    })
    if (review.error || !review.data) throw new Error(review.error || 'Speaking grade unavailable.')
    updateExerciseGrade('speaking', exerciseId, review.data.totalPoints, null, review.data)
  } catch (error: unknown) {
    if (skill === 'writing') {
      updateExerciseGrade(
        'writing',
        exerciseId,
        null,
        error instanceof Error ? error.message : 'Writing grade unavailable.'
      )
    } else {
      updateExerciseGrade(
        'speaking',
        exerciseId,
        null,
        error instanceof Error ? error.message : 'Speaking grade unavailable.'
      )
    }
  } finally {
    activeGradingJobs.delete(jobId)
  }
}

async function gradePendingModule(skill: 'writing' | 'speaking'): Promise<void> {
  const definition = set.value.modules.find(module => module.skill === skill)
  for (const exercise of definition?.exercises ?? []) await gradeResponse(skill, exercise.id)
}

async function gradePendingModules(): Promise<void> {
  await Promise.all([gradePendingModule('writing'), gradePendingModule('speaking')])
}
</script>
