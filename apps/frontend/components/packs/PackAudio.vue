<template>
  <div class="space-y-2">
    <audio ref="player" :src="src" @ended="playing = false; resumable = false" @error="playing = false" />
    <button
      class="btn btn-outline btn-sm"
      :disabled="!playing && !resumable && limit !== undefined && used >= limit"
      @click="toggle"
    >
      {{ playing ? 'Pause audio' : 'Play audio' }}
    </button>
    <span v-if="limit !== undefined" class="text-sm text-base-content/60"
      >{{ Math.max(0, limit - used) }} plays remaining</span
    >
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ src: string; limit?: number | undefined; used: number }>()
const emit = defineEmits<{ played: [] }>()
const player = ref<HTMLAudioElement>()
const playing = ref(false)
const resumable = ref(false)
async function toggle() {
  const audio = player.value
  if (!audio) return
  if (playing.value) {
    audio.pause()
    playing.value = false
    return
  }
  const isNewPlay = !resumable.value
  if (isNewPlay && props.limit !== undefined && props.used >= props.limit) return
  try {
    await audio.play()
    playing.value = true
    resumable.value = true
    if (isNewPlay) emit('played')
  } catch {
    playing.value = false
  }
}
</script>
