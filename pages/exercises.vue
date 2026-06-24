<template>
  <div class="max-w-[1240px] mx-auto p-6 space-y-5">

    <!-- Filter panel -->
    <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-4 space-y-3 overflow-visible">
      <!-- Module chips row -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mr-1">{{ $t('exercisesUi.module') }}</span>
        <button
          v-for="s in moduleFilters"
          :key="s.key"
          class="module-chip inline-flex items-center gap-2 h-9 px-3 rounded-field border text-sm font-medium"
          :class="activeSkill === s.key
            ? `module-chip-${s.key} is-active`
            : 'bg-base-100 border-base-300 hover:border-base-content/30 text-base-content/80'"
          @click="setActiveSkill(s.key)"
        >
          <component :is="s.icon" :size="14" />
          {{ s.label }}
          <span class="text-[10px]" :class="activeSkill === s.key ? 'opacity-80' : 'opacity-50'">{{ s.count }}</span>
        </button>
        <button class="btn btn-ghost btn-xs" @click="setActiveSkill('all')">{{ $t('exercisesUi.all') }}</button>
      </div>

      <!-- Part filter row -->
      <div class="flex items-start gap-2 flex-wrap border-t border-base-300 pt-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mr-1 mt-2 flex items-center gap-1">
          {{ $t('exercisesUi.part') }}
          <span class="tooltip tooltip-right normal-case" :data-tip="$t('exercisesUi.partHint')">
            <Info :size="12" class="opacity-50" />
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="sk in partFilterSkills"
            :key="sk"
            class="flex items-center gap-1.5 flex-wrap"
          >
            <span
              v-if="partFilterSkills.length > 1"
              class="inline-flex items-center gap-1.5 text-[11px] font-medium text-base-content/55 w-[68px] shrink-0 capitalize"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="`dot-${sk}`" />{{ sk }}
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
        <button v-if="activeParts.length > 0" class="btn btn-ghost btn-xs ml-1 mt-1" @click="activeParts = []">
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
          :class="activeStatus === st.key
            ? 'bg-primary text-primary-content border-primary'
            : 'bg-base-100 border-base-300 text-base-content/70 hover:border-base-content/30'"
          @click="activeStatus = st.key"
        >
          {{ st.label }}
        </button>
        <div class="relative flex-1 max-w-xs">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            v-model="search"
            type="text"
            :placeholder="$t('exercisesUi.search')"
            class="input input-sm input-bordered w-full pl-8 text-sm"
          >
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

    <!-- Skill generators -->
    <ClientOnly>
      <ReadingGeneratorCard
        v-if="activeSkill === 'reading'"
        :is-generating="isGeneratingReading"
        :generating-difficulty="generatingReadingDifficulty"
        :generation-error="readingGenerationError"
        :current-difficulty="examLevel"
        @generate="handleGenerateReading"
        @retry="handleRetryReading"
        @dismiss="handleDismissReadingError"
      />
      <TopicGeneratorCard
        v-else-if="activeSkill === 'writing' && examLevel === 'A2'"
        :is-generating="isGeneratingWriting"
        :generating-part="generatingWritingPart"
        :generation-error="writingGenerationError"
        :current-difficulty="examLevel"
        @generate="handleGenerateWriting"
        @retry="handleRetryWriting"
        @dismiss="handleDismissWritingError"
      />
      <div v-else-if="activeSkill === 'writing'" class="bg-base-100 border border-base-300/70 rounded-box p-5 sm:p-6">
        <div class="flex flex-col lg:flex-row lg:items-center gap-4">
          <div class="w-12 h-12 rounded-field bg-base-200 text-base-content/50 grid place-items-center shrink-0">
            <PencilLine :size="22" aria-hidden="true" />
          </div>
          <div>
            <h3 class="font-display text-lg font-bold">Writing generation is available for A2</h3>
            <p class="text-sm text-base-content/60 mt-1">Switch to A2 to generate new Goethe A2 writing topics. Existing C1 writing practice remains available offline.</p>
          </div>
        </div>
      </div>
    </ClientOnly>

    <!-- Results -->
    <ClientOnly>
      <!-- Grid view -->
      <div v-if="viewMode === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="ex in filtered"
          :key="ex.id"
          class="bg-base-100 border border-base-300 ring-soft rounded-box p-5 card-hov cursor-pointer"
          @click="openExercise(ex)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-9 h-9 rounded-selector flex items-center justify-center" :class="`bg-${ex.skill}-soft`">
              <component :is="skillIcon(ex.skill)" :size="16" :class="`text-${ex.skill}`" />
            </div>
            <div class="flex items-center gap-2">
              <span class="level-pip">{{ ex.difficulty }}</span>
              <button
                v-if="ex.skill === 'writing'"
                class="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error"
                type="button"
                title="Delete writing topic"
                aria-label="Delete writing topic"
                @click.stop="deleteWritingTopic(ex)"
              >
                <Trash2 :size="13" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p class="text-sm font-semibold mb-1 line-clamp-2">{{ ex.title }}</p>
          <p class="text-xs text-base-content/50 capitalize mb-3">
            {{ ex.skill }} · {{ ex.type }}<span v-if="ex.part" class="uppercase"> · Teil {{ ex.part }}</span>
          </p>

          <div class="flex items-center gap-3 text-xs text-base-content/50 mb-3">
            <span class="flex items-center gap-1">
              <Clock :size="11" />
              {{ ex.minutes }} min
            </span>
            <span v-if="ex.words" class="flex items-center gap-1">
              <AlignLeft :size="11" />
              {{ ex.words }} words
            </span>
          </div>

          <div class="flex items-center gap-2">
            <progress class="progress flex-1 h-1.5" :class="progressClass(ex.skill)" :value="ex.pct" max="100" />
            <span class="text-xs font-mono text-base-content/40 w-8 text-right">{{ ex.pct }}%</span>
            <span
              class="text-[10px] font-semibold px-1.5 py-0.5 rounded-selector"
              :class="statusClass(ex.status)"
            >{{ statusLabel(ex.status) }}</span>
          </div>
          <button
            v-if="ex.skill === 'writing' && ex.status === 'mastered'"
            class="btn btn-ghost btn-xs gap-1 mt-3"
            type="button"
            @click.stop="repeatWritingExercise(ex.id)"
          >
            Repeat <ChevronRight :size="12" aria-hidden="true" />
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="filtered.length === 0" class="col-span-3 py-16 text-center">
          <BookOpen :size="32" class="mx-auto text-base-content/20 mb-3" />
          <p class="text-sm text-base-content/50">No exercises match your filters</p>
          <button class="btn btn-ghost btn-sm mt-2" @click="resetFilters">Clear filters</button>
        </div>
      </div>

      <!-- List view -->
      <div v-else class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
        <table class="table table-sm w-full">
          <thead>
            <tr class="text-xs text-base-content/50 border-b border-base-300">
              <th class="font-medium py-3 pl-5">Exercise</th>
              <th class="font-medium py-3">Skill</th>
              <th class="font-medium py-3">Type</th>
              <th class="font-medium py-3">Level</th>
              <th class="font-medium py-3">Time</th>
              <th class="font-medium py-3">Progress</th>
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
                <span class="flex items-center gap-1.5 text-xs font-medium capitalize" :class="`text-${ex.skill}`">
                  <component :is="skillIcon(ex.skill)" :size="12" />
                  {{ ex.skill }}
                </span>
              </td>
              <td class="py-3 text-xs text-base-content/60 capitalize">
                {{ ex.type }}<span v-if="ex.part"> · Teil {{ ex.part }}</span>
              </td>
              <td class="py-3"><span class="level-pip">{{ ex.difficulty }}</span></td>
              <td class="py-3 text-xs text-base-content/60">{{ ex.minutes }} min</td>
              <td class="py-3">
                <div class="flex items-center gap-2 w-28">
                  <progress class="progress flex-1 h-1" :class="progressClass(ex.skill)" :value="ex.pct" max="100" />
                  <span class="text-xs font-mono text-base-content/40">{{ ex.pct }}%</span>
                </div>
              </td>
              <td class="py-3 pr-5">
                <button
                  class="btn btn-xs btn-ghost gap-1 opacity-60 hover:opacity-100"
                  type="button"
                  @click.stop="openExercise(ex)"
                >
                  {{ ex.skill === 'writing' && ex.status === 'mastered' ? 'Review' : 'Start' }}
                  <ChevronRight :size="12" />
                </button>
                <button
                  v-if="ex.skill === 'writing' && ex.status === 'mastered'"
                  class="btn btn-xs btn-ghost"
                  type="button"
                  @click.stop="repeatWritingExercise(ex.id)"
                >
                  Repeat
                </button>
                <button
                  v-if="ex.skill === 'writing'"
                  class="btn btn-xs btn-ghost text-base-content/40 hover:text-error"
                  type="button"
                  aria-label="Delete writing topic"
                  @click.stop="deleteWritingTopic(ex)"
                >
                  <Trash2 :size="12" aria-hidden="true" />
                </button>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="py-12 text-center text-sm text-base-content/50">
                No exercises match your filters.
                <button class="btn btn-ghost btn-xs ml-2" @click="resetFilters">Clear</button>
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
import { BookOpen, PencilLine, Headphones, Mic, Search, LayoutGrid, List, Clock, AlignLeft, ChevronRight, Trash2, Info } from 'lucide-vue-next'
import type { Component } from 'vue'
import { goetheA2Structure } from '~/data/examStructure/goetheA2'
import type { SkillId } from '~/utils/labels'
import { storeToRefs } from 'pinia'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useReadingGeneration } from '~/composables/useReadingGeneration'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useTopicGeneration } from '~/composables/useTopicGeneration'
import { useListeningExercises } from '~/composables/useListeningExercises'
import { useSpeakingExercises } from '~/composables/useSpeakingExercises'
import { useProgress } from '~/composables/useProgress'
import { useSettingsStore } from '~/stores/settings'
import { getSkillMeta, getSkillLabel } from '~/utils/labels'
import ReadingGeneratorCard from '~/components/reading/ReadingGeneratorCard.vue'
import TopicGeneratorCard from '~/components/writing/TopicGeneratorCard.vue'

