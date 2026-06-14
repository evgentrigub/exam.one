<template>
  <div>
    <!-- Active session -->
    <div v-if="!isFinished" class="space-y-5">
      <!-- Shared audio (Teil 2 + 4) -->
      <AudioPlayer
        v-if="model.mode === 'shared'"
        :transcript="model.sharedTranscript || ''"
        :label="`${exercise.title}`"
        :reveal-transcript="false"
      />

      <!-- Instructions -->
      <div class="alert alert-info text-sm">
        <Info :size="16" class="shrink-0" />
        <span>{{ instructions }}</span>
      </div>

      <!-- Questions -->
      <div class="space-y-4">
        <div
          v-for="(q, i) in model.questions"
          :key="q.id"
          class="bg-base-100 border border-base-300 ring-soft rounded-box p-4"
        >
          <!-- Per-item audio (Teil 1 + 3) -->
          <AudioPlayer
            v-if="model.mode === 'peritem' && q.transcript"
            class="mb-3"
            :transcript="q.transcript"
            :label="`Audio ${i + 1}`"
            :reveal-transcript="false"
          />

          <p class="text-sm font-medium mb-3">
            <span class="text-base-content/40 font-mono mr-1.5">{{ i + 1 }}.</span>{{ q.prompt }}
          </p>

          <!-- Matching (Teil 2): dropdown of 9 options -->
          <select
            v-if="model.optionStyle === 'select'"
            v-model.number="answers[q.id]"
            class="select select-bordered select-sm w-full"
          >
            <option :value="undefined" disabled>Choose…</option>
            <option v-for="(opt, oi) in q.options" :key="oi" :value="oi">{{ opt }}</option>
          </select>

          <!-- Lettered option buttons (Teil 1, 3, 4) -->
          <div v-else class="grid gap-2" :class="q.options.length > 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2'">
            <button
              v-for="(opt, oi) in q.options"
              :key="oi"
              type="button"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-field border text-left text-sm transition-colors"
              :class="answers[q.id] === oi
                ? 'border-info bg-listening-soft text-base-content'
                : 'border-base-300 hover:bg-base-200'"
              @click="answers[q.id] = oi"
            >
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold font-mono"
                :class="answers[q.id] === oi ? 'bg-info text-info-content' : 'bg-base-200 text-base-content/60'"
              >{{ letter(oi) }}</span>
              {{ opt }}
            </button>
          </div>
        </div>
      </div>

      <!-- Submit row -->
      <div class="flex items-center justify-between pt-1">
        <span class="text-xs text-base-content/50">{{ answeredCount }} / {{ model.questions.length }} answered</span>
        <button class="btn btn-info text-info-content" :disabled="!allAnswered" @click="finish">
          Submit answers
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-else class="space-y-5">
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
        <div class="p-6 text-center border-b border-base-300">
          <div class="ring-prog mx-auto mb-3" :style="{ '--p': percentage, '--c': 'var(--color-info)' }">
            <span class="font-mono">{{ percentage }}%</span>
          </div>
          <div class="text-2xl font-bold font-mono mb-1" :class="scoreTextClass">
            {{ score }}/{{ model.questions.length }}
          </div>
          <div class="text-sm text-base-content/60">{{ scoreMessage }}</div>
        </div>

        <div class="divide-y divide-base-200">
          <div v-for="(q, i) in model.questions" :key="q.id" class="flex items-start gap-3 p-4">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              :class="isCorrect(q) ? 'bg-success/20 text-success' : 'bg-error/20 text-error'"
            >
              <Check v-if="isCorrect(q)" :size="14" />
              <X v-else :size="14" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium">{{ i + 1 }}. {{ q.prompt }}</p>
              <p v-if="!isCorrect(q)" class="text-xs text-base-content/60 mt-1">
                Your answer: <strong>{{ optionText(q, answers[q.id]) }}</strong> ·
                Correct: <strong>{{ optionText(q, q.correctIndex) }}</strong>
              </p>
              <p class="text-xs text-base-content/50 mt-1">{{ q.explanation }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Transcript reveal -->
      <AudioPlayer
        v-if="model.mode === 'shared'"
        :transcript="model.sharedTranscript || ''"
        :label="`${exercise.title} · transcript`"
        :reveal-transcript="true"
      />

      <div class="flex gap-3">
        <button class="btn btn-info text-info-content flex-1" @click="restart">Try again</button>
        <button class="btn btn-ghost flex-1" @click="$emit('finish')">Back to exercises</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Info, Check, X } from 'lucide-vue-next'
import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import { useProgress } from '~/composables/useProgress'
import { getScoreTextClass } from '~/utils/labels'
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

const model = computed<NormalizedModel>(() => normalize(props.exercise))

const instructions = computed(() => {
  switch (props.exercise.testingPart) {
    case 1: return 'Listen to each short message and choose the correct answer. You may replay each audio up to twice.'
    case 2: return 'Listen to the conversation and match each person to the correct option. The audio plays twice.'
    case 3: return 'Listen to each short dialogue and choose the correct answer.'
    case 4: return 'Listen to the interview and decide whether each statement is correct (Ja) or not (Nein).'
    default: return 'Listen and answer the questions.'
  }
})

const answeredCount = computed(() => model.value.questions.filter(q => answers[q.id] !== undefined).length)
const allAnswered = computed(() => answeredCount.value === model.value.questions.length)
const score = computed(() => model.value.questions.filter(q => isCorrect(q)).length)
const percentage = computed(() => model.value.questions.length
  ? Math.round((score.value / model.value.questions.length) * 100)
  : 0)
const scoreTextClass = computed(() => getScoreTextClass(percentage.value))
const scoreMessage = computed(() => {
  if (percentage.value >= 90) return 'Excellent listening!'
  if (percentage.value >= 75) return 'Well done!'
  if (percentage.value >= 50) return 'Keep practicing!'
  return 'Listen again and retry.'
})

function letter(i: number) { return String.fromCharCode(97 + i) }

function isCorrect(q: NormalizedQuestion): boolean {
  return answers[q.id] === q.correctIndex
}

function optionText(q: NormalizedQuestion, index: number | undefined): string {
  if (index === undefined) return '—'
  return q.options[index] ?? '—'
}

function finish() {
  isFinished.value = true
  saveListeningCompletion(props.exercise.id ?? '', score.value, model.value.questions.length)
}

function restart() {
  isFinished.value = false
  model.value.questions.forEach(q => { answers[q.id] = undefined })
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
