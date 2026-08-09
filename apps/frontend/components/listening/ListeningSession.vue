<template>
  <div class="grid grid-cols-12 gap-6">
    <!-- LEFT SIDEBAR -->
    <div class="col-span-12 lg:col-span-4 space-y-5">
      <!-- Audio readiness (missing only — hide when files are available) -->
      <div
        v-if="checkedAvailability && anyMissing"
        class="bg-base-100 rounded-box border border-base-300/70 px-4 py-3 flex items-start gap-3"
      >
        <div
          class="w-8 h-8 rounded-full shrink-0 grid place-items-center bg-warning/15 text-warning"
          title="Audio not generated"
        >
          <AlertCircle :size="16" />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-base-content/80">Audio not generated</p>
          <p class="text-[11px] text-base-content/50 mt-0.5 leading-snug">
            {{ audioStatusDetail }}
          </p>
        </div>
      </div>

      <!-- Missing audio banner -->
      <div
        v-if="checkedAvailability && anyMissing"
        class="alert alert-warning text-sm shadow-none"
      >
        <div class="space-y-2 w-full">
          <p class="font-semibold">Listening audio files are missing</p>
          <p class="text-xs opacity-80">
            {{ missingCount }} of {{ expectedCount }} audio file(s) not found.
          </p>
          <button
            type="button"
            class="btn btn-sm btn-warning"
            :disabled="!isTtsReady || isGeneratingAudio"
            @click="generateAudioForExercise"
          >
            <span v-if="isGeneratingAudio" class="loading loading-spinner loading-xs" />
            {{ generateButtonLabel }}
          </button>
          <p v-if="generateError" class="text-xs text-error">{{ generateError }}</p>
          <p v-else-if="!isTtsReady" class="text-xs opacity-70">
            Generate audio is disabled while TTS is offline.
          </p>
        </div>
      </div>

      <!-- Practice timer (the mock shell owns the module timer in exam mode) -->
      <div v-if="!examMode" class="bg-base-100 rounded-box border border-base-300/70 p-5">
        <div class="text-xs font-semibold text-base-content/70 text-center">Time Remaining</div>
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-3">
          <div class="p-3 rounded-box bg-base-200/60 text-center">
            <div class="font-display text-4xl font-bold tabular-nums">{{ timerMM }}</div>
            <div class="text-[11px] text-base-content/60 mt-1">Minutes</div>
          </div>
          <div class="text-base-content/40 text-2xl font-display leading-none">:</div>
          <div class="p-3 rounded-box bg-base-200/60 text-center">
            <div class="font-display text-4xl font-bold tabular-nums">{{ timerSS }}</div>
            <div class="text-[11px] text-base-content/60 mt-1">Seconds</div>
          </div>
        </div>
      </div>

      <!-- Shared audio (Teil 2 + 4) — play/scrubber only; volume lives under timer -->
      <AudioPlayer
        v-if="model.mode === 'shared'"
        :key="`shared-${sessionKey}`"
        :transcript="model.sharedTranscript || ''"
        :label="currentExercise.title"
        :src="sharedAudioSrc"
        :reveal-transcript="isFinished && !examMode"
        :max-plays="examMode ? replayLimit : null"
        :disable-seeking="examMode ?? false"
        hide-volume-speed
        :volume="volume"
        :speed="speed"
        :disabled="interactionLocked"
        player-id="shared"
        :active-player-id="activePlayerId"
        @play="onPlayerPlay"
        @pause="onPlayerPause"
        @audio-unavailable="onAudioUnavailable"
      />

      <!-- Shared volume + speed (all Teile) -->
      <div
        class="bg-base-100 rounded-box border border-base-300/70 p-5"
        :class="{ 'opacity-50 pointer-events-none': interactionLocked }"
      >
        <div class="text-xs font-semibold text-base-content/70 mb-3">Playback</div>
        <div class="flex items-center gap-3">
          <Volume2 :size="14" class="text-base-content/50 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            class="flex-1 accent-info min-w-0"
            :disabled="interactionLocked"
            @input="setVolume(Number(($event.target as HTMLInputElement).value))"
          >
        </div>
        <div class="join mt-3 w-full">
          <button
            v-for="s in speeds"
            :key="s"
            type="button"
            class="join-item btn btn-xs flex-1"
            :class="speed === s ? 'btn-info text-info-content' : 'btn-ghost'"
            :disabled="interactionLocked"
            @click="setSpeed(s)"
          >
            {{ s }}x
          </button>
        </div>
        <p v-if="interactionLocked" class="text-[11px] text-base-content/50 mt-2">
          Playback unlocks when audio files are available.
        </p>
      </div>

      <!-- Instructions -->
      <div class="bg-base-100 rounded-box border border-base-300/70 p-5">
        <div class="flex items-center gap-2 text-sm font-semibold text-base-content/80">
          <Info :size="13" /> Instructions
        </div>
        <ul class="mt-3 text-xs text-base-content/70 space-y-1.5">
          <li class="flex gap-2"><Dot :size="12" />{{ instructions }}</li>
          <li class="flex gap-2"><Dot :size="12" />Transcript unlocks after submit.</li>
        </ul>
      </div>
    </div>

    <!-- RIGHT CONTENT -->
    <div class="col-span-12 lg:col-span-8">
      <div class="bg-base-100 rounded-box border border-base-300/70 p-7">
        <div
          v-if="isFinished && !examMode"
          class="mb-6 p-4 rounded-box border flex items-center gap-3"
          :class="percentage >= 50 ? 'bg-success/5 border-success/30' : 'bg-error/5 border-error/30'"
        >
          <Trophy :size="16" :class="percentage >= 50 ? 'text-success' : 'text-error'" />
          <div class="text-sm">
            You scored <strong class="font-mono">{{ score }}/{{ model.questions.length }}</strong> · {{ percentage }}%
            <span class="text-base-content/60 ml-1">{{ scoreMessage }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <h2 class="font-display text-2xl font-bold">Questions</h2>
          <span class="ml-auto text-xs text-base-content/60">
            {{ answeredCount }} of {{ model.questions.length }} answered
          </span>
        </div>
        <p class="text-sm text-base-content/60 mt-1">Listen to the audio and answer the questions below.</p>

        <div class="mt-6 space-y-7" :class="{ 'opacity-60': interactionLocked && !isFinished }">
          <div v-for="(q, i) in model.questions" :key="q.id">
            <AudioPlayer
              v-if="model.mode === 'peritem' && q.transcript"
              :key="`${q.id}-${sessionKey}`"
              class="mb-3"
              :transcript="q.transcript"
              :label="`Audio ${i + 1}`"
              :src="itemAudioSrc(q.id)"
              :reveal-transcript="isFinished && !examMode"
              :max-plays="examMode ? replayLimit : null"
              :disable-seeking="examMode ?? false"
              hide-volume-speed
              :volume="volume"
              :speed="speed"
              :disabled="interactionLocked"
              :player-id="q.id"
              :active-player-id="activePlayerId"
              @play="onPlayerPlay"
              @pause="onPlayerPause"
              @audio-unavailable="onAudioUnavailable"
            />

            <div class="flex items-baseline gap-2 mb-3">
              <span class="font-mono text-sm font-semibold text-info">{{ i + 1 }}.</span>
              <div class="text-[15px] font-semibold leading-snug">{{ q.prompt }}</div>
            </div>

            <template v-if="model.optionStyle === 'select'">
              <select
                v-model.number="answers[q.id]"
                class="select select-bordered select-sm w-full"
                :disabled="answersDisabled"
              >
                <option :value="undefined" disabled>Choose…</option>
                <option v-for="(opt, oi) in q.options" :key="oi" :value="oi">{{ opt }}</option>
              </select>
              <div v-if="isFinished && !examMode" class="mt-2 flex items-center gap-2 text-xs">
                <span v-if="isCorrect(q)" class="text-success flex items-center gap-1"><Check :size="12" /> Correct</span>
                <span v-else class="text-error flex items-center gap-1">
                  <X :size="12" /> Wrong — correct: <strong>{{ optionText(q, q.correctIndex) }}</strong>
                </span>
              </div>
              <p v-if="isFinished && !examMode" class="text-xs text-base-content/50 mt-1">{{ q.explanation }}</p>
            </template>

            <template v-else>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  v-for="(opt, oi) in q.options"
                  :key="oi"
                  type="button"
                  class="group w-full text-left px-4 py-3 rounded-box border transition-all flex items-center gap-3"
                  :class="[optionClass(q, oi), { 'opacity-60 cursor-not-allowed': answersDisabled }]"
                  :disabled="answersDisabled"
                  @click="selectAnswer(q.id, oi)"
                >
                  <span
                    class="w-5 h-5 rounded-full border grid place-items-center text-[10px] font-mono shrink-0"
                    :class="badgeClass(q, oi)"
                  >
                  <Check v-if="isFinished && !examMode && oi === q.correctIndex" :size="10" />
                  <X v-else-if="isFinished && !examMode && answers[q.id] === oi && oi !== q.correctIndex" :size="10" />
                    <span v-else class="opacity-70">{{ letter(oi) }}</span>
                  </span>
                  <span class="text-sm flex-1">{{ opt }}</span>
                </button>
              </div>
              <p v-if="isFinished && !examMode" class="text-xs text-base-content/50 mt-2">{{ q.explanation }}</p>
            </template>
          </div>
        </div>

        <div class="mt-8 pt-5 border-t border-base-300/70 flex items-center gap-3">
          <button class="btn btn-sm rounded-full bg-base-200 border-base-300 hover:bg-base-300" @click="$emit('finish')">
            {{ examMode ? 'Back to module' : 'Save & Exit' }}
          </button>
          <template v-if="!isFinished">
            <button
              class="btn btn-info text-info-content btn-sm rounded-full flex-1 gap-1"
              :disabled="interactionLocked || !allAnswered"
              @click="finish"
            >
              Submit Answers <ArrowRight :size="12" />
            </button>
          </template>
          <template v-else-if="!examMode">
            <div class="flex-1 flex items-center gap-3">
              <div class="text-sm">
                Score: <strong class="font-mono">{{ score }} / {{ model.questions.length }}</strong> · {{ percentage }}%
              </div>
              <button
                class="btn btn-outline btn-sm gap-1 ml-auto"
                :disabled="interactionLocked"
                @click="restart"
              >
                <Repeat :size="12" /> Retry
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Info, Check, X, Dot, Trophy, ArrowRight, Repeat, Volume2, AlertCircle } from 'lucide-vue-next'
import type { ListeningA2Exercise, ListeningExerciseAudioMap } from '~/utils/exercises/listening'
import {
  resolveItemListeningAudioSrc,
  resolveSharedListeningAudioSrc,
} from '~/utils/listening/audioUrls'
import { useProgress } from '~/composables/useProgress'
import { useListeningAudioAvailability } from '~/composables/useListeningAudioAvailability'
import { useTtsHealth } from '~/composables/useTtsHealth'
import { useListeningExclusivePlayback } from '~/composables/useListeningExclusivePlayback'
import { useListeningExercises } from '~/composables/useListeningExercises'
import AudioPlayer from './AudioPlayer.vue'

