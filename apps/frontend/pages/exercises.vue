<template>
  <PackExerciseHub v-if="!pack.compatibility" :key="pack.packId" :pack-id="pack.packId" />
  <div v-else class="max-w-[1240px] mx-auto p-6 space-y-5">
    <!-- Filter panel -->
    <div
      class="bg-base-100 border border-base-300 ring-soft rounded-box p-4 space-y-3 overflow-visible"
    >
      <!-- Module chips row -->
      <div class="flex items-center gap-2 flex-wrap">
        <span
          class="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mr-1"
          >{{ $t('exercisesUi.module') }}</span
        >
        <button
          v-for="s in moduleFilters"
          :key="s.key"
          class="module-chip inline-flex items-center gap-2 h-9 px-3 rounded-field border text-sm font-medium"
          :class="
            activeSkill === s.key
              ? `module-chip-${s.key} is-active`
              : 'bg-base-100 border-base-300 hover:border-base-content/30 text-base-content/80'
          "
          @click="setActiveSkill(s.key)"
        >
          <component :is="s.icon" :size="14" />
          {{ s.label }}
          <span
            v-if="isMounted"
            class="text-[10px]"
            :class="activeSkill === s.key ? 'opacity-80' : 'opacity-50'"
            >{{ s.count }}</span
          >
        </button>
        <button class="btn btn-ghost btn-xs" @click="setActiveSkill('all')">
          {{ $t('exercisesUi.all') }}
        </button>
        <button class="btn btn-primary btn-sm rounded-full gap-2 ml-auto" @click="genOpen = true">
          <Sparkles :size="14" /> {{ $t('exercisesUi.generate') }}
        </button>
      </div>

      <!-- Part filter row -->
      <div class="flex items-start gap-2 flex-wrap border-t border-base-300 pt-3">
        <div
          class="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mr-1 mt-2 flex items-center gap-1"
        >
          {{ $t('exercisesUi.part') }}
          <span class="tooltip tooltip-right normal-case" :data-tip="$t('exercisesUi.partHint')">
            <Info :size="12" class="opacity-50" />
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="sk in partFilterSkills" :key="sk" class="flex items-center gap-1.5 flex-wrap">
            <span
              v-if="partFilterSkills.length > 1"
              class="inline-flex items-center gap-1.5 text-[11px] font-medium text-base-content/55 w-[68px] shrink-0 capitalize"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="`dot-${sk}`" />{{
                getSkillLabel(sk, t)
              }}
            </span>
            <PartChip
              v-for="p in partsForSkill(sk)"
              :key="`${sk}:${p.n}`"
              :skill="sk"
              :n="p.n"
              :active="activeParts.includes(`${sk}:${p.n}`)"
              @toggle="togglePart(sk, p.n)"
            />
          </div>
        </div>
        <button
          v-if="activeParts.length > 0"
          class="btn btn-ghost btn-xs ml-1 mt-1"
          @click="activeParts = []"
        >
          {{ $t('exercisesUi.clearParts') }}
        </button>
      </div>

      <!-- Status + search + sort + view toggle row -->
      <div class="flex items-center gap-2 flex-wrap border-t border-base-300 pt-3">
        <!-- Status chips -->
        <button
          v-for="st in statusFilters"
          :key="st.key"
          class="h-8 px-3 rounded-full text-xs font-medium border whitespace-nowrap transition-colors"
          :class="
            activeStatus === st.key
              ? 'bg-primary text-primary-content border-primary'
              : 'bg-base-100 border-base-300 text-base-content/70 hover:border-base-content/30'
          "
          @click="activeStatus = st.key"
        >
          {{ st.label }}
        </button>
        <div class="relative flex-1 max-w-xs">
          <Search
            :size="14"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
          />
          <input
            v-model="search"
            type="text"
            :placeholder="$t('exercisesUi.search')"
            class="input input-sm input-bordered w-full pl-8 text-sm"
          />
        </div>
        <select v-model="sortBy" class="select select-sm select-bordered text-sm">
          <option value="default">{{ $t('exercisesUi.sortDefault') }}</option>
          <option value="level">{{ $t('exercisesUi.sortLevel') }}</option>
          <option value="time">{{ $t('exercisesUi.sortTime') }}</option>
          <option value="progress">{{ $t('exercisesUi.sortProgress') }}</option>
        </select>
        <div class="flex border border-base-300 rounded-selector overflow-hidden">
          <button
            class="px-2 py-1.5 transition-colors"
            :class="viewMode === 'grid' ? 'bg-base-content text-base-100' : 'hover:bg-base-200'"
            @click="viewMode = 'grid'"
          >
            <LayoutGrid :size="14" />
          </button>
          <button
            class="px-2 py-1.5 transition-colors"
            :class="viewMode === 'list' ? 'bg-base-content text-base-100' : 'hover:bg-base-200'"
            @click="viewMode = 'list'"
          >
            <List :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Generate exercises modal -->
    <ClientOnly>
      <GenerateExercisesModal
        v-if="genOpen"
        @close="genOpen = false"
        @generate="handleGenerateFromModal"
      />
    </ClientOnly>

    <!-- Generation progress (modal flows close immediately, so surface per-part status here) -->
    <ClientOnly>
      <div
        v-if="unifiedGenerationJobs.length"
        class="bg-base-100 border border-base-300 ring-soft rounded-box p-4 space-y-3"
      >
        <div class="flex items-center gap-2 text-sm font-semibold text-base-content">
          <span v-if="isAnyGenerating" class="loading loading-spinner loading-sm text-primary" />
          {{ isAnyGenerating ? $t('generation.generating') : $t('generation.status') }}
        </div>
        <div class="space-y-2">
          <div
            v-for="job in unifiedGenerationJobs"
            :key="`${job.skill}-${job.part}`"
            class="flex items-center justify-between rounded-box border border-base-300 bg-base-200/40 px-3 py-2"
          >
            <span class="text-sm font-medium text-base-content capitalize">
              {{ $t('skill.' + job.skill) }} · {{ $t('exercisesUi.part') }} {{ job.part }}
            </span>
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-selector uppercase"
              :class="jobStatusClass(job.status)"
            >
              {{ $t(statusKey(job.status)) }}
            </span>
          </div>
        </div>
        <p class="text-xs text-base-content/50">
          {{ $t('generation.hint') }}
        </p>
      </div>
    </ClientOnly>

    <!-- Results -->
    <ClientOnly>
      <!-- Grid view -->
      <div v-if="viewMode === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="ex in filtered"
          :key="ex.id"
          class="bg-base-100 border border-base-300 ring-soft rounded-box p-4 card-hov cursor-pointer relative"
          @click="openExercise(ex)"
        >
          <div class="flex items-center gap-2">
            <SkillBadge :skill="ex.skill" size="xs" />
            <span class="level-pip">{{ ex.difficulty }}</span>
            <span class="ml-auto flex items-center gap-1.5">
              <span
                v-if="ex.part"
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                :class="`${meta(ex.skill).softBgClass} ${meta(ex.skill).textClass}`"
              >
                {{ $t('exercisesUi.part') }} {{ ex.part }}
              </span>
              <span
                v-if="ex.status === 'mastered'"
                class="tooltip tooltip-left text-success"
                :data-tip="$t('status.mastered')"
              >
                <CheckCircle2 :size="15" aria-hidden="true" />
              </span>
              <span
                v-if="ex.hasDraft"
                class="tooltip tooltip-left text-warning"
                :data-tip="$t('exercisesUi.draftSaved')"
              >
                <PencilLine :size="15" aria-hidden="true" />
              </span>
              <button
                v-if="ex.skill === 'writing'"
                class="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error"
                type="button"
                :title="$t('exercisesUi.deleteWritingTopic')"
                :aria-label="$t('exercisesUi.deleteWritingTopic')"
                @click.stop="deleteWritingTopic(ex)"
              >
                <Trash2 :size="13" aria-hidden="true" />
              </button>
            </span>
          </div>
          <div class="font-display font-bold text-lg mt-2 leading-tight">{{ ex.title }}</div>
          <div v-if="ex.subtitle" class="text-xs text-base-content/60 mt-0.5">{{ ex.subtitle }}</div>

          <div class="mt-3 flex items-center gap-3 text-[11px] text-base-content/60">
            <span class="flex items-center gap-1">
              <Clock :size="11" />
              {{ ex.minutes }} {{ $t('exercisesUi.min') }}
            </span>
            <span v-if="ex.words" class="flex items-center gap-1">
              <AlignLeft :size="11" />
              {{ ex.words }} {{ $t('exercisesUi.words') }}
            </span>
          </div>

          <div class="mt-3 flex items-center gap-2">
            <progress
              class="progress flex-1 h-1.5"
              :class="progressClass(ex.skill)"
              :value="ex.pct"
              max="100"
            />
            <span class="text-[10px] font-mono text-base-content/60 w-6 text-right">{{
              ex.pct
            }}%</span>
          </div>
          <button
            v-if="ex.skill === 'writing' && ex.status === 'mastered'"
            class="btn btn-ghost btn-xs gap-1 mt-3"
            type="button"
            @click.stop="repeatWritingExercise(ex.id)"
          >
            {{ $t('exercisesUi.repeat') }} <ChevronRight :size="12" aria-hidden="true" />
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="filtered.length === 0" class="col-span-3 py-16 text-center">
          <BookOpen :size="32" class="mx-auto text-base-content/20 mb-3" />
          <p class="text-sm text-base-content/50">{{ $t('exercisesUi.noMatches') }}</p>
          <button class="btn btn-ghost btn-sm mt-2" @click="resetFilters">
            {{ $t('exercisesUi.clearFilters') }}
          </button>
        </div>
      </div>

      <!-- List view -->
      <div v-else class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
        <table class="table table-sm w-full">
          <thead>
            <tr class="text-xs text-base-content/50 border-b border-base-300">
              <th class="font-medium py-3 pl-5">{{ $t('exercisesUi.exercise') }}</th>
              <th class="font-medium py-3">{{ $t('exercisesUi.skill') }}</th>
              <th class="font-medium py-3">{{ $t('exercisesUi.type') }}</th>
              <th class="font-medium py-3">{{ $t('exercisesUi.level') }}</th>
              <th class="font-medium py-3">{{ $t('exercisesUi.time') }}</th>
              <th class="font-medium py-3">{{ $t('exercisesUi.progress') }}</th>
              <th class="font-medium py-3 pr-5" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ex in filtered"
              :key="ex.id"
              class="border-b border-base-200 hover:bg-base-200 transition-colors cursor-pointer"
              @click="openExercise(ex)"
            >
              <td class="py-3 pl-5">
                <span class="text-sm font-medium">{{ ex.title }}</span>
              </td>
              <td class="py-3">
                <span
                  class="flex items-center gap-1.5 text-xs font-medium capitalize"
                  :class="`text-${ex.skill}`"
                >
                  <component :is="skillIcon(ex.skill)" :size="12" />
                  {{ $t('skill.' + ex.skill) }}
                </span>
              </td>
              <td class="py-3 text-xs text-base-content/60 capitalize">
                {{ getTypeLabel(ex.type, t)
                }}<span v-if="ex.part"> · {{ $t('exercisesUi.part') }} {{ ex.part }}</span>
              </td>
              <td class="py-3">
                <span class="level-pip">{{ ex.difficulty }}</span>
              </td>
              <td class="py-3 text-xs text-base-content/60">
                {{ ex.minutes }} {{ $t('exercisesUi.min') }}
              </td>
              <td class="py-3">
                <div class="flex items-center gap-2 w-28">
                  <progress
                    class="progress flex-1 h-1"
                    :class="progressClass(ex.skill)"
                    :value="ex.pct"
                    max="100"
                  />
                  <span class="text-xs font-mono text-base-content/40">{{ ex.pct }}%</span>
                </div>
              </td>
              <td class="py-3 pr-5">
                <button
                  class="btn btn-xs btn-ghost gap-1 opacity-60 hover:opacity-100"
                  type="button"
                  @click.stop="openExercise(ex)"
                >
                  {{
                    ex.skill === 'writing' && ex.status === 'mastered'
                      ? $t('exercisesUi.review')
                      : $t('exercisesUi.start')
                  }}
                  <ChevronRight :size="12" />
                </button>
                <button
                  v-if="ex.skill === 'writing' && ex.status === 'mastered'"
                  class="btn btn-xs btn-ghost"
                  type="button"
                  @click.stop="repeatWritingExercise(ex.id)"
                >
                  {{ $t('exercisesUi.repeat') }}
                </button>
                <button
                  v-if="ex.skill === 'writing'"
                  class="btn btn-xs btn-ghost text-base-content/40 hover:text-error"
                  type="button"
                  :aria-label="$t('exercisesUi.deleteWritingTopic')"
                  @click.stop="deleteWritingTopic(ex)"
                >
                  <Trash2 :size="12" aria-hidden="true" />
                </button>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="py-12 text-center text-sm text-base-content/50">
                {{ $t('exercisesUi.noMatches') }}.
                <button class="btn btn-ghost btn-xs ml-2" @click="resetFilters">
                  {{ $t('exercisesUi.clear') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #fallback>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="rounded-box h-44 skel" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  PencilLine,
  Headphones,
  Mic,
  Search,
  LayoutGrid,
  List,
  Clock,
  AlignLeft,
  ChevronRight,
  Trash2,
  Info,
  Sparkles,
  CheckCircle2,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { SkillId } from '~/utils/labels'
import type { SkillId as PackSkillId } from '@exam-one/exam-packs'
import { parseSkillPartKeys } from '~/utils/generation/partJobs'
import { storeToRefs } from 'pinia'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useReadingGeneration } from '~/composables/useReadingGeneration'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useWritingGeneration } from '~/composables/useWritingGeneration'
import { useListeningExercises } from '~/composables/useListeningExercises'
import { useListeningGeneration } from '~/composables/useListeningGeneration'
import { useSpeakingExercises } from '~/composables/useSpeakingExercises'
import { useSpeakingGeneration } from '~/composables/useSpeakingGeneration'
import { useProgress } from '~/composables/useProgress'
import { useSettingsStore } from '~/stores/settings'
import { getSkillMeta, getSkillLabel, getTypeLabel } from '~/utils/labels'
import GenerateExercisesModal from '~/components/exercises/GenerateExercisesModal.vue'

