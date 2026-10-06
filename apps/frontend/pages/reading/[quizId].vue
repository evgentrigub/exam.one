<template>
  <div class="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
    <ExerciseHeader
      v-if="text"
      skill="reading"
      :type="textTypeLabel"
      :title="text.title"
      :subtitle="subtitle"
      :level="text.difficulty"
      :part="text.testingPart"
      :back-label="$t('exercisesUi.skillPractice', { skill: $t('skill.reading') })"
      @back="goBack"
    />

    <!-- 2-col layout -->
    <div v-if="text" class="grid grid-cols-12 gap-6 items-start">
      <!-- Left: text card (sticky) -->
      <section
        class="col-span-12 lg:col-span-6 bg-base-100 border border-base-300/70 ring-soft rounded-box p-5 sm:p-7 lg:sticky lg:top-4"
      >
        <div class="flex items-center gap-2 text-base-content/70">
          <component :is="textTypeIcon" :size="14" />
          <div class="text-sm font-semibold">{{ $t('pages.reading.text') }}</div>
          <div class="ml-auto join">
            <button
              class="join-item btn btn-xs btn-ghost"
              :class="{ 'btn-active': isSpeaking }"
              :aria-label="isSpeaking ? $t('pages.reading.stopReadAloud') : $t('pages.reading.readAloud')"
              @click="toggleReadAloud"
            >
              <Volume2 :size="12" />
            </button>
            <button
              class="join-item btn btn-xs btn-ghost"
              :class="{ 'btn-active': fontSize === 'lg' }"
              :aria-label="$t('pages.reading.toggleLargerText')"
              @click="toggleFontSize"
            >
              <Type :size="12" />
            </button>
            <button
              v-if="hasWordHelper"
              class="join-item btn btn-xs btn-ghost"
              :class="{ 'btn-active': selectedWord }"
              :aria-label="$t('pages.reading.showWordHelper')"
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
            {{ $t('pages.reading.minRead', { minutes: text.estimatedReadingTime }) }}
          </span>
          <span
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
          >
            <AlignLeft :size="11" />
            {{ $t('mockExam.wordCountResult', { count: text.wordCount }) }}
          </span>
          <span
            class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70"
          >
            <Sparkles :size="11" />
            {{ $t('pages.common.questionCount', text.questions?.length || 0) }}
          </span>
        </div>
        <article
          v-if="isGapFill"
          class="mt-5 text-base-content/85 overflow-y-auto max-h-[calc(100vh-300px)] pr-1"
          :class="contentSizeClass"
        >
          <GapFillText
            :content="text.content"
            :questions="text.questions ?? []"
            :answers="gapState.answers"
            :revealed="gapState.revealed"
          />
        </article>
        <article
          v-else-if="!hasWordHelper"
          class="mt-5 space-y-3 leading-[1.75] text-base-content/85 overflow-y-auto max-h-[calc(100vh-300px)] pr-1"
          :class="contentSizeClass"
          :lang="pack.language"
        >
          <p v-for="(paragraph, paragraphIndex) in paragraphs" :key="paragraphIndex">
            {{ paragraph }}
          </p>
        </article>
        <article
          v-else
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
                :aria-label="$t('pages.reading.wordHelperFor', { word: token.value })"
                @click="selectWord(token.value)"
              >
                {{ token.value }}
              </button>
            </template>
          </p>
        </article>
        <div
          v-if="hasWordHelper && selectedWord"
          class="mt-4 rounded-box border border-primary/20 bg-primary/10 p-3 text-sm"
        >
          <div class="font-semibold text-base-content">{{ selectedWord }}</div>
          <div class="text-base-content/70 mt-1">{{ selectedWordHelper }}</div>
        </div>
        <div
          class="mt-6 pt-4 border-t border-base-300/70 text-xs text-base-content/50 flex items-center justify-between gap-3 flex-wrap"
        >
          <span v-if="hasWordHelper">{{ $t('pages.reading.tapWordHint') }}</span>
          <span v-else />
          <button
            type="button"
            class="inline-flex items-center gap-1 hover:text-primary transition-colors"
            :class="isSaved ? 'text-primary' : ''"
            @click="toggleSaved"
          >
            <BookmarkCheck v-if="isSaved" :size="11" />
            <Bookmark v-else :size="11" />
            {{ isSaved ? $t('pages.reading.savedText') : $t('pages.reading.saveText') }}
          </button>
        </div>
      </section>

      <!-- Right: Quiz session -->
      <QuizSession
        class="col-span-12 lg:col-span-6"
        :text="text"
        @finish="goBack"
        @gap-state="gapState = $event"
      />
    </div>

    <div v-else class="bg-base-100 border border-base-300 ring-soft rounded-box p-8 text-center">
      <BookOpen :size="32" class="mx-auto text-base-content/20 mb-3" />
      <h1 class="font-display text-2xl font-bold">{{ $t('pages.reading.notFoundTitle') }}</h1>
      <p class="text-sm text-base-content/60 mt-2">
        {{ $t('pages.reading.notFoundDescription') }}
      </p>
      <button class="btn btn-primary btn-sm mt-5" @click="goBack">{{ $t('pages.common.backToExercises') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlignLeft,
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
import GapFillText from '~/components/gapFill/GapFillText.vue'
import { stripGapMarkers, type ObjectiveAnswers } from '~/utils/gapFill'

interface TextToken {
  value: string
  isSpace: boolean
}

const SAVED_TEXTS_KEY = 'exam-one:reading:saved-texts'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { getTexts } = useReadingTexts()
const { pack, partsFor } = useActivePack()

/** Browser read-aloud voices by exam language. */
const SPEECH_LOCALES: Record<string, string> = { de: 'de-DE', en: 'en-GB', pl: 'pl-PL', es: 'es-ES' }

const fontSize = ref<'base' | 'lg'>('base')
const selectedWord = ref('')
const isSpeaking = ref(false)
const isSaved = ref(false)

const quizId = computed(() => String(route.params['quizId'] || ''))
const text = computed<ReadingExercise | null>(
  () => getTexts().find(item => item.id === quizId.value) || null
)
const isGapFill = computed(
  () =>
    partsFor('reading').find(part => part.n === text.value?.testingPart)?.itemFormat === 'gap-fill'
)
/** The tap-a-word helper only knows German words. */
const hasWordHelper = computed(() => pack.value.language === 'de' && !isGapFill.value)
const gapState = ref<{ answers: ObjectiveAnswers; revealed: boolean }>({ answers: {}, revealed: false })
const paragraphs = computed(() =>
  (text.value?.content ?? '').split(/\n+/).filter(paragraph => paragraph.trim().length > 0)
)
const contentSizeClass = computed(() =>
  fontSize.value === 'lg' ? 'text-base sm:text-lg' : 'text-[15px]'
)
const textTypeLabel = computed(() => getTextTypeLabel(text.value?.textType || 'text'))
const subtitle = computed(() => {
  if (!text.value) return ''
  return t('pages.reading.subtitle', {
    type: textTypeLabel.value,
    words: text.value.wordCount,
    minutes: text.value.estimatedReadingTime,
  })
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
  return dictionary[word] || t('pages.reading.noTranslation')
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
  const utterance = new SpeechSynthesisUtterance(stripGapMarkers(text.value.content))
  utterance.lang = SPEECH_LOCALES[pack.value.language] ?? pack.value.language
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
    email: t('pages.reading.textType.email'),
    notice: t('pages.reading.textType.notice'),
    article: t('exerciseType.article'),
    advertisement: t('exerciseType.advertisement'),
    instructions: t('exerciseType.instructions'),
    announcement: t('exerciseType.announcement'),
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

usePageMeta('pageMeta.readingExerciseTitle', 'skill.reading')

watchEffect(() => {
  if (text.value) {
    usePageMeta(text.value.title, 'skill.reading')
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

useHead({
  title: () =>
    text.value
      ? t('pages.reading.quizTabTitle', { title: text.value.title })
      : t('pages.reading.quizFallbackTitle'),
})

definePageMeta({ preload: false })
</script>
