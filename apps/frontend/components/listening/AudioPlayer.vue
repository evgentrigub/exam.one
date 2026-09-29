<template>
  <div class="bg-base-100 rounded-box border border-base-300/70 p-5">
    <!-- Artwork + label -->
    <div class="flex items-start gap-3">
      <div class="min-w-0">
        <p class="font-semibold text-sm leading-tight truncate">{{ label }}</p>
      </div>
    </div>

    <!-- Scrubber -->
    <div class="mt-5 flex items-center gap-5">
      <button
        type="button"
        class="w-9 h-9 rounded-full bg-info text-info-content grid place-items-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="(!canPlay && !playing) || !!disabled"
        :title="disabled ? $t('listening.audioUnavailable') : playing ? $t('listening.pause') : $t('listening.play')"
        @click="toggle"
      >
        <Pause v-if="playing" :size="14" />
        <Play v-else :size="14" />
      </button>
      <div class="flex-1">
        <input
          type="range"
          :min="0"
          :max="effectiveDurationSec"
          step="0.1"
          :value="currentSec"
          class="w-full accent-info disabled:opacity-40"
          :disabled="!!disabled || !!disableSeeking"
          @input="seekTo(Number(($event.target as HTMLInputElement).value))"
        />
        <div class="flex justify-between font-mono text-[11px] text-base-content/60 mt-1">
          <span>{{ fmt(currentSec) }}</span>
          <span>{{ fmt(effectiveDurationSec) }}</span>
        </div>
      </div>
    </div>

    <p v-if="maxPlays" class="mt-2 text-[11px] text-base-content/50">
      {{ $t('listening.plays', { count: playCount, max: maxPlays }) }}
    </p>

    <!-- Controls row -->
    <div class="mt-4 pt-4 border-t border-base-300/70 flex items-center gap-3">
      <template v-if="!hideVolumeSpeed">
        <Volume2 :size="13" class="text-base-content/50 shrink-0" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="effectiveVolume"
          class="flex-1 accent-info min-w-0 disabled:opacity-40"
          :disabled="!!disabled"
          @input="onVolumeInput(Number(($event.target as HTMLInputElement).value))"
        />

        <div class="join">
          <button
            v-for="s in speeds"
            :key="s"
            type="button"
            class="join-item btn btn-xs"
            :class="effectiveSpeed === s ? 'btn-info text-info-content' : 'btn-ghost'"
            :disabled="!!disabled"
            @click="onSpeedInput(s)"
          >
            {{ s }}x
          </button>
        </div>
      </template>
    </div>

    <!-- Transcript (revealed after submit) -->
    <div
      v-if="revealTranscript"
      class="mt-4 p-3 rounded-field bg-base-200/60 border border-base-300/70"
    >
      <p class="text-[10px] uppercase tracking-wider font-semibold text-base-content/50 mb-1">
        {{ $t('pastExams.transcript') }}
      </p>
      <p class="text-sm leading-relaxed whitespace-pre-line">{{ transcript }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Play, Pause, Volume2 } from 'lucide-vue-next'

const speeds = [0.75, 1, 1.25] as const

const props = withDefaults(
  defineProps<{
    transcript: string
    label?: string
    /** Public URL to a pre-generated audio file (e.g. /audio/listening/a2/...). */
    src?: string
    durationSec?: number
    revealTranscript?: boolean
    /** When true, only play + scrubber are shown (volume/speed live in the sidebar). */
    hideVolumeSpeed?: boolean
    /** Controlled volume from parent (0–1). */
    volume?: number
    /** Controlled playback rate from parent. */
    speed?: number
    /** Stable id for exclusive playback coordination. */
    playerId?: string
    /** Currently active player id from the session (exclusive play). */
    activePlayerId?: string | null
    /** Disable play/scrub/controls (e.g. when audio files are missing). */
    disabled?: boolean
    /** Optional exam replay cap. Pausing and resuming the same play does not consume another play. */
    maxPlays?: number | null
    disableSeeking?: boolean
  }>(),
  {
    label: 'Audio',
    src: '',
    durationSec: 0,
    revealTranscript: false,
    hideVolumeSpeed: false,
    volume: 0.6,
    speed: 1,
    playerId: '',
    activePlayerId: null,
    disabled: false,
    maxPlays: null,
    disableSeeking: false,
  }
)

const emit = defineEmits<{
  'update:volume': [value: number]
  'update:speed': [value: number]
  play: [playerId: string]
  pause: [playerId: string]
  'audio-unavailable': []
}>()

const playing = ref(false)
const currentSec = ref(0)
const mediaReady = ref(false)
const mediaFailed = ref(false)
const mediaDurationSec = ref(0)
const playCount = ref(0)

let timer: ReturnType<typeof setInterval> | null = null
let audioEl: HTMLAudioElement | null = null

const effectiveVolume = computed(() => props.volume)
const effectiveSpeed = computed(() => props.speed)

const useRealAudio = computed(() => Boolean(props.src) && !mediaFailed.value && mediaReady.value)

const simulatedDurationSec = computed(() =>
  props.durationSec > 0
    ? props.durationSec
    : Math.min(180, Math.max(30, Math.round(props.transcript.length / 13)))
)

const effectiveDurationSec = computed(() =>
  useRealAudio.value && mediaDurationSec.value > 0
    ? mediaDurationSec.value
    : simulatedDurationSec.value
)