usePageMeta('pageMeta.exercisesTitle', 'pageMeta.exercisesSubtitle')
useHead({ title: 'Exercises — Exam.one' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)
const { partsFor, pack } = useActivePack()

const { getTexts, addTexts } = useReadingTexts()
const { getTopics, addTopics, deleteTopic } = useWritingTopics()
const { getExercises: getListening, addExercises: addListening } = useListeningExercises()
const { getTopics: getSpeaking, addTopics: addSpeaking } = useSpeakingExercises()
const {
  getProgressStats,
  isTextCompleted,
  isWritingTopicCompleted,
  getWritingTopicProgress,
  getAllWritingSessions,
  getListeningProgress,
  isListeningCompleted,
  isSpeakingCompleted,
} = useProgress()

const LISTENING_TYPE_BY_PART: Record<number, string> = {
  1: 'announcement',
  2: 'matching',
  3: 'dialog',
  4: 'interview',
}
const LISTENING_MINUTES_BY_PART: Record<number, number> = { 1: 6, 2: 7, 3: 5, 4: 8 }
const SPEAKING_MINUTES_BY_PART: Record<number, number> = { 1: 6, 2: 7 }

// Generation composables — one per skill module
const {
  generateReading,
  isGenerating: isGeneratingReading,
  generationJobs: readingGenerationJobs,
  generationError: readingGenerationError,
} = useReadingGeneration()
const {
  generateWriting,
  isGenerating: isGeneratingWriting,
  generationJobs: writingGenerationJobs,
} = useWritingGeneration()
const {
  generateListening,
  isGenerating: isGeneratingListening,
  generationJobs: listeningGenerationJobs,
  generationError: listeningGenerationError,
} = useListeningGeneration()
const {
  generateSpeaking,
  isGenerating: isGeneratingSpeaking,
  generationJobs: speakingGenerationJobs,
  generationError: speakingGenerationError,
} = useSpeakingGeneration()

// Generate exercises modal
const genOpen = ref(false)

type GeneratePayload = {
  level: string
  skills: SkillId[]
  parts: string[]
  count: number
  difficulty: 'easier' | 'balanced' | 'harder'
}

async function handleGenerateFromModal(payload: GeneratePayload) {
  // Difficulty is a mock control and is intentionally never forwarded to the composables.
  genOpen.value = false

  for (const skill of payload.skills) {
    try {
      if (skill === 'reading') {
        const parts = parseSkillPartKeys('reading', payload.parts)
        await generateReading(examLevel.value, {
          parts: parts.length ? parts : undefined,
          onPartComplete: items => void addTexts(items),
        })
        if (readingGenerationError.value) {
          alert(readingGenerationError.value)
        }
      } else if (skill === 'writing') {
        const selectedParts = payload.parts
          .filter(p => p.startsWith('writing:'))
          .map(p => Number(p.split(':')[1]))
          .filter((n): n is 1 | 2 => n === 1 || n === 2)
        const partsToGenerate: (1 | 2)[] = selectedParts.length ? selectedParts : [1, 2]
        await generateWriting(examLevel.value, {
          parts: partsToGenerate,
          onPartComplete: items => void addTopics(items),
        })
      } else if (skill === 'listening') {
        const parts = parseSkillPartKeys('listening', payload.parts)
        await generateListening(examLevel.value, {
          parts: parts.length ? parts : undefined,
          onPartComplete: items => void addListening(items),
        })
        if (listeningGenerationError.value) {
          alert(listeningGenerationError.value)
        }
      } else if (skill === 'speaking') {
        const parts = parseSkillPartKeys('speaking', payload.parts)
        await generateSpeaking(examLevel.value, {
          parts: parts.length ? parts : undefined,
          onPartComplete: items => void addSpeaking(items),
        })
        if (speakingGenerationError.value) {
          alert(speakingGenerationError.value)
        }
      }
    } catch (error: unknown) {
      console.error(`Failed to generate ${skill} exercises:`, error)
      alert(
        error instanceof Error
          ? error.message
          : t('generation.skillErrorFallback', { skill: t('skill.' + skill) })
      )
    }
  }
}

const isAnyGenerating = computed(
  () =>
    isGeneratingReading.value ||
    isGeneratingListening.value ||
    isGeneratingSpeaking.value ||
    isGeneratingWriting.value
)

type UnifiedJob = {
  skill: string
  part: number
  status: PartStatus
}

const unifiedGenerationJobs = computed<UnifiedJob[]>(() => {
  const jobs: UnifiedJob[] = []

  readingGenerationJobs.value.forEach(job =>
    jobs.push({ skill: 'reading', part: job.part, status: job.status })
  )
  listeningGenerationJobs.value.forEach(job =>
    jobs.push({ skill: 'listening', part: job.part, status: job.status })
  )
  speakingGenerationJobs.value.forEach(job =>
    jobs.push({ skill: 'speaking', part: job.part, status: job.status })
  )

  writingGenerationJobs.value.forEach(job =>
    jobs.push({ skill: 'writing', part: job.part, status: job.status })
  )

  return jobs
})

// Filter state
const activeSkill = ref<string>('all')
const activeStatus = ref<string>('all')
const activeParts = ref<string[]>([])
const search = ref('')
const sortBy = ref('default')
const viewMode = ref<'grid' | 'list'>('grid')

const SKILL_KEYS: SkillId[] = ['reading', 'writing', 'listening', 'speaking']

function setActiveSkill(key: string) {
  if (activeSkill.value !== key) {
    activeSkill.value = key
    // Clearing/switching modules clears the part selection
    activeParts.value = []
  }
}

function togglePart(skill: string, n: number) {
  const key = `${skill}:${n}`
  const idx = activeParts.value.indexOf(key)
  if (idx === -1) activeParts.value = [...activeParts.value, key]
  else activeParts.value = activeParts.value.filter(k => k !== key)
}

// Skills shown in the Part filter row: the active module, or all four when 'All'
const partFilterSkills = computed<SkillId[]>(() =>
  activeSkill.value === 'all' ? SKILL_KEYS : [activeSkill.value as SkillId]
)

function partsForSkill(skill: SkillId) {
  return partsFor(skill as PackSkillId)
}

// Apply ?skill= and ?part= query params
function applyQuery() {
  const skillParam = route.query['skill'] as string | undefined
  const partParam = route.query['part'] as string | undefined
  if (skillParam && SKILL_KEYS.includes(skillParam as SkillId)) {
    activeSkill.value = skillParam
    const partNum = Number(partParam)
    if (partParam && Number.isFinite(partNum) && partNum > 0) {
      activeParts.value = [`${skillParam}:${partNum}`]
    } else {
      activeParts.value = []
    }
  }
}

// Guard client-only counts (derived from API-backed catalogs) to avoid hydration mismatch
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
  applyQuery()
})

