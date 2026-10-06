<template>
  <div class="grid items-start gap-5 lg:grid-cols-2">
    <div class="space-y-4 lg:sticky lg:top-4">
      <div class="rounded-box border border-base-300 bg-base-100 p-5 ring-soft">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-selector bg-warning/15 px-2 py-1 text-xs font-semibold text-warning"
          >
            <Mic :size="12" />
            {{ sessionTitle }}
          </span>
          <span class="level-pip">{{ t('exercisesUi.part') }} {{ topic.testingPart }}</span>
        </div>
        <h2 class="mb-2 text-lg font-semibold">{{ topic.theme }}</h2>
        <p class="text-sm text-base-content/60">{{ instruction }}</p>
      </div>

      <div
        v-for="group in promptGroups"
        :key="group.label"
        class="rounded-box border border-base-300 bg-base-100 p-5 ring-soft"
      >
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-base-content/50">
          {{ group.label }}
        </p>
        <ol class="space-y-2">
          <li
            v-for="(item, index) in group.items"
            :key="item"
            class="flex gap-3 rounded-field border border-base-300 bg-base-200/50 px-3 py-2.5 text-sm"
          >
            <span class="font-mono text-xs text-base-content/40">{{ index + 1 }}</span>
            <span>{{ item }}</span>
          </li>
        </ol>
      </div>

      <div v-if="!examMode" class="rounded-box border border-base-300 bg-base-100 p-5 ring-soft">
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-base-content/50">
          {{ t('speaking.session.usefulPhrases') }}
        </p>
        <ul class="space-y-1.5">
          <li v-for="phrase in usefulPhrases" :key="phrase" class="flex items-start gap-2 text-sm">
            <Quote :size="13" class="mt-1 shrink-0 text-warning" />
            <span>{{ phrase }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="space-y-4">
      <div class="rounded-box border border-base-300 bg-base-100 p-4 ring-soft">
        <div class="flex items-start gap-3">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-field bg-base-200">
            <Cloud v-if="health?.provider === 'openai'" :size="16" />
            <Server v-else :size="16" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-semibold">{{ t('speaking.session.stt') }}</p>
              <span class="badge badge-sm" :class="healthStatusClass">
                {{ healthStatusLabel }}
              </span>
            </div>
            <p class="mt-1 text-xs text-base-content/55">
              {{ health?.detail || sttError || t('speaking.session.checkingProvider') }}
            </p>
            <p class="mt-1 text-[11px] text-base-content/45">
              {{ t('speaking.session.sttHint') }}
            </p>
          </div>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle"
            :title="t('speaking.session.checkAgain')"
            :disabled="checkingHealth"
            @click="refreshHealth"
          >
            <RefreshCcw :size="13" :class="{ 'animate-spin': checkingHealth }" />
          </button>
        </div>
      </div>

      <div
        v-for="(segment, index) in segments"
        :key="`${segment.key}-${recordingEpoch}`"
        class="overflow-hidden rounded-box border border-base-300 bg-base-100 ring-soft"
      >
        <div class="border-b border-base-300 bg-base-200/40 px-5 py-4">
          <div class="flex items-center gap-2">
            <span
              class="grid h-7 w-7 place-items-center rounded-field bg-warning/15 text-xs font-bold text-warning"
            >
              {{ index + 1 }}
            </span>
            <div>
              <h3 class="text-sm font-semibold">{{ segment.title }}</h3>
              <p class="text-xs text-base-content/50">{{ segment.description }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-4 p-5">
          <SpeakingCard v-if="segment.card" :card="segment.card" />
          <SpeakingRecorder
            :max-seconds="segment.maxSeconds"
            :disabled="recorderDisabled(segment.key)"
            :disabled-reason="recordingDisabledReason"
            @recording-change="isRecording => onRecordingChange(segment.key, isRecording)"
            @done="payload => onRecorded(segment.key, payload)"
          />

          <div
            v-if="transcribingPhase === segment.key"
            class="alert border border-info/30 bg-info/10 text-info"
          >
            <span class="loading loading-spinner loading-sm" />
            <span class="text-sm">{{ t('speaking.session.transcribing') }}</span>
          </div>

          <div
            v-if="transcriptionErrors[segment.key]"
            class="alert border border-warning/30 bg-warning/10 text-sm"
          >
            <AlertTriangle :size="16" class="shrink-0 text-warning" />
            <span>{{ transcriptionErrors[segment.key] }}</span>
          </div>

          <label class="form-control">
            <span class="label-text mb-2 text-xs font-semibold">{{
              t('speaking.session.editableTranscript')
            }}</span>
            <textarea
              v-model="transcripts[segment.key]"
              class="textarea textarea-bordered min-h-32 w-full leading-relaxed"
              :placeholder="segment.placeholder"
            />
          </label>
        </div>
      </div>

      <div
        v-if="reviewError && !submitted"
        class="alert border border-error/30 bg-error/10 text-sm"
      >
        <AlertTriangle :size="16" class="shrink-0 text-error" />
        <span>{{ reviewError }}</span>
      </div>

      <div v-if="!submitted" class="rounded-box border border-base-300 bg-base-100 p-4 ring-soft">
        <p v-if="!canSubmit" class="mb-3 text-xs text-base-content/50">
          {{ t('speaking.session.missingTranscript', { items: missingTranscriptLabel }) }}
        </p>
        <div class="flex flex-col gap-2 sm:flex-row">
          <button
            v-if="!examMode"
            type="button"
            class="btn btn-outline flex-1 gap-2"
            :disabled="
              !canSubmit || isReviewing || transcribingPhase !== null || activeRecording !== null
            "
            @click="saveWithoutReview"
          >
            <Save :size="15" />
            {{ t('speaking.session.saveWithoutAi') }}
          </button>
          <button
            type="button"
            class="btn btn-warning flex-1 gap-2 text-warning-content"
            :disabled="
              !canSubmit || isReviewing || transcribingPhase !== null || activeRecording !== null
            "
            @click="reviewAndSave"
          >
            <span v-if="isReviewing" class="loading loading-spinner loading-sm" />
            <Sparkles v-else :size="15" />
            {{
              isReviewing
                ? t('speaking.session.reviewing')
                : examMode
                  ? t('speaking.session.submitForGrading')
                  : t('speaking.session.reviewAndSave')
            }}
          </button>
        </div>
      </div>

      <div v-else class="overflow-hidden rounded-box border border-base-300 bg-base-100 ring-soft">
        <div class="border-b border-base-300 p-5">
          <div class="flex items-center gap-2">
            <CircleCheck :size="18" class="text-success" />
            <h3 class="text-sm font-semibold">{{ t('speaking.session.saved') }}</h3>
          </div>
          <p class="mt-1 text-xs text-base-content/50">
            {{
              reviewData
                ? t('speaking.session.aiReviewResult', {
                    points: reviewData.totalPoints,
                    max: reviewData.maxPoints,
                  })
                : t('speaking.session.savedLocally')
            }}
          </p>
        </div>

        <template v-if="reviewData">
          <div class="border-t border-base-300 p-4">
            <SpeakingReviewDetails :review="reviewData" />
          </div>
        </template>

        <div class="flex gap-3 border-t border-base-300 p-4">
          <button class="btn btn-warning flex-1 text-warning-content" @click="retry">
            {{ t('speaking.session.practiceAgain') }}
          </button>
          <button class="btn btn-ghost flex-1" @click="emit('finish')">
            {{ t('quiz.backToExercises') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  CircleCheck,
  Cloud,
  Mic,
  Quote,
  RefreshCcw,
  Save,
  Server,
  Sparkles,
} from 'lucide-vue-next'
import SpeakingRecorder from '~/components/speaking/SpeakingRecorder.vue'
import SpeakingReviewDetails from '~/components/speaking/SpeakingReviewDetails.vue'
import SpeakingCard from '~/components/speaking/SpeakingCard.vue'
import { useProgress } from '~/composables/useProgress'
import { useSpeakingReview } from '~/composables/useSpeakingReview'
import { useSpeechTranscription } from '~/composables/useSpeechTranscription'
import type { SpeakingCard as Card } from '@exam-one/exam-packs'
import type { SpeakingA2Topic, SpeakingTranscripts } from '~/utils/exercises/speaking'

/** `answers` / `questions` / `monologue` for the A2 layouts; a card exchange uses its own ids. */
type SegmentKey = string

interface RecordingPayload {
  durationSec: number
  audioUrl: string | null
  blob: Blob | null
}

interface SessionSegment {
  key: SegmentKey
  title: string
  description: string
  placeholder: string
  maxSeconds: number
  /** Card exchanges only: the card this recording answers. */
  card?: Card
}

/** A card turn is one short utterance, so it gets a shorter recording than a monologue. */
const CARD_TURN_SECONDS = 45

const props = withDefaults(
  defineProps<{
    topic: SpeakingA2Topic
    examMode?: boolean
    initialTranscripts?: SpeakingTranscripts
  }>(),
  {
    examMode: false,
    initialTranscripts: () => ({}),
  }
)
const emit = defineEmits<{
  finish: []
  progress: [payload: { transcripts: SpeakingTranscripts; durationSec: number }]
  examComplete: [payload: { transcripts: SpeakingTranscripts; durationSec: number }]
}>()

const { saveSpeakingAttempt } = useProgress()
const {
  health,
  checkingHealth,
  error: sttError,
  refreshHealth,
  transcribe,
} = useSpeechTranscription()
const {
  review: reviewData,
  error: reviewError,
  isReviewing,
  requestReview,
  clearReview,
} = useSpeakingReview()

const { pack } = useActivePack()
const { t } = useI18n()
const speakingPart = computed(() =>
  pack.value.structure
    .find(module => module.id === 'speaking')
    ?.parts.find(part => part.n === props.topic.testingPart)
)

/** Every segment this session can record: the A2 keys plus the part's own configured ids. */
const segmentIds = [
  ...new Set([
    'answers',
    'questions',
    'monologue',
    ...(speakingPart.value?.runtime?.segments ?? []).map(segment => segment.id),
  ]),
]
const transcripts = reactive<Record<SegmentKey, string>>(
  Object.fromEntries(segmentIds.map(id => [id, props.initialTranscripts[id] ?? '']))
)
const durations = reactive<Record<SegmentKey, number>>(
  Object.fromEntries(segmentIds.map(id => [id, 0]))
)
const transcriptionErrors = reactive<Record<SegmentKey, string | null>>(
  Object.fromEntries(segmentIds.map(id => [id, null]))
)
/** A segment's transcript, trimmed; empty for a segment this session never recorded. */
function text(key: SegmentKey): string {
  return (transcripts[key] ?? '').trim()
}

const transcribingPhase = ref<SegmentKey | null>(null)
const activeRecording = ref<SegmentKey | null>(null)
const submitted = ref(false)
const recordingEpoch = ref(0)

const sessionTitle = computed(
  () =>
    speakingPart.value?.sessionTitle ??
    (props.topic.topicType === 'interview'
      ? t('exerciseType.interview')
      : t('exerciseType.monologue'))
)
/** A word-card or request-card exchange: one recording per card, cards shown inline. */
const isCardExchange = computed(() => {
  const layout = speakingPart.value?.layout
  return layout === 'word-cards' || layout === 'request-cards'
})
const isInterview = computed(
  () => speakingPart.value?.runtime?.segments?.some(segment => segment.id === 'answers') ?? false
)

const instruction = computed(
  () =>
    speakingPart.value?.instruction ??
    (isInterview.value
      ? t('speaking.session.instructionInterview')
      : t('speaking.session.instructionMonologue'))
)

const promptGroups = computed(() => {
  const topic = props.topic
  // Cards are drawn beside the recording they belong to, not listed here.
  if (isCardExchange.value || 'cards' in topic) return []
  if ('answerQuestions' in topic) {
    return [
      { label: t('speaking.session.phaseA'), items: [...topic.answerQuestions] },
      { label: t('speaking.session.phaseB'), items: [...topic.askQuestions] },
    ]
  }
  return [{ label: t('speaking.session.keywords'), items: [...topic.keywords] }]
})

/** One recording per configured segment, each with its card and a round number per kind. */
function cardSegments(): SessionSegment[] {
  const cards = 'cards' in props.topic ? props.topic.cards : []
  const rounds: Record<string, number> = {}
  return (speakingPart.value?.runtime?.segments ?? []).flatMap(segment => {
    const card = cards.find(item => item.segment === segment.id)
    if (!card) return []
    const round = (rounds[card.kind] = (rounds[card.kind] ?? 0) + 1)
    // An examiner question reads as one, not as a partner's line.
    const copy = card.speaker === 'examiner' ? 'examiner' : card.kind
    return [
      {
        key: segment.id,
        title: t(`speaking.cards.${copy}.title`, { round }),
        description: t(`speaking.cards.${copy}.description`),
        placeholder: t('speaking.cards.placeholder'),
        maxSeconds: CARD_TURN_SECONDS,
        card,
      },
    ]
  })
}

const segments = computed<SessionSegment[]>(() => {
  if (isCardExchange.value) return cardSegments()
  if (isInterview.value) {
    return [
      {
        key: 'answers',
        title: t('speaking.session.answers.title'),
        description: t('speaking.session.answers.description'),
        placeholder: t('speaking.session.answers.placeholder'),
        maxSeconds: 90,
      },
      {
        key: 'questions',
        title: t('speaking.session.questions.title'),
        description: t('speaking.session.questions.description'),
        placeholder: t('speaking.session.questions.placeholder'),
        maxSeconds: 90,
      },
    ]
  }
  return [
    {
      key: 'monologue',
      title: t('speaking.session.monologue.title'),
      description: monologueDescription.value,
      placeholder: t('speaking.session.monologue.placeholder'),
      maxSeconds: 90,
    },
  ]
})

/** A2 always shows four keywords and says so in words; other counts are shown as digits. */
const monologueDescription = computed(() => {
  const count = 'keywords' in props.topic ? props.topic.keywords.length : 4
  return count === 4
    ? t('speaking.session.monologue.descriptionFour')
    : t('speaking.session.monologue.description', { count })
})

const usefulPhrases = computed(() => [...(speakingPart.value?.phrases ?? [])])

const requiredSegmentKeys = computed<SegmentKey[]>(() => segments.value.map(segment => segment.key))

watch(
  transcripts,
  () => {
    if (!props.examMode) return
    emit('progress', {
      transcripts: attemptTranscripts(),
      durationSec: requiredSegmentKeys.value.reduce((sum, key) => sum + (durations[key] ?? 0), 0),
    })
  },
  { deep: true }
)
const canSubmit = computed(() =>
  requiredSegmentKeys.value.every(key => (transcripts[key] ?? '').trim().length > 0)
)
const missingTranscriptLabel = computed(() => {
  const missing = requiredSegmentKeys.value.filter(key => !transcripts[key]?.trim())
  const labels: Record<SegmentKey, string> = {
    answers: t('speaking.session.missing.answers'),
    questions: t('speaking.session.missing.questions'),
    monologue: t('speaking.session.missing.monologue'),
  }
  const titles = Object.fromEntries(segments.value.map(segment => [segment.key, segment.title]))
  return missing.map(key => labels[key] ?? titles[key] ?? key).join(t('speaking.session.missing.and'))
})
const healthStatusLabel = computed(() => {
  if (checkingHealth.value) return t('mockExam.checking')
  if (!health.value) return t('mockExam.unavailable')
  return health.value.ready ? t('mockExam.ready') : t('speaking.session.offline')
})
const healthStatusClass = computed(() => {
  if (checkingHealth.value) return 'badge-ghost'
  return health.value?.ready ? 'badge-success' : 'badge-warning'
})
const recordingDisabledReason = computed(() => {
  if (checkingHealth.value) return t('speaking.session.checkingAvailability')
  if (!health.value?.ready) return t('speaking.session.requiresStt')
  return ''
})

function recorderDisabled(key: SegmentKey): boolean {
  return (
    !health.value?.ready ||
    submitted.value ||
    isReviewing.value ||
    transcribingPhase.value !== null ||
    (activeRecording.value !== null && activeRecording.value !== key)
  )
}

function onRecordingChange(key: SegmentKey, isRecording: boolean): void {
  if (isRecording) {
    activeRecording.value = key
  } else if (activeRecording.value === key) {
    activeRecording.value = null
  }
}

async function onRecorded(key: SegmentKey, payload: RecordingPayload): Promise<void> {
  durations[key] = payload.durationSec
  transcriptionErrors[key] = null
  if (!payload.blob) {
    transcriptionErrors[key] = t('speaking.session.noAudio')
    return
  }

  const transcriptBeforeRequest = transcripts[key]
  transcribingPhase.value = key
  const result = await transcribe(payload.blob)
  transcribingPhase.value = null

  if (result) {
    if (!text(key) || transcripts[key] === transcriptBeforeRequest) {
      transcripts[key] = result
    }
  } else {
    transcriptionErrors[key] =
      sttError.value || t('speaking.session.transcriptionFailed')
  }
}

function attemptTranscripts(): SpeakingTranscripts {
  if (isCardExchange.value) {
    return Object.fromEntries(requiredSegmentKeys.value.map(key => [key, (transcripts[key] ?? '').trim()]))
  }
  if (isInterview.value) {
    return {
      answers: text('answers'),
      questions: text('questions'),
    }
  }
  return { monologue: text('monologue') }
}

function combinedTranscript(): string {
  if (isCardExchange.value) {
    return segments.value
      .map(segment => `${segment.title}:\n${(transcripts[segment.key] ?? '').trim()}`)
      .join('\n\n')
  }
  if (isInterview.value) {
    return `Antworten:\n${text('answers')}\n\nFragen:\n${text('questions')}`
  }
  return text('monologue')
}

function saveAttempt(withReview = false): void {
  if (props.examMode) {
    submitted.value = true
    emit('examComplete', {
      transcripts: attemptTranscripts(),
      durationSec: requiredSegmentKeys.value.reduce((sum, key) => sum + (durations[key] ?? 0), 0),
    })
    return
  }
  saveSpeakingAttempt(props.topic.id, {
    durationSec: requiredSegmentKeys.value.reduce((sum, key) => sum + (durations[key] ?? 0), 0),
    transcript: combinedTranscript(),
    transcripts: attemptTranscripts(),
    ...(withReview && reviewData.value ? { review: reviewData.value } : {}),
  })
  submitted.value = true
}

function saveWithoutReview(): void {
  if (!canSubmit.value || transcribingPhase.value !== null || activeRecording.value !== null) return
  clearReview()
  saveAttempt(false)
}

async function reviewAndSave(): Promise<void> {
  if (!canSubmit.value || transcribingPhase.value !== null || activeRecording.value !== null) return
  if (props.examMode) {
    clearReview()
    saveAttempt(false)
    return
  }
  const result = await requestReview(props.topic, attemptTranscripts())
  if (result) saveAttempt(true)
}

function retry(): void {
  for (const key of requiredSegmentKeys.value) {
    transcripts[key] = ''
    durations[key] = 0
    transcriptionErrors[key] = null
  }
  transcribingPhase.value = null
  activeRecording.value = null
  submitted.value = false
  recordingEpoch.value += 1
  clearReview()
}
</script>