const PLAYBACK_SPEED_KEY = 'exam-one:listening:playback-speed'
const PLAYBACK_VOLUME_KEY = 'exam-one:listening:volume'
const speeds = [0.75, 1, 1.25] as const

interface NormalizedQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  transcript?: string
}

interface NormalizedModel {
  mode: 'shared' | 'peritem'
  optionStyle: 'buttons' | 'select'
  sharedTranscript?: string
  questions: NormalizedQuestion[]
}

interface GenerateAudioResponse {
  data: { audio: ListeningExerciseAudioMap; written: number } | null
  error: string | null
}

const props = withDefaults(defineProps<{
  exercise: ListeningA2Exercise
  examMode?: boolean
  initialAnswers?: Record<string, number | undefined>
}>(), {
  examMode: false,
  initialAnswers: () => ({}),
})
const emit = defineEmits<{
  finish: []
  progress: [payload: { answers: Record<string, number | undefined>; score: number; total: number }]
  examComplete: [payload: { answers: Record<string, number | undefined>; score: number; total: number }]
}>()

const { saveListeningCompletion } = useProgress()
const { updateExerciseAudio, getExerciseById } = useListeningExercises()
const { isReady: isTtsReady } = useTtsHealth()
const { activePlayerId, claim, release } = useListeningExclusivePlayback()