// Watch route query for sidebar clicks / deep links
watch(() => [route.query['skill'], route.query['part']], applyQuery)

// Unified exercise list
type UnifiedExercise = {
  id: string
  skill: SkillId
  title: string
  subtitle?: string | undefined
  type: string
  difficulty: string
  minutes: number
  words?: number | undefined
  pct: number
  status: 'new' | 'inprogress' | 'mastered'
  part?: number | undefined
  hasDraft?: boolean | undefined
}

const allExercises = computed<UnifiedExercise[]>(() => {
  const rStats = getProgressStats()
  const readingList = getTexts()
    .filter(item => item.difficulty === examLevel.value)
    .map(item => {
      const activity = rStats.recentActivity?.find(
        (a: { textId: string; percentage: number }) => a.textId === item.id
      )
      const pct = activity ? activity.percentage : 0
      const completed = isTextCompleted(item.id)
      const typeLabel = getTypeLabel(item.textType, t)
      const partLabel = item.testingPart ? `${t('exercisesUi.part')} ${item.testingPart}` : ''
      return {
        id: item.id,
        skill: 'reading' as const,
        title: item.title,
        subtitle: [typeLabel, partLabel].filter(Boolean).join(' · '),
        type: item.textType,
        difficulty: item.difficulty,
        minutes: item.estimatedReadingTime,
        words: item.wordCount,
        pct,
        status: completed ? 'mastered' : pct > 0 ? 'inprogress' : 'new',
        part: item.testingPart,
      } satisfies UnifiedExercise
    })

  const draftTopicIds = new Set(getAllWritingSessions().map(session => session.topicId))
  const writingList = getTopics()
    .filter(item => item.difficulty === examLevel.value)
    .map(item => {
      const completed = isWritingTopicCompleted(item.id)
      const progress = getWritingTopicProgress(item.id)
      const hasDraft = draftTopicIds.has(item.id)
      return {
        id: item.id,
        skill: 'writing' as const,
        title: item.title,
        subtitle: item.description || getTypeLabel(item.topicType, t),
        type: item.topicType,
        difficulty: item.difficulty,
        minutes: item.estimatedTime,
        words: item.wordCount.max,
        pct: completed ? 100 : hasDraft ? 50 : progress ? 25 : 0,
        status: completed ? 'mastered' : hasDraft || progress ? 'inprogress' : 'new',
        part: item.testingPart,
        hasDraft: hasDraft && !completed,
      } satisfies UnifiedExercise
    })

  const listeningList = getListening()
    .filter(item => item.difficulty === examLevel.value)
    .map(item => {
      const id = item.id ?? ''
      const progress = getListeningProgress(id)
      const pct = progress?.percentage ?? 0
      const completed = isListeningCompleted(id)
      return {
        id,
        skill: 'listening' as const,
        title: item.title,
        subtitle: `${t('exercisesUi.part')} ${item.testingPart}`,
        type: LISTENING_TYPE_BY_PART[item.testingPart] ?? 'listening',
        difficulty: item.difficulty,
        minutes: LISTENING_MINUTES_BY_PART[item.testingPart] ?? 6,
        pct,
        status: completed ? 'mastered' : pct > 0 ? 'inprogress' : 'new',
        part: item.testingPart,
      } satisfies UnifiedExercise
    })

  const speakingList = getSpeaking()
    .filter(item => item.difficulty === examLevel.value)
    .map(item => {
      const completed = isSpeakingCompleted(item.id)
      return {
        id: item.id,
        skill: 'speaking' as const,
        title: item.theme,
        subtitle: getTypeLabel(item.topicType, t),
        type: item.topicType,
        difficulty: item.difficulty,
        minutes: SPEAKING_MINUTES_BY_PART[item.testingPart] ?? 7,
        pct: completed ? 100 : 0,
        status: completed ? 'mastered' : 'new',
        part: item.testingPart,
      } satisfies UnifiedExercise
    })

  return [...readingList, ...writingList, ...listeningList, ...speakingList]
})

