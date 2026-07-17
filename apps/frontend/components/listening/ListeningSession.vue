<template>
  <div class="grid grid-cols-12 gap-6">
    <!-- LEFT SIDEBAR -->
    <div class="col-span-12 lg:col-span-4 space-y-5">
      <!-- Shared audio (Teil 2 + 4) -->
      <AudioPlayer
        v-if="model.mode === 'shared'"
        :key="`shared-${sessionKey}`"
        :transcript="model.sharedTranscript || ''"
        :label="exercise.title"
        :src="sharedAudioSrc"
        :replay-limit="replayLimit"
        :reveal-transcript="isFinished"
      />

      <!-- Practice timer -->
      <div class="bg-base-100 rounded-box border border-base-300/70 p-5">
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
        <!-- Result callout (inline after submit) -->
        <div
          v-if="isFinished"
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

        <!-- Questions -->
        <div class="mt-6 space-y-7">
          <div v-for="(q, i) in model.questions" :key="q.id">
            <!-- Per-item audio (Teil 1 + 3) -->
            <AudioPlayer
              v-if="model.mode === 'peritem' && q.transcript"
              :key="`${q.id}-${sessionKey}`"
              class="mb-3"
              :transcript="q.transcript"
              :label="`Audio ${i + 1}`"
              :src="itemAudioSrc(q.id)"
              :replay-limit="replayLimit"
              :reveal-transcript="isFinished"
            />

            <div class="flex items-baseline gap-2 mb-3">
              <span class="font-mono text-sm font-semibold text-info">{{ i + 1 }}.</span>
              <div class="text-[15px] font-semibold leading-snug">{{ q.prompt }}</div>
            </div>

            <!-- Matching (Teil 2): styled select -->
            <template v-if="model.optionStyle === 'select'">
              <select
                v-model.number="answers[q.id]"
                class="select select-bordered select-sm w-full"
                :disabled="isFinished"
              >
                <option :value="undefined" disabled>Choose…</option>
                <option v-for="(opt, oi) in q.options" :key="oi" :value="oi">{{ opt }}</option>
              </select>
              <!-- Post-submit correctness for select -->
              <div v-if="isFinished" class="mt-2 flex items-center gap-2 text-xs">
                <span v-if="isCorrect(q)" class="text-success flex items-center gap-1"><Check :size="12" /> Correct</span>
                <span v-else class="text-error flex items-center gap-1">
                  <X :size="12" /> Wrong — correct: <strong>{{ optionText(q, q.correctIndex) }}</strong>
                </span>
              </div>
              <p v-if="isFinished" class="text-xs text-base-content/50 mt-1">{{ q.explanation }}</p>
            </template>

            <!-- Lettered option buttons (Teil 1, 3, 4) -->
            <template v-else>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  v-for="(opt, oi) in q.options"
                  :key="oi"
                  type="button"
                  class="group w-full text-left px-4 py-3 rounded-box border transition-all flex items-center gap-3"
                  :class="optionClass(q, oi)"
                  :disabled="isFinished"
                  @click="answers[q.id] = oi"
                >
                  <span
                    class="w-5 h-5 rounded-full border grid place-items-center text-[10px] font-mono shrink-0"
                    :class="badgeClass(q, oi)"
                  >
                    <Check v-if="isFinished && oi === q.correctIndex" :size="10" />
                    <X v-else-if="isFinished && answers[q.id] === oi && oi !== q.correctIndex" :size="10" />
                    <span v-else class="opacity-70">{{ letter(oi) }}</span>
                  </span>
                  <span class="text-sm flex-1">{{ opt }}</span>
                </button>
              </div>
              <p v-if="isFinished" class="text-xs text-base-content/50 mt-2">{{ q.explanation }}</p>
            </template>
          </div>
        </div>

        <!-- Submit / actions row -->
        <div class="mt-8 pt-5 border-t border-base-300/70 flex items-center gap-3">
          <button class="btn btn-sm rounded-full bg-base-200 border-base-300 hover:bg-base-300" @click="$emit('finish')">
            Save &amp; Exit
          </button>
          <template v-if="!isFinished">
            <button
              class="btn btn-info text-info-content btn-sm rounded-full flex-1 gap-1"
              :disabled="!allAnswered"
              @click="finish"
            >
              Submit Answers <ArrowRight :size="12" />
            </button>
          </template>
          <template v-else>
            <div class="flex-1 flex items-center gap-3">
              <div class="text-sm">
                Score: <strong class="font-mono">{{ score }} / {{ model.questions.length }}</strong> · {{ percentage }}%
              </div>
              <button class="btn btn-outline btn-sm gap-1 ml-auto" @click="restart">
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
import { Info, Check, X, Dot, Trophy, ArrowRight, Repeat } from 'lucide-vue-next'
import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import {
  listeningReplayLimit,
  resolveItemListeningAudioSrc,
  resolveSharedListeningAudioSrc,
} from '~/utils/listening/audioUrls'
import { useProgress } from '~/composables/useProgress'
import AudioPlayer from './AudioPlayer.vue'

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

