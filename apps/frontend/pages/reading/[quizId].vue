<template>
  <div class="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
    <!-- Page header -->
    <div v-if="text" class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-3 min-w-0">
        <button
          class="mt-1 w-9 h-9 rounded-full border border-base-300 hover:bg-base-200 grid place-items-center text-base-content/70 shrink-0"
          aria-label="Back to reading exercises"
          @click="goBack"
        >
          <ArrowLeft :size="14" />
        </button>
        <div class="min-w-0">
          <div
            class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-base-content/50 flex-wrap"
          >
            <BookOpen :size="11" />
            Reading practice · {{ textTypeLabel }}
          </div>
          <h1 class="font-display text-[28px] font-bold leading-tight mt-1 text-base-content">
            {{ text.title }}
          </h1>
          <div class="text-sm text-base-content/60 mt-1">
            {{ subtitle }}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        <span class="level-pip">{{ text.difficulty }}</span>
        <span v-if="text.testingPart" class="level-pip">Teil {{ text.testingPart }}</span>
      </div>
    </div>

    <!-- 2-col layout -->
    <div v-if="text" class="grid grid-cols-12 gap-6 items-start">
      <!-- Left: text card (sticky) -->
      <section
        class="col-span-12 lg:col-span-6 bg-base-100 border border-base-300/70 ring-soft rounded-box p-5 sm:p-7 lg:sticky lg:top-4"
      >
        <div class="flex items-center gap-2 text-base-content/70">
          <component :is="textTypeIcon" :size="14" />
          <div class="text-sm font-semibold">Text</div>
          <div class="ml-auto join">
            <button
              class="join-item btn btn-xs btn-ghost"
              :class="{ 'btn-active': isSpeaking }"
              :aria-label="isSpeaking ? 'Stop read aloud' : 'Read text aloud'"
              @click="toggleReadAloud"
            >
              <Volume2 :size="12" />
            </button>
            <button
              class="join-item btn btn-xs btn-ghost"
              :class="{ 'btn-active': fontSize === 'lg' }"
              aria-label="Toggle larger text"
              @click="toggleFontSize"
            >
              <Type :size="12" />
            </button>
            <button
              class="join-item btn btn-xs btn-ghost"
              :class="{ 'btn-active': selectedWord }"
              aria-label="Show selected word helper"
              @click="clearSelectedWord"
            >
              <Languages :size="12" />
            </button>
          </div>
        </div>
        <h2 class="font-display text-xl font-bold mt-3 text-base-content">{{ text.title }}</h2>
        <div class="flex flex-wrap gap-2 mt-3">
          <span
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
          >
            <Clock :size="11" />
            {{ text.estimatedReadingTime }} min read
          </span>
          <span
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
          >
            <AlignLeft :size="11" />
            {{ text.wordCount }} words
          </span>
          <span
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
          >
            <Sparkles :size="11" />
            {{ text.questions?.length || 0 }} questions
          </span>
        </div>
        <article
          class="mt-5 space-y-3 leading-[1.75] text-base-content/85 overflow-y-auto max-h-[calc(100vh-300px)] pr-1"
          :class="contentSizeClass"
        >
          <p v-for="(paragraph, paragraphIndex) in tokenizedContent" :key="paragraphIndex">
            <template
              v-for="(token, tokenIndex) in paragraph"
              :key="`${paragraphIndex}-${tokenIndex}`"
            >
              <span v-if="token.isSpace">{{ token.value }}</span>
              <button
                v-else
                type="button"
                class="rounded px-0.5 hover:bg-primary/15 focus:bg-primary/15 focus:outline-none focus:ring-1 focus:ring-primary"
                :class="
                  selectedWord === normalizeWord(token.value)
                    ? 'bg-primary/15 text-base-content'
                    : ''
                "
                :aria-label="`Show helper for ${token.value}`"
                @click="selectWord(token.value)"
              >
                {{ token.value }}
              </button>
            </template>
          </p>
        </article>
        <div
          v-if="selectedWord"
          class="mt-4 rounded-box border border-primary/20 bg-primary/10 p-3 text-sm"
        >
          <div class="font-semibold text-base-content">{{ selectedWord }}</div>
          <div class="text-base-content/70 mt-1">{{ selectedWordHelper }}</div>
        </div>
        <div
          class="mt-6 pt-4 border-t border-base-300/70 text-xs text-base-content/50 flex items-center justify-between gap-3 flex-wrap"
        >
          <span>Tap a word to see its offline helper</span>
          <button
            type="button"
            class="inline-flex items-center gap-1 hover:text-primary transition-colors"
            :class="isSaved ? 'text-primary' : ''"
            @click="toggleSaved"
          >
            <BookmarkCheck v-if="isSaved" :size="11" />
            <Bookmark v-else :size="11" />
            {{ isSaved ? 'Saved text' : 'Save text' }}
          </button>
        </div>
      </section>

      <!-- Right: Quiz session -->
      <QuizSession class="col-span-12 lg:col-span-6" :text="text" @finish="goBack" />
    </div>

    <div v-else class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center">
      <BookOpen :size="32" class="mx-auto text-base-content/20 mb-3" />
      <h1 class="font-display text-2xl font-bold">Reading exercise not found</h1>
      <p class="text-sm text-base-content/60 mt-2">
        Go back to the exercise list and choose another text.
      </p>
      <button class="btn btn-primary btn-sm mt-5" @click="goBack">Back to exercises</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlignLeft,
  ArrowLeft,
  Bell,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Clock,
  FileText,
  Languages,
  Mail,
  Megaphone,
  Newspaper,
  Sparkles,
  Type,
  Volume2,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { ReadingExercise } from '~/utils/exercises/reading'