// Module (skill) filter options — color-coded chips
const moduleFilters = computed(() => [
  {
    key: 'reading',
    label: getSkillLabel('reading', t),
    icon: BookOpen,
    count: allExercises.value.filter(e => e.skill === 'reading').length,
  },
  {
    key: 'writing',
    label: getSkillLabel('writing', t),
    icon: PencilLine,
    count: allExercises.value.filter(e => e.skill === 'writing').length,
  },
  {
    key: 'listening',
    label: getSkillLabel('listening', t),
    icon: Headphones,
    count: allExercises.value.filter(e => e.skill === 'listening').length,
  },
  {
    key: 'speaking',
    label: getSkillLabel('speaking', t),
    icon: Mic,
    count: allExercises.value.filter(e => e.skill === 'speaking').length,
  },
])

const statusFilters = computed(() => [
  { key: 'all', label: t('exercisesUi.all') },
  { key: 'new', label: t('status.new') },
  { key: 'inprogress', label: t('status.inprogress') },
  { key: 'mastered', label: t('status.mastered') },
])

// Filtered + sorted list
const filtered = computed(() => {
  let list = allExercises.value

  if (activeSkill.value !== 'all') {
    list = list.filter(e => e.skill === activeSkill.value)
  }
  if (activeParts.value.length) {
    list = list.filter(e => e.part != null && activeParts.value.includes(`${e.skill}:${e.part}`))
  }
  if (activeStatus.value !== 'all') {
    list = list.filter(e => e.status === activeStatus.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(e => e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q))
  }

  if (sortBy.value === 'level') {
    list = [...list].sort((a, b) => a.difficulty.localeCompare(b.difficulty))
  } else if (sortBy.value === 'time') {
    list = [...list].sort((a, b) => a.minutes - b.minutes)
  } else if (sortBy.value === 'progress') {
    list = [...list].sort((a, b) => b.pct - a.pct)
  }

  return list
})

