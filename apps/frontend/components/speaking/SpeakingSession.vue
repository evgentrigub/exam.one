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
          <span class="level-pip">Teil {{ topic.testingPart }}</span>
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
          Useful phrases
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
              <p class="text-sm font-semibold">Speech-to-text</p>
              <span class="badge badge-sm" :class="healthStatusClass">
                {{ healthStatusLabel }}
              </span>
            </div>
            <p class="mt-1 text-xs text-base-content/55">
              {{ health?.detail || sttError || 'Checking the configured STT provider…' }}
            </p>
            <p class="mt-1 text-[11px] text-base-content/45">
              Using internal tool is optional. You can always use any whisper tools you would like.
              Just don't type as a simple writing exercise. Your goal is speaking practice.
            </p>
          </div>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle"
            title="Check STT again"
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
            <span class="text-sm">Transcribing your recording…</span>
          </div>

          <div
            v-if="transcriptionErrors[segment.key]"
            class="alert border border-warning/30 bg-warning/10 text-sm"
          >
            <AlertTriangle :size="16" class="shrink-0 text-warning" />
            <span>{{ transcriptionErrors[segment.key] }}</span>
          </div>

          <label class="form-control">
            <span class="label-text mb-2 text-xs font-semibold">Editable transcript</span>
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
          Add a transcript for {{ missingTranscriptLabel }} before saving.
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
            Save without AI
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
            {{ isReviewing ? 'Reviewing…' : examMode ? 'Submit for grading' : 'Review & save' }}
          </button>
        </div>
      </div>

      <div v-else class="overflow-hidden rounded-box border border-base-300 bg-base-100 ring-soft">
        <div class="border-b border-base-300 p-5">
          <div class="flex items-center gap-2">
            <CircleCheck :size="18" class="text-success" />
            <h3 class="text-sm font-semibold">Practice saved</h3>
          </div>
          <p class="mt-1 text-xs text-base-content/50">
            {{
              reviewData
                ? `AI review: ${reviewData.totalPoints}/${reviewData.maxPoints} direct points.`
                : 'Saved locally without AI review.'
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
            Practice again
          </button>
          <button class="btn btn-ghost flex-1" @click="emit('finish')">Back to exercises</button>
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
import { useProgress } from '~/composables/useProgress'
import { useSpeakingReview } from '~/composables/useSpeakingReview'
import { useSpeechTranscription } from '~/composables/useSpeechTranscription'
import type { SpeakingA2Topic, SpeakingTranscripts } from '~/utils/exercises/speaking'

type SegmentKey = 'answers' | 'questions' | 'monologue'

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
}

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

const transcripts = reactive<Record<SegmentKey, string>>({
  answers: props.initialTranscripts.answers ?? '',
  questions: props.initialTranscripts.questions ?? '',
  monologue: props.initialTranscripts.monologue ?? '',
})
const durations = reactive<Record<SegmentKey, number>>({
  answers: 0,
  questions: 0,
  monologue: 0,
})
const transcriptionErrors = reactive<Record<SegmentKey, string | null>>({
  answers: null,
  questions: null,
  monologue: null,
})
const transcribingPhase = ref<SegmentKey | null>(null)
const activeRecording = ref<SegmentKey | null>(null)
const submitted = ref(false)
const recordingEpoch = ref(0)

const { pack } = useActivePack()
const sessionTitle = computed(
  () =>
    speakingPart.value?.sessionTitle ??
    (props.topic.topicType === 'interview' ? 'Interview' : 'Monologue')
)
const speakingPart = computed(() =>
  pack.value.structure
    .find(module => module.id === 'speaking')
    ?.parts.find(part => part.n === props.topic.testingPart)
)
const isInterview = computed(
  () => speakingPart.value?.runtime?.segments?.some(segment => segment.id === 'answers') ?? false
)

const instruction = computed(
  () =>
    speakingPart.value?.instruction ??
    (isInterview.value
      ? 'First answer all four partner questions. Then make a second recording in which you ask all four questions.'
      : 'Talk about the topic using all four keywords. Aim for a few connected sentences.')
)

const promptGroups = computed(() => {
  const topic = props.topic
  if ('answerQuestions' in topic) {
    return [
      { label: 'Phase A · Questions to answer', items: [...topic.answerQuestions] },
      { label: 'Phase B · Questions to ask', items: [...topic.askQuestions] },
    ]
  }
  return [{ label: 'Keywords', items: [...topic.keywords] }]
})

const segments = computed<SessionSegment[]>(() => {
  if (isInterview.value) {
    return [
      {
        key: 'answers',
        title: 'Answer the four questions',
        description: 'Give short, complete answers in one recording.',
        placeholder: 'Type or edit the transcript of your answers…',
        maxSeconds: 90,
      },
      {
        key: 'questions',
        title: 'Ask the four questions',
        description: 'Read the questions naturally in a second recording.',
        placeholder: 'Type or edit the transcript of your questions…',
        maxSeconds: 90,
      },
    ]
  }
  return [
    {
      key: 'monologue',
      title: 'Record your monologue',
      description: 'Cover all four keywords in connected sentences.',
      placeholder: 'Type or edit the transcript of your monologue…',
      maxSeconds: 90,
    },
  ]
})

const usefulPhrases = computed(() => [...(speakingPart.value?.phrases ?? [])])

const requiredSegmentKeys = computed<SegmentKey[]>(() =>
  isInterview.value ? ['answers', 'questions'] : ['monologue']
)

watch(
  transcripts,
  () => {
    if (!props.examMode) return
    emit('progress', {
      transcripts: attemptTranscripts(),
      durationSec: requiredSegmentKeys.value.reduce((sum, key) => sum + durations[key], 0),
    })
  },
  { deep: true }
)
const canSubmit = computed(() =>
  requiredSegmentKeys.value.every(key => transcripts[key].trim().length > 0)
)
const missingTranscriptLabel = computed(() => {
  const missing = requiredSegmentKeys.value.filter(key => !transcripts[key].trim())
  const labels: Record<SegmentKey, string> = {
    answers: 'the answers',
    questions: 'the questions',
    monologue: 'the monologue',
  }
  return missing.map(key => labels[key]).join(' and ')
})
const healthStatusLabel = computed(() => {
  if (checkingHealth.value) return 'Checking'
  if (!health.value) return 'Unavailable'
  return health.value.ready ? 'Ready' : 'Offline'
})
const healthStatusClass = computed(() => {
  if (checkingHealth.value) return 'badge-ghost'
  return health.value?.ready ? 'badge-success' : 'badge-warning'
})
const recordingDisabledReason = computed(() => {
  if (checkingHealth.value) return 'Checking speech-to-text availability…'
  if (!health.value?.ready) return 'Recording requires an available speech-to-text tool.'
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
    transcriptionErrors[key] = 'No audio was captured. Enter the transcript manually or re-record.'
    return
  }

  const transcriptBeforeRequest = transcripts[key]
  transcribingPhase.value = key
  const result = await transcribe(payload.blob)
  transcribingPhase.value = null

  if (result) {
    if (!transcripts[key].trim() || transcripts[key] === transcriptBeforeRequest) {
      transcripts[key] = result
    }
  } else {
    transcriptionErrors[key] =
      sttError.value || 'Transcription failed. Enter the transcript manually.'
  }
}

function attemptTranscripts(): SpeakingTranscripts {
  if (isInterview.value) {
    return {
      answers: transcripts.answers.trim(),
      questions: transcripts.questions.trim(),
    }
  }
  return { monologue: transcripts.monologue.trim() }
}

function combinedTranscript(): string {
  if (isInterview.value) {
    return `Antworten:\n${transcripts.answers.trim()}\n\nFragen:\n${transcripts.questions.trim()}`
  }
  return transcripts.monologue.trim()
}

function saveAttempt(withReview = false): void {
  if (props.examMode) {
    submitted.value = true
    emit('examComplete', {
      transcripts: attemptTranscripts(),
      durationSec: requiredSegmentKeys.value.reduce((sum, key) => sum + durations[key], 0),
    })
    return
  }
  saveSpeakingAttempt(props.topic.id, {
    durationSec: requiredSegmentKeys.value.reduce((sum, key) => sum + durations[key], 0),
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
