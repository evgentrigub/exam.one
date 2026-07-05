<template>
  <div class="rounded-box border border-base-300 bg-base-100 p-6 text-center">
    <!-- Ready -->
    <template v-if="phase === 'ready'">
      <button
        type="button"
        class="w-20 h-20 mx-auto rounded-full bg-warning text-warning-content flex items-center justify-center shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning"
        title="Start recording"
        @click="start"
      >
        <Mic :size="30" />
      </button>
      <p class="text-sm font-medium mt-4">Tap to start recording</p>
      <p class="text-xs text-base-content/50 mt-1">Speak for about {{ maxSeconds }} seconds</p>
    </template>

    <!-- Recording -->
    <template v-else-if="phase === 'recording'">
      <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
        <span class="absolute inset-0 rounded-full bg-error/20 animate-ping" />
        <button
          type="button"
          class="relative w-20 h-20 rounded-full bg-error text-error-content flex items-center justify-center shadow-lg"
          title="Stop recording"
          @click="stop"
        >
          <Square :size="26" />
        </button>
      </div>
      <!-- Waveform -->
      <div class="wave-live flex items-end justify-center gap-1 h-8 mt-4 text-error">
        <span v-for="n in 7" :key="n" class="wave-bar" style="height: 100%" />
      </div>
      <p class="text-sm font-medium mt-3 font-mono">{{ fmt(seconds) }} / {{ maxLabel }}</p>
      <p v-if="simulated" class="text-[11px] text-base-content/40 mt-1">Microphone unavailable — simulated recording</p>
    </template>

    <!-- Done -->
    <template v-else>
      <div class="w-16 h-16 mx-auto rounded-full bg-success/20 text-success flex items-center justify-center">
        <Check :size="28" />
      </div>
      <p class="text-sm font-medium mt-3">Recording complete · {{ fmt(seconds) }}</p>
      <div class="flex items-center justify-center gap-2 mt-4">
        <button
          type="button"
          class="btn btn-sm btn-outline gap-1.5"
          :disabled="!audioUrl"
          :title="audioUrl ? 'Play back' : 'Playback unavailable'"
          @click="playback"
        >
          <Play :size="14" />
          Play back
        </button>
        <button type="button" class="btn btn-sm btn-ghost gap-1.5" @click="reset">
          <RotateCcw :size="14" />
          Re-record
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Mic, Square, Check, Play, RotateCcw } from 'lucide-vue-next'

const props = withDefaults(defineProps<{ maxSeconds?: number }>(), { maxSeconds: 30 })
const emit = defineEmits<{ done: [payload: { durationSec: number; audioUrl: string | null }] }>()

type Phase = 'ready' | 'recording' | 'done'
const phase = ref<Phase>('ready')
const seconds = ref(0)
const simulated = ref(false)
const audioUrl = ref<string | null>(null)

let timer: ReturnType<typeof setInterval> | null = null
let mediaRecorder: MediaRecorder | null = null
let stream: MediaStream | null = null
let chunks: BlobPart[] = []
let audioEl: HTMLAudioElement | null = null

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const maxLabel = computed(() => fmt(props.maxSeconds))

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    seconds.value += 1
    if (seconds.value >= props.maxSeconds) stop()
  }, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

async function start() {
  seconds.value = 0
  chunks = []
  audioUrl.value = null
  simulated.value = false

  // Real capture when available; gracefully fall back to a simulated session.
  if (import.meta.client && navigator.mediaDevices?.getUserMedia && 'MediaRecorder' in window) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      mediaRecorder.onstop = () => {
        if (chunks.length) {
          const blob = new Blob(chunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
          audioUrl.value = URL.createObjectURL(blob)
        }
        releaseStream()
      }
      mediaRecorder.start()
    } catch {
      simulated.value = true
    }
  } else {
    simulated.value = true
  }

  phase.value = 'recording'
  startTimer()
}

function stop() {
  stopTimer()
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  } else {
    releaseStream()
  }
  phase.value = 'done'
  emit('done', { durationSec: seconds.value, audioUrl: audioUrl.value })
}

function reset() {
  stopTimer()
  releaseStream()
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }
  seconds.value = 0
  phase.value = 'ready'
}

function playback() {
  if (!audioUrl.value) return
  audioEl?.pause()
  audioEl = new Audio(audioUrl.value)
  void audioEl.play()
}

function releaseStream() {
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  mediaRecorder = null
}

onUnmounted(() => {
  stopTimer()
  releaseStream()
  audioEl?.pause()
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
})

defineExpose({ phase })
</script>