function skillIcon(skill: string): Component {
  const map: Record<string, Component> = {
    reading: BookOpen,
    writing: PencilLine,
    listening: Headphones,
    speaking: Mic,
  }
  return map[skill] ?? BookOpen
}

function progressClass(skill: string) {
  return getSkillMeta(skill).progressClass
}

function meta(skill: SkillId) {
  return getSkillMeta(skill)
}

function openExercise(ex: UnifiedExercise) {
  if (ex.skill === 'reading') router.push(`/reading/${ex.id}`)
  else if (ex.skill === 'writing')
    router.push(ex.status === 'mastered' ? `/writing/${ex.id}/checking` : `/writing/${ex.id}/exam`)
  else if (ex.skill === 'listening') router.push(`/listening/${ex.id}`)
  else if (ex.skill === 'speaking') router.push(`/speaking/${ex.id}`)
}

function repeatWritingExercise(topicId: string) {
  router.push(`/writing/${topicId}/exam`)
}

function deleteWritingTopic(ex: UnifiedExercise) {
  if (ex.skill !== 'writing') return
  const confirmed = confirm(t('exercisesUi.deleteWritingConfirm', { title: ex.title }))
  if (confirmed) {
    void deleteTopic(ex.id)
  }
}

function resetFilters() {
  activeSkill.value = 'all'
  activeStatus.value = 'all'
  activeParts.value = []
  search.value = ''
  sortBy.value = 'default'
}

type PartStatus = 'queued' | 'running' | 'done' | 'failed'

function statusKey(status: PartStatus) {
  const keys: Record<PartStatus, string> = {
    queued: 'generation.statusQueued',
    running: 'generation.statusRunning',
    done: 'generation.statusDone',
    failed: 'generation.statusFailed',
  }
  return keys[status]
}

function jobStatusClass(status: PartStatus) {
  const classes: Record<PartStatus, string> = {
    queued: 'text-base-content/50',
    running: 'text-primary font-medium',
    done: 'text-success',
    failed: 'text-error',
  }
  return classes[status]
}
</script>
