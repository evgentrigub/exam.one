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
          <component :is="s.icon" :size="12" v-if="s.icon" />
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
          />
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
            <span class="level-pip">{{ ex.difficulty }}</span>
          </div>
          <p class="text-sm font-semibold mb-1 line-clamp-2">{{ ex.title }}</p>
          <p class="text-xs text-base-content/50 capitalize mb-3">{{ ex.skill }} · {{ ex.type }}</p>

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
            <progress class="progress flex-1 h-1.5" :class="`progress-${ex.skill === 'reading' ? 'primary' : 'success'}`" :value="ex.pct" max="100" />
            <span class="text-xs font-mono text-base-content/40 w-8 text-right">{{ ex.pct }}%</span>
            <span
              class="text-[10px] font-semibold px-1.5 py-0.5 rounded-selector"
              :class="statusClass(ex.status)"
            >{{ statusLabel(ex.status) }}</span>
          </div>
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
              <td class="py-3 text-xs text-base-content/60 capitalize">{{ ex.type }}</td>
              <td class="py-3"><span class="level-pip">{{ ex.difficulty }}</span></td>
              <td class="py-3 text-xs text-base-content/60">{{ ex.minutes }} min</td>
              <td class="py-3">
                <div class="flex items-center gap-2 w-28">
                  <progress class="progress flex-1 h-1" :class="`progress-${ex.skill === 'reading' ? 'primary' : 'success'}`" :value="ex.pct" max="100" />
                  <span class="text-xs font-mono text-base-content/40">{{ ex.pct }}%</span>
                </div>
              </td>
              <td class="py-3 pr-5">
                <button class="btn btn-xs btn-ghost gap-1 opacity-60 hover:opacity-100">
                  Start <ChevronRight :size="12" />
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
import { BookOpen, PenLine, Headphones, Mic, Search, LayoutGrid, List, Clock, AlignLeft, ChevronRight } from 'lucide-vue-next'
import type { Component } from 'vue'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useProgress } from '~/composables/useProgress'

usePageMeta('Exercises', 'Browse and practice all exercise types')
useHead({ title: 'Exercises — Examl.one' })

const route = useRoute()
const router = useRouter()

const { getTexts } = useReadingTexts()
const { getTopics } = useWritingTopics()
const { getProgressStats, isTextCompleted, isWritingTopicCompleted } = useProgress()

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
}

const allExercises = computed<UnifiedExercise[]>(() => {
  const rStats = getProgressStats()
  const readingList = getTexts().map(t => {
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
      status: completed ? 'mastered' : pct > 0 ? 'inprogress' : 'new'
    } as UnifiedExercise
  })

  const writingList = getTopics().map(t => {
    const completed = isWritingTopicCompleted(t.id)
    return {
      id: t.id,
      skill: 'writing',
      title: t.title,
      type: t.topicType,
      difficulty: t.difficulty,
      minutes: t.estimatedTime,
      pct: completed ? 100 : 0,
      status: completed ? 'mastered' : 'new'
    } as UnifiedExercise
  })

  return [...readingList, ...writingList]
})

// Skill filter options
const skillFilters = computed(() => [
  { key: 'all', label: 'All', icon: null, count: allExercises.value.length, colorVar: 'base-content' },
  { key: 'reading', label: 'Reading', icon: BookOpen, count: allExercises.value.filter(e => e.skill === 'reading').length, colorVar: 'primary' },
  { key: 'writing', label: 'Writing', icon: PenLine, count: allExercises.value.filter(e => e.skill === 'writing').length, colorVar: 'success' },
  { key: 'listening', label: 'Listening', icon: Headphones, count: 0, colorVar: 'info' },
  { key: 'speaking', label: 'Speaking', icon: Mic, count: 0, colorVar: 'warning' }
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
  const map: Record<string, Component> = { reading: BookOpen, writing: PenLine, listening: Headphones, speaking: Mic }
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
  else if (ex.skill === 'writing') router.push(`/writing/${ex.id}/exam`)
}

function resetFilters() {
  activeSkill.value = 'all'
  activeStatus.value = 'all'
  search.value = ''
  sortBy.value = 'default'
}
</script>