import { useReadingTexts } from '~/composables/useReadingTexts'
import QuizSession from '~/components/reading/QuizSession.vue'

interface TextToken {
  value: string
  isSpace: boolean
}

const SAVED_TEXTS_KEY = 'exam-one:reading:saved-texts'

const route = useRoute()
const router = useRouter()
const { getTexts } = useReadingTexts()

const fontSize = ref<'base' | 'lg'>('base')
const selectedWord = ref('')
const isSpeaking = ref(false)
const isSaved = ref(false)

const quizId = computed(() => String(route.params['quizId'] || ''))
const text = computed<ReadingExercise | null>(
  () => getTexts().find(t => t.id === quizId.value) || null
)
const contentSizeClass = computed(() =>
  fontSize.value === 'lg' ? 'text-base sm:text-lg' : 'text-[15px]'
)
const textTypeLabel = computed(() => getTextTypeLabel(text.value?.textType || 'text'))
const subtitle = computed(() => {
  if (!text.value) return ''
  return `${textTypeLabel.value} · ${text.value.wordCount} words · ~${text.value.estimatedReadingTime} min read`
})
const textTypeIcon = computed<Component>(() => getTextTypeIcon(text.value?.textType || 'text'))
const tokenizedContent = computed<TextToken[][]>(() => {
  if (!text.value?.content) return []
  return text.value.content
    .split(/\n+/)
    .filter(paragraph => paragraph.trim().length > 0)
    .map(paragraph =>
      paragraph
        .split(/(\s+)/)
        .filter(Boolean)
        .map(token => ({
          value: token,
          isSpace: /^\s+$/.test(token),
        }))
    )
})
const selectedWordHelper = computed(() => {
  const word = selectedWord.value.toLowerCase()
  const dictionary: Record<string, string> = {
    bitte: 'please',
    danke: 'thank you',
    freund: 'friend',
    freundin: 'female friend',
    einladung: 'invitation',
    geburtstag: 'birthday',
    samstag: 'Saturday',
    sonntag: 'Sunday',
    adresse: 'address',
    termin: 'appointment',
    wohnung: 'apartment',
    arbeit: 'work',
    schule: 'school',
    zeit: 'time',
    essen: 'food / to eat',
    getränke: 'drinks',
    viele: 'many',
    grüße: 'greetings',
  }
  return (
    dictionary[word] ||
    'No bundled translation yet. Mark it and check it in your own vocabulary list.'
  )
})

function toggleFontSize() {
  fontSize.value = fontSize.value === 'lg' ? 'base' : 'lg'
}

function normalizeWord(value: string) {
  return value.toLowerCase().replace(/^[^\p{L}äöüÄÖÜß]+|[^\p{L}äöüÄÖÜß]+$/gu, '')
}

function selectWord(value: string) {
  const normalized = normalizeWord(value)
  if (normalized) selectedWord.value = normalized
}

function clearSelectedWord() {
  selectedWord.value = ''
}

function toggleReadAloud() {
  if (!import.meta.client || !text.value || !('speechSynthesis' in window)) return
  if (isSpeaking.value) {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
    return
  }
  const utterance = new SpeechSynthesisUtterance(text.value.content)
  utterance.lang = 'de-DE'
  utterance.onend = () => {
    isSpeaking.value = false
  }
  utterance.onerror = () => {
    isSpeaking.value = false
  }
  isSpeaking.value = true
  window.speechSynthesis.speak(utterance)
}

function getSavedTextIds() {
  if (!import.meta.client) return [] as string[]
  try {
    const raw = localStorage.getItem(SAVED_TEXTS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function toggleSaved() {
  if (!import.meta.client || !text.value) return
  try {
    const ids = new Set(getSavedTextIds())
    if (ids.has(text.value.id)) ids.delete(text.value.id)
    else ids.add(text.value.id)
    localStorage.setItem(SAVED_TEXTS_KEY, JSON.stringify([...ids]))
    isSaved.value = ids.has(text.value.id)
  } catch {
    isSaved.value = false
  }
}

function getTextTypeLabel(type: string) {
  const labels: Record<string, string> = {
    email: 'Personal email',
    notice: 'Information notice',
    article: 'Article',
    advertisement: 'Advertisement',
    instructions: 'Instructions',
    announcement: 'Announcement',
  }
  return labels[type] || type
}

function getTextTypeIcon(type: string): Component {
  const icons: Record<string, Component> = {
    email: Mail,
    notice: Bell,
    article: Newspaper,
    advertisement: Megaphone,
    instructions: FileText,
    announcement: Bell,
  }
  return icons[type] || BookOpen
}

usePageMeta('Reading Exercise', 'Reading')

watchEffect(() => {
  if (text.value) {
    usePageMeta(text.value.title, 'Reading')
  }
})

// Resolve from the API-backed store on the client; redirect only when the
// id is genuinely missing (catalogs hydrate after login, so defer to the client).
if (import.meta.client && !text.value) {
  navigateTo('/exercises?skill=reading', { replace: true })
}

onMounted(() => {
  isSaved.value = text.value ? getSavedTextIds().includes(text.value.id) : false
})

onBeforeUnmount(() => {
  if (import.meta.client && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
})

function goBack() {
  router.push('/exercises?skill=reading')
}

useHead({ title: computed(() => (text.value ? `${text.value.title} – Quiz` : 'Reading Quiz')) })

definePageMeta({ preload: false })
</script>
