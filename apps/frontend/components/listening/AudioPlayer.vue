<template>
  <div class="bg-base-100 rounded-box border border-base-300/70 p-5">
    <!-- Artwork + label -->
    <div class="flex items-start gap-3">
      <div
        class="w-12 h-12 rounded-box shrink-0 grid place-items-center bg-listening-soft"
      >
        <AudioWaveform :size="18" class="text-listening" />
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-sm leading-tight truncate">{{ label }}</p>
        <p class="text-xs text-base-content/60 mt-0.5">
          {{ playsLeft > 0 ? `${playsLeft} ${playsLeft === 1 ? 'play' : 'plays'} left` : 'No plays left' }}
          · simulated audio
        </p>
      </div>
    </div>

    <!-- Scrubber -->
    <div class="mt-5">
      <input
        type="range"
        :min="0"
        :max="durationSec"
        :value="currentSec"
        class="w-full accent-info"
        @input="seekTo(Number(($event.target as HTMLInputElement).value))"
      >
      <div class="flex justify-between font-mono text-[11px] text-base-content/60 mt-1">
        <span>{{ fmt(currentSec) }}</span>
        <span>{{ fmt(durationSec) }}</span>
      </div>
    </div>

    <!-- Controls row -->
    <div class="mt-4 pt-4 border-t border-base-300/70 flex items-center gap-3">
      <!-- Play/Pause -->
      <button
        type="button"
        class="w-9 h-9 rounded-full bg-info text-info-content grid place-items-center shrink-0"
        :disabled="!canPlay && !playing"
        :title="playing ? 'Pause' : 'Play'"
        @click="toggle"
      >
        <Pause v-if="playing" :size="14" />
        <Play v-else :size="14" />
      </button>

      <!-- Volume icon + slider (visual only) -->
      <Volume2 :size="13" class="text-base-content/50 shrink-0" />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="volume"
        class="flex-1 accent-info min-w-0"
        @input="volume = Number(($event.target as HTMLInputElement).value)"
      >

      <!-- Speed segmented control -->
      <div class="join">
        <button
          v-for="s in speeds"
          :key="s"
          type="button"
          class="join-item btn btn-xs"
          :class="speed === s ? 'btn-info text-info-content' : 'btn-ghost'"
          @click="speed = s"
        >
          {{ s }}x
        </button>
      </div>
    </div>

    <!-- Transcript (revealed after submit) -->
    <div v-if="revealTranscript" class="mt-4 p-3 rounded-field bg-base-200/60 border border-base-300/70">
      <p class="text-[10px] uppercase tracking-wider font-semibold text-base-content/50 mb-1">Transcript</p>
      <p class="text-sm leading-relaxed whitespace-pre-line">{{ transcript }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AudioWaveform, Play, Pause, Volume2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  transcript: string
  label?: string
  durationSec?: number
  replayLimit?: number
  revealTranscript?: boolean
}>(), {
  label: 'Audio',
  durationSec: 0,
  replayLimit: 2,
  revealTranscript: false,
})

// Derive a believable duration from transcript length when none is supplied
// (~13 spoken chars/sec), clamped to a sensible range.
const durationSec = computed(() =>
  props.durationSec > 0
    ? props.durationSec
    : Math.min(180, Math.max(30, Math.round(props.transcript.length / 13))),
)

const speeds = [0.75, 1, 1.25] as const
const speed = ref<number>(1)
const playing = ref(false)
const currentSec = ref(0)
const plays = ref(0)
const volume = ref(0.6)

let timer: ReturnType<typeof setInterval> | null = null

const playsLeft = computed(() => Math.max(0, props.replayLimit - plays.value))
const canPlay = computed(() => playsLeft.value > 0)

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

function startTimer() {
  stopTimer()
  // 250ms tick scaled by playback speed (simulated playback).
  timer = setInterval(() => {
    currentSec.value += 0.25 * speed.value
    if (currentSec.value >= durationSec.value) {
      currentSec.value = durationSec.value
      finishPlayback()
    }
  }, 250)
}

function finishPlayback() {
  stopTimer()
  playing.value = false
  plays.value += 1
}

function toggle() {
  if (playing.value) {
    stopTimer()
    playing.value = false
    return
  }
  if (!canPlay.value) return
  if (currentSec.value >= durationSec.value) currentSec.value = 0
  playing.value = true
  startTimer()
}

function seekTo(sec: number) {
  currentSec.value = Math.min(sec, durationSec.value)
}

onUnmounted(stopTimer)
</script>
