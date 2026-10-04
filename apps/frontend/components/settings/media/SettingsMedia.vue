<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.mediaTitle')" :desc="$t('settings.mediaDesc')" />
      <div class="flex items-baseline gap-2">
        <span class="font-display text-2xl font-bold">{{ fmtBytes(voiceBytes + audioBytes) }}</span>
        <span class="text-sm text-base-content/55">{{ $t('settings.mediaUsed') }}</span>
      </div>
      <div class="mt-3 h-2 rounded-full bg-base-200 overflow-hidden flex">
        <div class="h-full bg-primary" :style="{ width: `${(voiceBytes / total) * 100}%` }" />
        <div class="h-full bg-primary/40" :style="{ width: `${(audioBytes / total) * 100}%` }" />
      </div>
      <div class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span class="flex items-center gap-2">
          <span class="size-2.5 rounded-full bg-primary" />{{ $t('settings.mediaVoiceModels') }}
          <span class="font-mono text-base-content/60">{{ fmtBytes(voiceBytes) }}</span>
        </span>
        <span class="flex items-center gap-2">
          <span class="size-2.5 rounded-full bg-primary/40" />{{
            $t('settings.mediaListeningAudio')
          }}
          <span class="font-mono text-base-content/60">{{ fmtBytes(audioBytes) }}</span>
        </span>
      </div>
    </SetCard>
    <MediaVoices v-if="view === 'voices'" />
    <MediaAudio v-else />
  </div>
</template>

<script setup lang="ts">
import { fmtBytes } from '~/utils/fmtBytes'
import { useMediaFiles } from '~/composables/useMediaFiles'

defineProps<{ view: 'audio' | 'voices' }>()

const { summary, loadSummary } = useMediaFiles()
const voiceBytes = computed(() => summary.value?.voiceBytes ?? 0)
const audioBytes = computed(() => summary.value?.audioBytes ?? 0)
const total = computed(() => voiceBytes.value + audioBytes.value || 1)

onMounted(() => void loadSummary())
</script>