const props = defineProps<{ exercise: ListeningA2Exercise }>()
defineEmits<{ finish: [] }>()

const { saveListeningCompletion } = useProgress()

const answers = reactive<Record<string, number | undefined>>({})
const isFinished = ref(false)
const sessionKey = ref(0)

const model = computed<NormalizedModel>(() => normalize(props.exercise))

const replayLimit = computed(() => listeningReplayLimit(props.exercise.testingPart))

const sharedAudioSrc = computed(() => resolveSharedListeningAudioSrc(props.exercise) ?? '')

function itemAudioSrc(itemId: string): string {
  return resolveItemListeningAudioSrc(props.exercise, itemId) ?? ''
}

const instructions = computed(() => {
  switch (props.exercise.testingPart) {
    case 1: return 'Listen to each short message and choose the correct answer. You may replay each audio up to twice.'
    case 2: return 'Listen to the conversation and match each person to the correct option. The audio plays once.'
    case 3: return 'Listen to each short dialogue and choose the correct answer. Each audio plays once.'
    case 4: return 'Listen to the interview and decide whether each statement is correct (Ja) or not (Nein). You may replay the audio up to twice.'
    default: return 'Listen and answer the questions.'
  }
})

// Practice timer (non-blocking, counts down from part-based duration)
const partTimeSec: Record<number, number> = { 1: 600, 2: 480, 3: 600, 4: 480 }
const timerRemaining = ref(partTimeSec[props.exercise.testingPart] ?? 600)
let timerHandle: ReturnType<typeof setInterval> | null = null

const timerMM = computed(() => String(Math.floor(timerRemaining.value / 60)).padStart(2, '0'))
const timerSS = computed(() => String(timerRemaining.value % 60).padStart(2, '0'))

function startTimer() {
  stopTimer()
  timerHandle = setInterval(() => {
    if (timerRemaining.value > 0 && !isFinished.value) {
      timerRemaining.value--
    }
  }, 1000)
}

function stopTimer() {
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
}

onMounted(startTimer)
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

function isCorrect(q: NormalizedQuestion): boolean {
  return answers[q.id] === q.correctIndex
}

function optionText(q: NormalizedQuestion, index: number | undefined): string {
  if (index === undefined) return '—'
  return q.options[index] ?? '—'
}

function optionClass(q: NormalizedQuestion, oi: number): string {
  if (isFinished.value) {
    if (oi === q.correctIndex) return 'border-success bg-success/5'
    if (answers[q.id] === oi && oi !== q.correctIndex) return 'border-error bg-error/5'
    return 'border-base-300 bg-base-100'
  }
  if (answers[q.id] === oi) return 'border-info bg-info/5'
  return 'border-base-300 hover:border-base-content/30 bg-base-100'
}

function badgeClass(q: NormalizedQuestion, oi: number): string {
  if (isFinished.value) {
    if (oi === q.correctIndex) return 'border-success bg-success text-success-content'
    if (answers[q.id] === oi && oi !== q.correctIndex) return 'border-error bg-error text-error-content'
    return 'border-base-300 bg-base-100'
  }
  if (answers[q.id] === oi) return 'border-info bg-info text-info-content'
  return 'border-base-300 bg-base-100'
}

function finish() {
  isFinished.value = true
  stopTimer()
  saveListeningCompletion(props.exercise.id ?? '', score.value, model.value.questions.length)
}

function restart() {
  isFinished.value = false
  model.value.questions.forEach(q => { answers[q.id] = undefined })
  timerRemaining.value = partTimeSec[props.exercise.testingPart] ?? 600
  sessionKey.value += 1
  startTimer()
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

  // Teil 4: Ja / Nein
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

onMounted(() => {
  model.value.questions.forEach(q => { answers[q.id] = undefined })
})
</script>
