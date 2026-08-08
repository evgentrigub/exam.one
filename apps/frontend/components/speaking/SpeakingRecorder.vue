<template>
  <div class="rounded-box border border-base-300 bg-base-100 p-6 text-center">
    <!-- Ready -->
    <template v-if="phase === 'ready'">
      <button
        type="button"
        class="w-20 h-20 mx-auto rounded-full bg-warning text-warning-content flex items-center justify-center shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning"
        title="Start recording"
        :disabled="starting || !!disabled"
        @click="start"
      >
        <span v-if="starting" class="loading loading-spinner loading-md" />
        <Mic v-else :size="30" />
      </button>
      <p class="text-sm font-medium mt-4">
        {{ starting ? 'Requesting microphone access…' : 'Tap to start recording' }}
      </p>
      <p class="text-xs text-base-content/50 mt-1">Record for up to {{ maxSeconds }} seconds</p>
      <div
        v-if="recorderError"
        class="alert mt-4 border border-warning/30 bg-warning/10 text-left text-sm"
      >
        <TriangleAlert :size="16" class="shrink-0 text-warning" />
        <span>{{ recorderError }} You can still enter the transcript manually below.</span>
      </div>
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
    </template>

    <!-- Done -->
    <template v-else>
      <div
        class="w-16 h-16 mx-auto rounded-full bg-success/20 text-success flex items-center justify-center"
      >
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
        <button
          type="button"
          class="btn btn-sm btn-ghost gap-1.5"
          :disabled="!!disabled"
          @click="reset"
        >
          <RotateCcw :size="14" />
          Re-record
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Check, Mic, Play, RotateCcw, Square, TriangleAlert } from 'lucide-vue-next'

const props = withDefaults(defineProps<{ maxSeconds?: number; disabled?: boolean }>(), {
  maxSeconds: 30,
  disabled: false,
})
const emit = defineEmits<{
  done: [payload: { durationSec: number; audioUrl: string | null; blob: Blob | null }]
  recordingChange: [isRecording: boolean]
}>()

type Phase = 'ready' | 'recording' | 'done'
const phase = ref<Phase>('ready')
const seconds = ref(0)
const starting = ref(false)
const recorderError = ref<string | null>(null)
const audioUrl = ref<string | null>(null)

let timer: ReturnType<typeof setInterval> | null = null
let mediaRecorder: MediaRecorder | null = null
let stream: MediaStream | null = null
let chunks: BlobPart[] = []
let audioEl: HTMLAudioElement | null = null
let stopping = false
let disposed = false

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
  if (props.disabled || starting.value || phase.value !== 'ready') return

  seconds.value = 0
  chunks = []
  stopping = false
  recorderError.value = null
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioUrl.value = null

  if (
    !import.meta.client ||
    !navigator.mediaDevices?.getUserMedia ||
    !('MediaRecorder' in window)
  ) {
    recorderError.value = 'Audio recording is not supported in this browser.'
    return
  }

  starting.value = true
  emit('recordingChange', true)
  try {
    const capturedStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    if (disposed) {
      capturedStream.getTracks().forEach(track => track.stop())
      return
    }

    stream = capturedStream
    const recorder = new MediaRecorder(capturedStream)
    mediaRecorder = recorder
    recorder.ondataavailable = event => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.onerror = () => {
      recorder.onstop = null
      stopTimer()
      releaseStream()
      phase.value = 'ready'
      recorderError.value = 'The browser could not finish the audio recording.'
      emit('recordingChange', false)
    }
    recorder.onstop = () => {
      if (disposed) return

      if (!chunks.length) {
        releaseStream()
        phase.value = 'ready'
        recorderError.value = 'No audio was captured.'
        emit('recordingChange', false)
        return
      }

      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      audioUrl.value = URL.createObjectURL(blob)
      releaseStream()
      phase.value = 'done'
      emit('recordingChange', false)
      emit('done', {
        durationSec: seconds.value,
        audioUrl: audioUrl.value,
        blob,
      })
    }
    recorder.start()
    phase.value = 'recording'
    startTimer()
  } catch (error: unknown) {
    releaseStream()
    recorderError.value = microphoneErrorMessage(error)
    emit('recordingChange', false)
  } finally {
    starting.value = false
  }
}

function stop() {
  if (stopping) return
  stopping = true
  stopTimer()
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  } else {
    releaseStream()
    phase.value = 'ready'
    recorderError.value = 'The browser stopped the recording before audio was captured.'
    emit('recordingChange', false)
  }
}

function reset() {
  stopTimer()
  releaseStream()
  stopping = false
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }
  seconds.value = 0
  recorderError.value = null
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

function microphoneErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return 'Microphone access was denied.'
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'No microphone was found.'
    }
  }
  return 'The microphone could not be started.'
}

onUnmounted(() => {
  disposed = true
  stopTimer()
  if (mediaRecorder) {
    mediaRecorder.ondataavailable = null
    mediaRecorder.onstop = null
    mediaRecorder.onerror = null
    if (mediaRecorder.state !== 'inactive') mediaRecorder.stop()
  }
  releaseStream()
  audioEl?.pause()
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
})

defineExpose({ phase })
</script>