usePageMeta('pageMeta.exercisesTitle', 'pageMeta.exercisesSubtitle')
useHead({ title: 'Exercises — Exam.one' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const { examLevel } = storeToRefs(settingsStore)

const { getTexts, addTexts } = useReadingTexts()
const { getTopics, addTopics, deleteTopic } = useWritingTopics()
const { getExercises: getListening } = useListeningExercises()
const { getTopics: getSpeaking } = useSpeakingExercises()
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
  1: 'announcement', 2: 'matching', 3: 'dialog', 4: 'interview',
}
const LISTENING_MINUTES_BY_PART: Record<number, number> = { 1: 6, 2: 7, 3: 5, 4: 8 }
const SPEAKING_MINUTES_BY_PART: Record<number, number> = { 1: 6, 2: 7 }

// Reading generation
const {
  isGenerating: isGeneratingReading,
  generatingDifficulty: generatingReadingDifficulty,
  generationError: readingGenerationError,
  generateReading,
  retryGeneration: retryReadingGeneration,
  dismissError: dismissReadingError,
} = useReadingGeneration()

const {
  isGenerating: isGeneratingWriting,
  generatingPart: generatingWritingPart,
  generationError: writingGenerationError,
  generateTopics,
  retryGeneration: retryWritingGeneration,
  dismissError: dismissWritingError,
} = useTopicGeneration()

async function handleGenerateReading() {
  try {
    const newTexts = await generateReading(examLevel.value)
    addTexts(newTexts)
  } catch (error: unknown) {
    console.error('Failed to generate reading exercises:', error)
    alert(error instanceof Error ? error.message : 'Failed to generate reading exercises')
  }
}

async function handleRetryReading() {
  try {
    const newTexts = await retryReadingGeneration()
    addTexts(newTexts)
  } catch (error: unknown) {
    console.error('Failed to retry reading generation:', error)
    alert(error instanceof Error ? error.message : 'Failed to retry generation')
  }
}

function handleDismissReadingError() {
  dismissReadingError()
}

async function handleGenerateWriting(part: 1 | 2) {
  try {
    const newTopics = await generateTopics(part, examLevel.value)
    addTopics(newTopics)
  } catch (error: unknown) {
    console.error('Failed to generate writing topics:', error)
    alert(error instanceof Error ? error.message : 'Failed to generate writing topics')
  }
}

async function handleRetryWriting() {
  try {
    const newTopics = await retryWritingGeneration()
    addTopics(newTopics)
  } catch (error: unknown) {
    console.error('Failed to retry writing generation:', error)
    alert(error instanceof Error ? error.message : 'Failed to retry generation')
  }
}

function handleDismissWritingError() {
  dismissWritingError()
}

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
  activeSkill.value === 'all' ? SKILL_KEYS : [activeSkill.value as SkillId],
)