const answers = reactive<Record<string, number | undefined>>({})
const isFinished = ref(false)
const sessionKey = ref(0)
const volume = ref(0.6)
const speed = ref(1)
const isGeneratingAudio = ref(false)
const generateProgress = ref<{ done: number; total: number } | null>(null)
const generateError = ref<string | null>(null)

/** Local working copy so audio map updates remount players without leaving the page. */
const currentExercise = ref<ListeningA2Exercise>({ ...props.exercise })

watch(
  () => props.exercise,
  (next) => {
    currentExercise.value = { ...next }
  },
)

const exerciseRef = computed(() => currentExercise.value)
const {
  checked: checkedAvailability,
  anyMissing,
  missingCount,
  expectedCount,
  refresh: refreshAvailability,
} = useListeningAudioAvailability(exerciseRef)

const model = computed<NormalizedModel>(() => normalize(currentExercise.value))
const sharedAudioSrc = computed(() => resolveSharedListeningAudioSrc(currentExercise.value) ?? '')

function itemAudioSrc(itemId: string): string {
  return resolveItemListeningAudioSrc(currentExercise.value, itemId) ?? ''
}

const audioStatusDetail = computed(() => {
  if (isTtsReady.value) {
    return 'Audio files are missing. Use Generate audio below, or run pnpm generate:listening-audio for seed packs.'
  }
  return 'Audio files are missing. Run pnpm tts:up to start TTS, then Generate audio — or pnpm generate:listening-audio for seed packs.'
})

