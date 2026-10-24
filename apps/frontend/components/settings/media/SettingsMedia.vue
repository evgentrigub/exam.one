<template>
  <div class="flex flex-col gap-5">
    <SetCard>
      <SetHead :title="$t('settings.mediaTitle')" :desc="$t('settings.mediaDesc')" />
      <div :aria-busy="summaryLoading">
        <div class="flex items-baseline gap-2">
          <span v-if="computing" class="font-display text-2xl font-bold text-base-content/40">
            {{ $t('settings.mediaCalculating') }}
          </span>
          <template v-else>
            <span class="font-display text-2xl font-bold">{{
              fmtBytes(voiceBytes + audioBytes + sttBytes)
            }}</span>
            <span class="text-sm text-base-content/55">{{ $t('settings.mediaUsed') }}</span>
          </template>
        </div>
        <progress
          v-if="computing"
          class="progress progress-primary mt-3 h-2 w-full"
          :aria-label="$t('settings.mediaCalculating')"
        />
        <div
          v-else
          class="mt-3 h-2 rounded-full bg-base-200 overflow-hidden flex transition-opacity"
          :class="{ 'animate-pulse': summaryLoading }"
        >
          <div class="h-full bg-primary" :style="{ width: `${(voiceBytes / total) * 100}%` }" />
          <div class="h-full bg-secondary" :style="{ width: `${(sttBytes / total) * 100}%` }" />
          <div class="h-full bg-primary/40" :style="{ width: `${(audioBytes / total) * 100}%` }" />
        </div>
        <div class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-primary" />{{ $t('settings.mediaVoiceModels') }}
            <span v-if="computing" class="skeleton h-3.5 w-14" />
            <span v-else class="font-mono text-base-content/60">{{ fmtBytes(voiceBytes) }}</span>
          </span>
          <span class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-secondary" />{{ $t('settings.sttModelsTitle') }}
            <span v-if="computing" class="skeleton h-3.5 w-14" />
            <span v-else class="font-mono text-base-content/60">{{ fmtBytes(sttBytes) }}</span>
          </span>
          <span class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-primary/40" />{{
              $t('settings.mediaListeningAudio')
            }}
            <span v-if="computing" class="skeleton h-3.5 w-14" />
            <span v-else class="font-mono text-base-content/60">{{ fmtBytes(audioBytes) }}</span>
          </span>
        </div>
      </div>
    </SetCard>
    <MediaSttModels v-if="view === 'stt'" />
    <MediaVoices v-else-if="view === 'voices'" />
    <MediaAudio v-else />
  </div>
</template>

<script setup lang="ts">
import { fmtBytes } from '~/utils/fmtBytes'
import { useMediaFiles } from '~/composables/useMediaFiles'

defineProps<{ view: 'audio' | 'voices' | 'stt' }>()

const { summary, summaryLoading, error, loadSummary } = useMediaFiles()
const voiceBytes = computed(() => summary.value?.voiceBytes ?? 0)
const audioBytes = computed(() => summary.value?.audioBytes ?? 0)
const sttBytes = computed(() => summary.value?.sttBytes ?? 0)
const total = computed(() => voiceBytes.value + audioBytes.value + sttBytes.value || 1)
/** First computation: no totals to show yet, so the bar runs indeterminate until it lands or fails. */
const computing = computed(() => !summary.value && !error.value)

onMounted(() => void loadSummary())
</script>
