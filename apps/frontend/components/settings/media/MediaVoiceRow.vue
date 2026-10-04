<template>
  <div class="flex items-center gap-3 px-4 py-3">
    <div
      class="grid size-8 place-items-center rounded-full shrink-0"
      :class="voice.installed ? 'bg-primary/10 text-primary' : 'bg-base-200 text-base-content/40'"
    >
      <Mic :size="14" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">{{ voice.name }}</span>
        <span v-if="voice.isDefault" class="badge badge-sm badge-primary">{{
          $t('settings.voicesDefault')
        }}</span>
      </div>
      <div class="text-xs text-base-content/55 mt-0.5">{{ description }}</div>
      <div v-if="downloading" class="mt-2 flex items-center gap-2 max-w-xs">
        <div class="h-1.5 flex-1 rounded-full bg-base-200 overflow-hidden">
          <div
            class="h-full bg-primary transition-[width] duration-200"
            :style="{ width: `${voice.progress!.percent}%` }"
          />
        </div>
        <span class="text-[11px] font-mono text-base-content/55 w-8 text-right">
          {{ Math.round(voice.progress!.percent) }}%
        </span>
      </div>
      <p v-else-if="voice.progress?.state === 'failed'" class="mt-1 text-xs text-error">
        {{ $t('settings.voicesFailed', { error: voice.progress.error ?? '' }) }}
      </p>
    </div>
    <div class="shrink-0 flex items-center gap-1.5">
      <template v-if="voice.installed">
        <button
          v-if="!voice.isDefault"
          type="button"
          class="btn btn-ghost btn-xs rounded-field"
          :disabled="busy"
          @click="emit('setDefault')"
        >
          {{ $t('settings.voicesSetDefault') }}
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-sm btn-square rounded-field text-base-content/50 hover:text-error"
          :disabled="busy"
          :aria-label="$t('settings.voicesDelete', { name: voice.name })"
          @click="emit('remove')"
        >
          <Trash2 :size="15" />
        </button>
      </template>
      <button
        v-else-if="downloading"
        type="button"
        class="btn btn-ghost btn-xs rounded-field"
        :disabled="busy"
        @click="emit('cancel')"
      >
        {{ $t('settings.cancel') }}
      </button>
      <button
        v-else
        type="button"
        class="btn btn-outline btn-xs rounded-field gap-1"
        :disabled="busy"
        @click="emit('download')"
      >
        <Download :size="12" /> {{ $t('settings.voicesDownload') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Mic, Trash2 } from 'lucide-vue-next'
import type { VoiceModelDto } from '@exam-one/contracts'
import { fmtBytes } from '~/utils/fmtBytes'

const props = defineProps<{ voice: VoiceModelDto; busy: boolean }>()
const emit = defineEmits<{ download: []; cancel: []; remove: []; setDefault: [] }>()
const { t } = useI18n()

const downloading = computed(() => props.voice.progress?.state === 'downloading')
const description = computed(() => {
  const gender = t(
    props.voice.gender === 'female' ? 'settings.voicesFemale' : 'settings.voicesMale'
  )
  const who = props.voice.accent ? `${gender} · ${props.voice.accent}` : gender
  const quality = t('settings.voicesQuality', {
    quality: t(`settings.voicesQuality_${props.voice.quality}`),
  })
  return `${who} · ${quality} · ${fmtBytes(props.voice.sizeBytes)}`
})
</script>