const generateButtonLabel = computed(() => {
  if (!isGeneratingAudio.value) return 'Generate audio'
  if (generateProgress.value) {
    return `Generating ${generateProgress.value.done}/${generateProgress.value.total}…`
  }
  return 'Generating…'
})

/** Lock practice UI while audio is unchecked or any expected file is missing. */
const interactionLocked = computed(() => !checkedAvailability.value || anyMissing.value)
const answersDisabled = computed(() => interactionLocked.value || isFinished.value)

watch(
  [checkedAvailability, anyMissing],
  ([checked, missing]) => {
    // Pause while audio is unavailable; resume only if the user already started the clock.
    if (!checked || missing) {
      stopTimer()
    } else if (timerStarted.value && !isFinished.value) {
      startTimer()
    }
  },
)
const instructions = computed(() => {
  if (props.examMode) {
    return `Use the permitted ${replayLimit.value === 1 ? 'single play' : `${replayLimit.value} plays`} and answer every question before submitting.`
  }
  switch (currentExercise.value.testingPart) {
    case 1: return 'Listen to each short message and choose the correct answer. Replay the audio as often as you need.'
    case 2: return 'Listen to the conversation and match each person to the correct option. Replay the audio as often as you need.'
    case 3: return 'Listen to each short dialogue and choose the correct answer. Replay the audio as often as you need.'
    case 4: return 'Listen to the interview and decide whether each statement is correct (Ja) or not (Nein). Replay the audio as often as you need.'
    default: return 'Listen and answer the questions. Replay the audio as often as you need.'
  }
})

const replayLimit = computed(() =>
  currentExercise.value.testingPart === 1 || currentExercise.value.testingPart === 4 ? 2 : 1,
)

