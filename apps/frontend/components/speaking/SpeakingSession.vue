<template>
  <div class="grid lg:grid-cols-2 gap-5 items-start">
    <!-- Left: prompt -->
    <div class="space-y-4 lg:sticky lg:top-4">
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="inline-flex items-center gap-1.5 rounded-selector bg-speaking-soft text-speaking text-xs font-semibold px-2 py-1">
            <Mic :size="12" />
            {{ topic.topicType === 'interview' ? 'Interview' : 'Monologue' }}
          </span>
          <span class="level-pip">Teil {{ topic.testingPart }}</span>
        </div>
        <h2 class="text-lg font-semibold mb-2">{{ topic.theme }}</h2>
        <p class="text-sm text-base-content/60">{{ instruction }}</p>
      </div>

      <!-- Prompt cards (Teil 1) / keywords (Teil 2) -->
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
        <p class="text-[10px] uppercase tracking-wider font-semibold text-base-content/50 mb-3">
          {{ topic.topicType === 'interview' ? 'Prompt cards' : 'Keywords' }}
        </p>
        <div class="grid grid-cols-2 gap-2.5">
          <div
            v-for="(word, i) in prompts"
            :key="i"
            class="rounded-field border border-base-300 bg-base-200/50 px-3 py-3 text-center text-sm font-medium"
          >
            {{ word }}
          </div>
        </div>
      </div>

      <!-- Useful phrases (practice helper) -->
      <div class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
        <p class="text-[10px] uppercase tracking-wider font-semibold text-base-content/50 mb-3">Useful phrases</p>
        <ul class="space-y-1.5">
          <li v-for="(phrase, i) in usefulPhrases" :key="i" class="flex items-start gap-2 text-sm">
            <Quote :size="13" class="text-speaking mt-1 shrink-0" />
            <span>{{ phrase }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Right: recorder + feedback -->
    <div class="space-y-4">
      <SpeakingRecorder :max-seconds="maxSeconds" @done="onRecorded" />

      <!-- Auto transcript preview (mocked) -->
      <div v-if="recorded && !submitted" class="bg-base-100 border border-base-300 ring-soft rounded-box p-5">
        <p class="text-[10px] uppercase tracking-wider font-semibold text-base-content/50 mb-2">
          Auto transcript (preview)
        </p>
        <p class="text-sm leading-relaxed text-base-content/80">{{ mockTranscript }}</p>
        <p class="text-[11px] text-base-content/40 mt-3">
          Speech-to-text is mocked in this build; real transcription and AI grading arrive later.
        </p>
        <button class="btn btn-warning text-warning-content w-full mt-4 gap-1.5" @click="submit">
          <Sparkles :size="15" />
          Submit for feedback
        </button>
      </div>

      <!-- Feedback (mocked) -->
      <div v-if="submitted" class="bg-base-100 border border-base-300 ring-soft rounded-box overflow-hidden">
        <div class="p-5 border-b border-base-300">
          <div class="flex items-center gap-2">
            <CircleCheck :size="18" class="text-success" />
            <h3 class="text-sm font-semibold">Practice saved</h3>
          </div>
          <p class="text-xs text-base-content/50 mt-1">
            Sample feedback shown below. Connect an AI provider later for a real evaluation.
          </p>
        </div>
        <div class="divide-y divide-base-200">
          <div v-for="item in mockRubric" :key="item.label" class="flex items-center justify-between gap-3 p-4">
            <div>
              <p class="text-sm font-medium">{{ item.label }}</p>
              <p class="text-xs text-base-content/50">{{ item.tip }}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <span
                v-for="n in 5"
                :key="n"
                class="w-2 h-2 rounded-full"
                :class="n <= item.score ? 'bg-warning' : 'bg-base-300'"
              />
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-base-300 flex gap-3">
          <button class="btn btn-warning text-warning-content flex-1" @click="retry">Practice again</button>
          <button class="btn btn-ghost flex-1" @click="$emit('finish')">Back to exercises</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Mic, Quote, Sparkles, CircleCheck } from 'lucide-vue-next'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import { useProgress } from '~/composables/useProgress'
import SpeakingRecorder from './SpeakingRecorder.vue'

const props = defineProps<{ topic: SpeakingA2Topic }>()
defineEmits<{ finish: [] }>()

const { saveSpeakingAttempt } = useProgress()

const recorded = ref<{ durationSec: number; audioUrl: string | null } | null>(null)
const submitted = ref(false)

const maxSeconds = computed(() => (props.topic.testingPart === 1 ? 45 : 60))

const prompts = computed<string[]>(() =>
  props.topic.topicType === 'interview' ? [...props.topic.cards] : [...props.topic.keywords],
)

const instruction = computed(() =>
  props.topic.topicType === 'interview'
    ? 'Ask and answer simple questions using each prompt card. Speak naturally and give short, complete answers.'
    : 'Talk about the topic using all four keywords. Aim for a few connected sentences.',
)

const usefulPhrases = [
  'Ich heiße … und ich komme aus …',
  'In meiner Freizeit … ich gern …',
  'Ich finde das interessant, weil …',
  'Können Sie das bitte wiederholen?',
]

const mockTranscript = computed(() =>
  props.topic.topicType === 'interview'
    ? '„Wo kaufst du normalerweise ein? — Ich kaufe meistens im Supermarkt ein. Und du, gehst du gern auf den Markt?"'
    : '„Ich wohne in einer kleinen Wohnung in Berlin. Sie hat zwei Zimmer und ich wohne dort mit meinem Bruder."',
)

const mockRubric = [
  { label: 'Aufgabenerfüllung', tip: 'You addressed the prompts.', score: 4 },
  { label: 'Aussprache', tip: 'Clear and understandable.', score: 4 },
  { label: 'Wortschatz', tip: 'Good A2-level vocabulary.', score: 3 },
  { label: 'Grammatik', tip: 'Watch verb endings and word order.', score: 3 },
]

function onRecorded(payload: { durationSec: number; audioUrl: string | null }) {
  recorded.value = payload
  submitted.value = false
}

function submit() {
  if (!recorded.value) return
  saveSpeakingAttempt(props.topic.id, {
    durationSec: recorded.value.durationSec,
    transcript: mockTranscript.value,
  })
  submitted.value = true
}

function retry() {
  recorded.value = null
  submitted.value = false
}
</script>
