<template>
  <div class="max-w-[1240px] mx-auto p-6 space-y-5">

    <!-- Filter panel -->
    <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-4 space-y-3">
      <!-- Skill chips row -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="s in skillFilters"
          :key="s.key"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-selector text-xs font-semibold border transition-all exam-skill-chip"
          :class="activeSkill === s.key
            ? (s.key === 'all' ? 'bg-base-content text-base-100 border-base-content' : `bg-${s.key === 'all' ? 'base-content' : s.key}-soft text-${s.key === 'all' ? 'base-100' : s.key} border-transparent skill-active`)
            : 'bg-base-200 border-base-300 text-base-content/60 hover:bg-base-300'"
          :style="activeSkill === s.key && s.key !== 'all' ? { background: `color-mix(in oklab, var(--color-${s.colorVar}) 20%, transparent)` } : {}"
          @click="activeSkill = s.key"
        >
          <component :is="s.icon" v-if="s.icon" :size="12" />
          {{ s.label }}
          <span class="ml-0.5 opacity-60">{{ s.count }}</span>
        </button>

        <!-- Divider -->
        <div class="w-px h-4 bg-base-300 mx-1" />

        <!-- Status chips -->
        <button
          v-for="st in statusFilters"
          :key="st.key"
          class="px-3 py-1.5 rounded-selector text-xs font-medium border transition-all"
          :class="activeStatus === st.key
            ? 'bg-base-content text-base-100 border-base-content'
            : 'bg-base-200 border-base-300 text-base-content/60 hover:bg-base-300'"
          @click="activeStatus = st.key"
        >
          {{ st.label }}
        </button>
      </div>

      <!-- Search + sort + view toggle row -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1 max-w-xs">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            v-model="search"
            type="text"
            placeholder="Search exercises…"
            class="input input-sm input-bordered w-full pl-8 text-sm"
          >
        </div>
        <select v-model="sortBy" class="select select-sm select-bordered text-sm">
          <option value="default">Default order</option>
          <option value="level">Level</option>
          <option value="time">Estimated time</option>
          <option value="progress">Progress</option>
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
import { BookOpen, PencilLine, Headphones, Mic, Search, LayoutGrid, List, Clock, AlignLeft, ChevronRight, Trash2 } from 'lucide-vue-next'
import type { Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useReadingGeneration } from '~/composables/useReadingGeneration'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useTopicGeneration } from '~/composables/useTopicGeneration'
import { useListeningExercises } from '~/composables/useListeningExercises'
import { useSpeakingExercises } from '~/composables/useSpeakingExercises'
import { useProgress } from '~/composables/useProgress'
import { useSettingsStore } from '~/stores/settings'
import { getSkillMeta } from '~/utils/labels'
import ReadingGeneratorCard from '~/components/reading/ReadingGeneratorCard.vue'
import TopicGeneratorCard from '~/components/writing/TopicGeneratorCard.vue'

usePageMeta('Exercises', 'Browse and practice all exercise types')
useHead({ title: 'Exercises — Exam.one' })

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
const search = ref('')
const sortBy = ref('default')
const viewMode = ref<'grid' | 'list'>('grid')

// Read ?skill= query param on mount
onMounted(() => {
  const skillParam = route.query['skill'] as string
  if (skillParam && ['reading', 'writing', 'listening', 'speaking'].includes(skillParam)) {
    activeSkill.value = skillParam
  }
})

// Watch route query for sidebar clicks
watch(() => route.query['skill'], (val) => {
  if (val && typeof val === 'string') activeSkill.value = val
})

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

// Skill filter options
const skillFilters = computed(() => [
  { key: 'all', label: 'All', icon: null, count: allExercises.value.length, colorVar: 'base-content' },
  { key: 'reading', label: 'Reading', icon: BookOpen, count: allExercises.value.filter(e => e.skill === 'reading').length, colorVar: 'primary' },
  { key: 'writing', label: 'Writing', icon: PencilLine, count: allExercises.value.filter(e => e.skill === 'writing').length, colorVar: 'success' },
  { key: 'listening', label: 'Listening', icon: Headphones, count: allExercises.value.filter(e => e.skill === 'listening').length, colorVar: 'info' },
  { key: 'speaking', label: 'Speaking', icon: Mic, count: allExercises.value.filter(e => e.skill === 'speaking').length, colorVar: 'warning' }
])

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'Not started' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'mastered', label: 'Mastered' }
]

// Filtered + sorted list
const filtered = computed(() => {
  let list = allExercises.value

  if (activeSkill.value !== 'all') {
    list = list.filter(e => e.skill === activeSkill.value)
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
  search.value = ''
  sortBy.value = 'default'
}
</script>
