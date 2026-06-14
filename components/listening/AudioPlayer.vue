<template>
  <div class="rounded-box border border-base-300 bg-base-100 p-4">
    <!-- Artwork + label -->
    <div class="flex items-center gap-3 mb-3">
      <div class="w-11 h-11 rounded-selector bg-listening-soft flex items-center justify-center shrink-0">
        <Headphones :size="20" class="text-listening" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-semibold truncate">{{ label }}</p>
        <p class="text-[11px] text-base-content/50">
          {{ playsLeft > 0 ? `${playsLeft} ${playsLeft === 1 ? 'play' : 'plays'} left` : 'No plays left' }}
          · simulated audio
        </p>
      </div>
    </div>

    <!-- Scrubber -->
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="btn btn-circle btn-sm btn-info text-info-content"
        :disabled="!canPlay && !playing"
        :title="playing ? 'Pause' : 'Play'"
        @click="toggle"
      >
        <Pause v-if="playing" :size="15" />
        <Play v-else :size="15" />
      </button>
      <span class="font-mono text-[11px] text-base-content/60 w-9 text-right">{{ fmt(currentSec) }}</span>
      <div
        class="relative flex-1 h-1.5 rounded-full bg-base-content/15 overflow-hidden cursor-default"
      >
        <div class="absolute inset-y-0 left-0 bg-info rounded-full" :style="{ width: `${progressPct}%` }" />
      </div>
      <span class="font-mono text-[11px] text-base-content/40 w-9">{{ fmt(durationSec) }}</span>
    </div>

    <!-- Speed control -->
    <div class="flex items-center justify-between mt-3">
      <div class="join">
        <button
          v-for="s in speeds"
          :key="s"
          type="button"
          class="btn btn-xs join-item"
          :class="speed === s ? 'btn-info text-info-content' : 'btn-ghost'"
          @click="speed = s"
        >
          {{ s }}x
        </button>
      </div>
      <button
        type="button"
        class="btn btn-xs btn-ghost gap-1"
        :disabled="!canPlay"
        title="Replay from start"
        @click="replay"
      >
        <RotateCcw :size="12" />
        Replay
      </button>
    </div>

    <!-- Transcript (revealed after submit) -->
    <div v-if="revealTranscript" class="mt-3 p-3 rounded-field bg-base-200/60 border border-base-300/70">
      <p class="text-[10px] uppercase tracking-wider font-semibold text-base-content/50 mb-1">Transcript</p>
      <p class="text-sm leading-relaxed whitespace-pre-line">{{ transcript }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Headphones, Play, Pause, RotateCcw } from 'lucide-vue-next'

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

let timer: ReturnType<typeof setInterval> | null = null

const playsLeft = computed(() => Math.max(0, props.replayLimit - plays.value))
const canPlay = computed(() => playsLeft.value > 0)
const progressPct = computed(() => durationSec.value ? Math.min(100, (currentSec.value / durationSec.value) * 100) : 0)

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

function replay() {
  if (!canPlay.value) return
  currentSec.value = 0
  playing.value = true
  startTimer()
}

onUnmounted(stopTimer)
</script>