const partTimeSec: Record<number, number> = { 1: 600, 2: 480, 3: 600, 4: 480 }
const timerRemaining = ref(partTimeSec[props.exercise.testingPart] ?? 600)
/** Timer starts only after the user presses play on any audio track. */
const timerStarted = ref(false)
let timerHandle: ReturnType<typeof setInterval> | null = null

const timerMM = computed(() => String(Math.floor(timerRemaining.value / 60)).padStart(2, '0'))
const timerSS = computed(() => String(timerRemaining.value % 60).padStart(2, '0'))

function startTimer() {
  if (props.examMode) return
  if (!checkedAvailability.value || anyMissing.value || isFinished.value) return
  if (timerHandle) return
  timerStarted.value = true
  timerHandle = setInterval(() => {
    if (timerRemaining.value > 0 && !isFinished.value) {
      timerRemaining.value--
    }
  }, 1000)
}

function stopTimer() {
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
}

function resetTimer() {
  stopTimer()
  timerStarted.value = false
  timerRemaining.value = partTimeSec[currentExercise.value.testingPart] ?? 600
}

function readPersistedNumber(key: string): number | undefined {
  if (!import.meta.client) return undefined
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return undefined
    const value = Number(raw)
    return Number.isFinite(value) ? value : undefined
  } catch {
    return undefined
  }
}

function persistNumber(key: string, value: number) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // ignore
  }
}

function setVolume(value: number) {
  if (interactionLocked.value) return
  volume.value = value
  persistNumber(PLAYBACK_VOLUME_KEY, value)
}

function setSpeed(value: number) {
  if (interactionLocked.value) return
  speed.value = value
  persistNumber(PLAYBACK_SPEED_KEY, value)
}

function onPlayerPlay(playerId: string) {
  claim(playerId)
  startTimer()
}

function onPlayerPause(playerId: string) {
  release(playerId)
}

function onAudioUnavailable() {
  void refreshAvailability()
}

async function generateAudioForExercise() {
  if (!isTtsReady.value || isGeneratingAudio.value) return
  generateError.value = null
  isGeneratingAudio.value = true
  generateProgress.value = { done: 0, total: Math.max(1, expectedCount.value) }

  try {
    const res = (await $fetch('/api/tts/generate-listening-audio', {
      method: 'POST',
      body: { exercise: currentExercise.value },
    })) as unknown as GenerateAudioResponse

    if (res.error || !res.data?.audio) {
      generateError.value = res.error ?? 'Audio generation failed.'
      return
    }

    generateProgress.value = {
      done: res.data.written,
      total: res.data.written,
    }

    const id = currentExercise.value.id
    if (id) {
      const updated = updateExerciseAudio(id, res.data.audio)
      currentExercise.value = updated ?? { ...currentExercise.value, audio: res.data.audio }
      const fromStore = getExerciseById(id)
      if (fromStore) currentExercise.value = { ...fromStore }
    } else {
      currentExercise.value = { ...currentExercise.value, audio: res.data.audio }
    }

    sessionKey.value += 1
    await refreshAvailability()
  } catch (error: unknown) {
    generateError.value = error instanceof Error ? error.message : 'Audio generation failed.'
  } finally {
    isGeneratingAudio.value = false
    generateProgress.value = null
  }
}

onMounted(() => {
  model.value.questions.forEach(q => {
    answers[q.id] = props.examMode ? props.initialAnswers[q.id] : undefined
  })
  const storedSpeed = readPersistedNumber(PLAYBACK_SPEED_KEY)
  if (storedSpeed !== undefined && speeds.includes(storedSpeed as (typeof speeds)[number])) {
    speed.value = storedSpeed
  }
  const storedVolume = readPersistedNumber(PLAYBACK_VOLUME_KEY)
  if (storedVolume !== undefined && storedVolume >= 0 && storedVolume <= 1) {
    volume.value = storedVolume
  }
})

watch(
  answers,
  () => {
    if (!props.examMode) return
    emit('progress', {
      answers: { ...answers },
      score: score.value,
      total: model.value.questions.length,
    })
  },
  { deep: true },
)

onUnmounted(stopTimer)