const canPlay = computed(() => {
  if (props.disabled) return false
  if (!props.maxPlays) return true
  const resuming = currentSec.value > 0 && currentSec.value < effectiveDurationSec.value
  return resuming || playCount.value < props.maxPlays
})

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startSimulatedTimer() {
  stopTimer()
  timer = setInterval(() => {
    currentSec.value += 0.25 * effectiveSpeed.value
    if (currentSec.value >= effectiveDurationSec.value) {
      currentSec.value = effectiveDurationSec.value
      finishPlayback()
    }
  }, 250)
}

function finishPlayback() {
  stopTimer()
  playing.value = false
  if (audioEl) {
    audioEl.pause()
  }
  if (props.playerId) {
    emit('pause', props.playerId)
  }
}

function applyAudioSettings() {
  if (!audioEl) return
  audioEl.volume = effectiveVolume.value
  audioEl.playbackRate = effectiveSpeed.value
}

function detachAudio() {
  if (!audioEl) return
  audioEl.pause()
  audioEl.removeEventListener('timeupdate', onTimeUpdate)
  audioEl.removeEventListener('ended', onEnded)
  audioEl.removeEventListener('loadedmetadata', onLoadedMetadata)
  audioEl.removeEventListener('error', onError)
  audioEl.src = ''
  audioEl = null
}

function onTimeUpdate() {
  if (!audioEl) return
  currentSec.value = audioEl.currentTime
}

function onEnded() {
  currentSec.value = effectiveDurationSec.value
  finishPlayback()
}

function onLoadedMetadata() {
  if (!audioEl) return
  mediaDurationSec.value = Number.isFinite(audioEl.duration) ? audioEl.duration : 0
  mediaReady.value = true
  mediaFailed.value = false
  applyAudioSettings()
}

function onError() {
  mediaFailed.value = true
  mediaReady.value = false
  playing.value = false
  stopTimer()
  emit('audio-unavailable')
}

function attachAudio(src: string) {
  if (!import.meta.client) return
  detachAudio()
  mediaReady.value = false
  mediaFailed.value = false
  mediaDurationSec.value = 0
  currentSec.value = 0
  playing.value = false
  playCount.value = 0

  const el = new Audio(src)
  el.preload = 'metadata'
  el.addEventListener('timeupdate', onTimeUpdate)
  el.addEventListener('ended', onEnded)
  el.addEventListener('loadedmetadata', onLoadedMetadata)
  el.addEventListener('error', onError)
  audioEl = el
  applyAudioSettings()
  el.load()
}

function pausePlayback() {
  if (!playing.value) return
  if (useRealAudio.value && audioEl) {
    audioEl.pause()
  } else {
    stopTimer()
  }
  playing.value = false
  if (props.playerId) {
    emit('pause', props.playerId)
  }
}

function toggle() {
  if (props.disabled) return
  if (playing.value) {
    pausePlayback()
    return
  }

  if (!canPlay.value) return

  const isNewPlay = currentSec.value <= 0 || currentSec.value >= effectiveDurationSec.value - 0.05
  if (isNewPlay && props.maxPlays) playCount.value += 1

  if (props.playerId) {
    emit('play', props.playerId)
  }

  if (useRealAudio.value && audioEl) {
    if (currentSec.value >= effectiveDurationSec.value - 0.05) {
      audioEl.currentTime = 0
      currentSec.value = 0
    }
    applyAudioSettings()
    void audioEl
      .play()
      .then(() => {
        playing.value = true
      })
      .catch(() => {
        mediaFailed.value = true
        playing.value = true
        startSimulatedTimer()
        emit('audio-unavailable')
      })
    return
  }

  if (currentSec.value >= effectiveDurationSec.value) currentSec.value = 0
  playing.value = true
  startSimulatedTimer()
}

function seekTo(sec: number) {
  if (props.disabled || props.disableSeeking) return
  const next = Math.min(Math.max(0, sec), effectiveDurationSec.value)
  currentSec.value = next
  if (useRealAudio.value && audioEl) {
    audioEl.currentTime = next
  }
}

function onVolumeInput(value: number) {
  if (props.disabled) return
  emit('update:volume', value)
  applyAudioSettings()
}

function onSpeedInput(value: number) {
  if (props.disabled) return
  emit('update:speed', value)
  applyAudioSettings()
}

watch(
  () => props.src,
  src => {
    stopTimer()
    playing.value = false
    currentSec.value = 0
    if (src) {
      attachAudio(src)
    } else {
      detachAudio()
      mediaReady.value = false
      mediaFailed.value = false
      mediaDurationSec.value = 0
      emit('audio-unavailable')
    }
  },
  { immediate: true }
)

watch(
  () => [effectiveVolume.value, effectiveSpeed.value] as const,
  () => {
    applyAudioSettings()
  }
)

watch(
  () => props.activePlayerId,
  activeId => {
    if (!props.playerId || !playing.value) return
    if (activeId !== null && activeId !== props.playerId) {
      pausePlayback()
    }
  }
)

watch(
  () => props.disabled,
  locked => {
    if (locked && playing.value) {
      pausePlayback()
    }
  }
)

onUnmounted(() => {
  stopTimer()
  detachAudio()
})

defineExpose({ pausePlayback })
</script>
