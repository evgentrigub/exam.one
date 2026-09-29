<template>
  <div class="rounded-box border border-base-300 bg-base-100 p-6 text-center">
    <!-- Ready -->
    <template v-if="phase === 'ready'">
      <button
        type="button"
        class="w-20 h-20 mx-auto rounded-full bg-warning text-warning-content flex items-center justify-center shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        :title="
          disabled
            ? disabledReason || t('speaking.recorder.unavailable')
            : t('speaking.recorder.start')
        "
        :disabled="starting || !!disabled"
        @click="start"
      >
        <span v-if="starting" class="loading loading-spinner loading-md" />
        <Mic v-else :size="30" />
      </button>
      <p class="text-sm font-medium mt-4">
        {{
          starting
            ? t('speaking.recorder.requestingMic')
            : disabled
              ? disabledReason || t('speaking.recorder.unavailable')
              : t('speaking.recorder.tapToStart')
        }}
      </p>
      <p class="text-xs text-base-content/50 mt-1">
        {{ t('speaking.recorder.maxDuration', { seconds: maxSeconds }) }}
      </p>
      <div
        v-if="recorderError"
        class="alert mt-4 border border-warning/30 bg-warning/10 text-left text-sm"
      >
        <TriangleAlert :size="16" class="shrink-0 text-warning" />
        <span>{{ t('speaking.recorder.errorWithHint', { error: recorderError }) }}</span>
      </div>
    </template>

    <!-- Recording -->
    <template v-else-if="phase === 'recording'">
      <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
        <span class="absolute inset-0 rounded-full bg-error/20 animate-ping" />
        <button
          type="button"
          class="relative w-20 h-20 rounded-full bg-error text-error-content flex items-center justify-center shadow-lg"
          :title="t('speaking.recorder.stop')"
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
      <p class="text-sm font-medium mt-3">
        {{ t('speaking.recorder.complete', { time: fmt(seconds) }) }}
      </p>
      <audio
        ref="audioPlayer"
        :src="audioUrl || ''"
        preload="metadata"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @ended="isPlaying = false"
        @error="onPlaybackError"
      />
      <div class="flex items-center justify-center gap-2 mt-4">
        <button
          type="button"
          class="btn btn-sm btn-outline gap-1.5"
          :disabled="!audioUrl"
          :title="audioUrl ? t('speaking.recorder.playBack') : t('speaking.recorder.playbackUnavailable')"
          @click="togglePlayback"
        >
          <Pause v-if="isPlaying" :size="14" />
          <Play v-else :size="14" />
          {{ isPlaying ? t('speaking.recorder.pause') : t('speaking.recorder.playBack') }}
        </button>
        <button
          type="button"
          class="btn btn-sm btn-ghost gap-1.5"
          :disabled="!!disabled"
          @click="reset"
        >
          <RotateCcw :size="14" />
          {{ t('speaking.recorder.reRecord') }}
        </button>
      </div>
      <p v-if="playbackError" class="mt-3 text-xs text-error">{{ playbackError }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Check, Mic, Pause, Play, RotateCcw, Square, TriangleAlert } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{ maxSeconds?: number; disabled?: boolean; disabledReason?: string }>(),
  {
    maxSeconds: 30,
    disabled: false,
    disabledReason: '',
  }
)
const emit = defineEmits<{
  done: [payload: { durationSec: number; audioUrl: string | null; blob: Blob | null }]
  recordingChange: [isRecording: boolean]
}>()

const { t } = useI18n()

type Phase = 'ready' | 'recording' | 'done'
const phase = ref<Phase>('ready')
const seconds = ref(0)
const starting = ref(false)
const recorderError = ref<string | null>(null)
const audioUrl = ref<string | null>(null)
const audioPlayer = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const playbackError = ref<string | null>(null)

let timer: ReturnType<typeof setInterval> | null = null
let mediaRecorder: MediaRecorder | null = null
let stream: MediaStream | null = null
let chunks: BlobPart[] = []
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
  playbackError.value = null
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioUrl.value = null

  if (
    !import.meta.client ||
    !navigator.mediaDevices?.getUserMedia ||
    !('MediaRecorder' in window)
  ) {
    recorderError.value = t('speaking.recorder.errors.unsupported')
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
      recorderError.value = t('speaking.recorder.errors.recordingFailed')
      emit('recordingChange', false)
    }
    recorder.onstop = () => {
      if (disposed) return

      if (!chunks.length) {
        releaseStream()
        phase.value = 'ready'
        recorderError.value = t('speaking.recorder.errors.noAudio')
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
    recorderError.value = t('speaking.recorder.errors.stoppedEarly')
    emit('recordingChange', false)
  }
}

function reset() {
  stopTimer()
  releaseStream()
  stopping = false
  stopPlayback()
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }
  seconds.value = 0
  recorderError.value = null
  phase.value = 'ready'
}

async function togglePlayback(): Promise<void> {
  const player = audioPlayer.value
  if (!audioUrl.value || !player) return

  playbackError.value = null
  if (!player.paused) {
    player.pause()
    return
  }

  try {
    await player.play()
  } catch {
    isPlaying.value = false
    playbackError.value = t('speaking.recorder.errors.playbackFailed')
  }
}

function stopPlayback(): void {
  const player = audioPlayer.value
  if (player) {
    player.pause()
    player.currentTime = 0
  }
  isPlaying.value = false
}

function onPlaybackError(): void {
  isPlaying.value = false
  playbackError.value = t('speaking.recorder.errors.playbackFailed')
}

function releaseStream() {
  stream?.getTracks().forEach(track => track.stop())
  stream = null
  mediaRecorder = null
}

function microphoneErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return t('speaking.recorder.errors.micDenied')
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return t('speaking.recorder.errors.micNotFound')
    }
  }
  return t('speaking.recorder.errors.micFailed')
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
  stopPlayback()
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
})

defineExpose({ phase })
</script>