const answeredCount = computed(() => model.value.questions.filter(q => answers[q.id] !== undefined).length)
const allAnswered = computed(() => answeredCount.value === model.value.questions.length)
const score = computed(() => model.value.questions.filter(q => isCorrect(q)).length)
const percentage = computed(() => model.value.questions.length
  ? Math.round((score.value / model.value.questions.length) * 100)
  : 0)
const scoreMessage = computed(() => {
  if (percentage.value >= 90) return 'Excellent listening!'
  if (percentage.value >= 75) return 'Well done!'
  if (percentage.value >= 50) return 'Keep practicing!'
  return 'Listen again and retry.'
})

function letter(i: number) { return String.fromCharCode(65 + i) }

function selectAnswer(questionId: string, optionIndex: number) {
  if (answersDisabled.value) return
  answers[questionId] = optionIndex
}

function isCorrect(q: NormalizedQuestion): boolean {
  return answers[q.id] === q.correctIndex
}

function optionText(q: NormalizedQuestion, index: number | undefined): string {
  if (index === undefined) return '—'
  return q.options[index] ?? '—'
}

function optionClass(q: NormalizedQuestion, oi: number): string {
  if (isFinished.value && !props.examMode) {
    if (oi === q.correctIndex) return 'border-success bg-success/5'
    if (answers[q.id] === oi && oi !== q.correctIndex) return 'border-error bg-error/5'
    return 'border-base-300 bg-base-100'
  }
  if (answers[q.id] === oi) return 'border-info bg-info/5'
  return 'border-base-300 hover:border-base-content/30 bg-base-100'
}

function badgeClass(q: NormalizedQuestion, oi: number): string {
  if (isFinished.value && !props.examMode) {
    if (oi === q.correctIndex) return 'border-success bg-success text-success-content'
    if (answers[q.id] === oi && oi !== q.correctIndex) return 'border-error bg-error text-error-content'
    return 'border-base-300 bg-base-100'
  }
  if (answers[q.id] === oi) return 'border-info bg-info text-info-content'
  return 'border-base-300 bg-base-100'
}

function finish() {
  if (interactionLocked.value || !allAnswered.value) return
  isFinished.value = true
  stopTimer()
  if (props.examMode) {
    emit('examComplete', {
      answers: { ...answers },
      score: score.value,
      total: model.value.questions.length,
    })
    return
  }
  saveListeningCompletion(currentExercise.value.id ?? '', score.value, model.value.questions.length)
}

function restart() {
  if (interactionLocked.value) return
  isFinished.value = false
  model.value.questions.forEach(q => { answers[q.id] = undefined })
  resetTimer()
  sessionKey.value += 1
}

function normalize(ex: ListeningA2Exercise): NormalizedModel {
  if (ex.testingPart === 1 || ex.testingPart === 3) {
    return {
      mode: 'peritem',
      optionStyle: 'buttons',
      questions: ex.items.map((item, i) => ({
        id: item.id ?? `${ex.id}-i${i}`,
        prompt: item.question,
        options: [...item.options],
        correctIndex: item.correctAnswer,
        explanation: item.explanation,
        transcript: item.transcript,
      })),
    }
  }

  if (ex.testingPart === 2) {
    return {
      mode: 'shared',
      optionStyle: 'select',
      sharedTranscript: ex.transcript,
      questions: ex.questions.map((q, i) => ({
        id: q.id ?? `${ex.id}-q${i}`,
        prompt: q.person,
        options: [...ex.options],
        correctIndex: q.correctAnswer,
        explanation: q.explanation,
      })),
    }
  }

  return {
    mode: 'shared',
    optionStyle: 'buttons',
    sharedTranscript: ex.transcript,
    questions: ex.questions.map((q, i) => ({
      id: q.id ?? `${ex.id}-q${i}`,
      prompt: q.statement,
      options: ['Ja, das ist richtig.', 'Nein, das ist falsch.'],
      correctIndex: q.correctAnswer ? 0 : 1,
      explanation: q.explanation,
    })),
  }
}
</script>