function partsForSkill(skill: SkillId) {
  return goetheA2Structure.find(m => m.id === skill)?.parts ?? []
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

onMounted(applyQuery)

// Watch route query for sidebar clicks / deep links
watch(() => [route.query['skill'], route.query['part']], applyQuery)

// Unified exercise list
type UnifiedExercise = {
  id: string
  skill: string
  title: string
  type: string
  difficulty: string
  minutes: number
  words?: number
  pct: number
  status: 'new' | 'inprogress' | 'mastered'
  part?: number
}

const allExercises = computed<UnifiedExercise[]>(() => {
  const rStats = getProgressStats()
  const readingList = getTexts().filter(t => t.difficulty === examLevel.value).map(t => {
    const activity = rStats.recentActivity?.find((a: { textId: string; percentage: number }) => a.textId === t.id)
    const pct = activity ? activity.percentage : 0
    const completed = isTextCompleted(t.id)
    return {
      id: t.id,
      skill: 'reading',
      title: t.title,
      type: t.textType,
      difficulty: t.difficulty,
      minutes: t.estimatedReadingTime,
      words: t.wordCount,
      pct,
      status: completed ? 'mastered' : pct > 0 ? 'inprogress' : 'new',
      part: t.testingPart
    } as UnifiedExercise
  })

  const draftTopicIds = new Set(getAllWritingSessions().map(session => session.topicId))
  const writingList = getTopics().filter(t => t.difficulty === examLevel.value).map(t => {
    const completed = isWritingTopicCompleted(t.id)
    const progress = getWritingTopicProgress(t.id)
    const hasDraft = draftTopicIds.has(t.id)
    return {
      id: t.id,
      skill: 'writing',
      title: t.title,
      type: t.topicType,
      difficulty: t.difficulty,
      minutes: t.estimatedTime,
      words: t.wordCount.max,
      pct: completed ? 100 : hasDraft ? 50 : progress ? 25 : 0,
      status: completed ? 'mastered' : hasDraft || progress ? 'inprogress' : 'new',
      part: t.testingPart,
    } as UnifiedExercise
  })

  const listeningList = getListening()
    .filter(e => e.difficulty === examLevel.value)
    .map(e => {
      const id = e.id ?? ''
      const progress = getListeningProgress(id)
      const pct = progress?.percentage ?? 0
      const completed = isListeningCompleted(id)
      return {
        id,
        skill: 'listening',
        title: e.title,
        type: LISTENING_TYPE_BY_PART[e.testingPart] ?? 'listening',
        difficulty: e.difficulty,
        minutes: LISTENING_MINUTES_BY_PART[e.testingPart] ?? 6,
        pct,
        status: completed ? 'mastered' : pct > 0 ? 'inprogress' : 'new',
        part: e.testingPart,
      } as UnifiedExercise
    })

  const speakingList = getSpeaking()
    .filter(t => t.difficulty === examLevel.value)
    .map(t => {
      const completed = isSpeakingCompleted(t.id)
      return {
        id: t.id,
        skill: 'speaking',
        title: t.theme,
        type: t.topicType,
        difficulty: t.difficulty,
        minutes: SPEAKING_MINUTES_BY_PART[t.testingPart] ?? 7,
        pct: completed ? 100 : 0,
        status: completed ? 'mastered' : 'new',
        part: t.testingPart,
      } as UnifiedExercise
    })

  return [...readingList, ...writingList, ...listeningList, ...speakingList]
})

// Module (skill) filter options — color-coded chips
const moduleFilters = computed(() => [
  { key: 'reading', label: getSkillLabel('reading', t), icon: BookOpen, count: allExercises.value.filter(e => e.skill === 'reading').length },
  { key: 'writing', label: getSkillLabel('writing', t), icon: PencilLine, count: allExercises.value.filter(e => e.skill === 'writing').length },
  { key: 'listening', label: getSkillLabel('listening', t), icon: Headphones, count: allExercises.value.filter(e => e.skill === 'listening').length },
  { key: 'speaking', label: getSkillLabel('speaking', t), icon: Mic, count: allExercises.value.filter(e => e.skill === 'speaking').length },
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
  const map: Record<string, Component> = { reading: BookOpen, writing: PencilLine, listening: Headphones, speaking: Mic }
  return map[skill] ?? BookOpen
}

function statusLabel(status: string) {
  const map: Record<string, string> = { new: 'New', inprogress: 'In progress', mastered: 'Mastered' }
  return map[status] ?? ''
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    new: 'bg-base-200 text-base-content/50',
    inprogress: 'bg-warning/20 text-warning',
    mastered: 'bg-success/20 text-success'
  }
  return map[status] ?? ''
}

function openExercise(ex: UnifiedExercise) {
  if (ex.skill === 'reading') router.push(`/reading/${ex.id}`)
  else if (ex.skill === 'writing') router.push(ex.status === 'mastered' ? `/writing/${ex.id}/checking` : `/writing/${ex.id}/exam`)
  else if (ex.skill === 'listening') router.push(`/listening/${ex.id}`)
  else if (ex.skill === 'speaking') router.push(`/speaking/${ex.id}`)
}

function repeatWritingExercise(topicId: string) {
  router.push(`/writing/${topicId}/exam`)
}

function deleteWritingTopic(ex: UnifiedExercise) {
  if (ex.skill !== 'writing') return
  const confirmed = confirm(`Delete "${ex.title}"?\n\nThis removes the writing topic from local storage.`)
  if (confirmed) {
    deleteTopic(ex.id)
  }
}

function progressClass(skill: string) {
  return getSkillMeta(skill).progressClass
}

function resetFilters() {
  activeSkill.value = 'all'
  activeStatus.value = 'all'
  activeParts.value = []
  search.value = ''
  sortBy.value = 'default'
}
</script>
