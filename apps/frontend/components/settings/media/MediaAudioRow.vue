<template>
  <div class="flex items-center gap-3 px-4 py-3" :class="selected ? 'bg-primary/5' : ''">
    <input
      type="checkbox"
      class="checkbox checkbox-sm"
      :checked="selected"
      :aria-label="$t('settings.audioSelectRow', { title: row.title })"
      @change="emit('toggle')"
    />
    <button
      type="button"
      class="grid size-8 place-items-center rounded-full shrink-0"
      :class="playing ? 'bg-primary text-primary-content' : 'bg-base-200 hover:bg-base-300'"
      :aria-label="playing ? $t('settings.audioPause') : $t('settings.audioPlay')"
      @click="emit('play')"
    >
      <component :is="playing ? Pause : Play" :size="13" />
    </button>
    <div class="min-w-0 flex-1">
      <div class="text-sm font-medium truncate" :title="row.hostPath">{{ row.title }}</div>
      <div class="flex flex-wrap items-center gap-1.5 text-xs text-base-content/55 mt-0.5">
        <MediaLangChip :lang="row.lang" />
        {{ meta }}
        <span v-if="row.completed" class="badge badge-xs badge-soft badge-success">
          {{ $t('settings.mediaCompleted') }}
        </span>
        <span v-if="row.origin === 'mock'" class="badge badge-xs badge-ghost">
          {{ $t('settings.mediaMock') }}
        </span>
      </div>
    </div>
    <div class="hidden sm:block text-right text-xs text-base-content/55 font-mono shrink-0 w-24">
      <div>{{ fmtBytes(row.bytes) }}</div>
      <div>{{ date }}</div>
    </div>
    <button
      type="button"
      class="btn btn-ghost btn-sm btn-square rounded-field text-base-content/50 hover:text-error"
      :aria-label="$t('settings.audioDeleteRow', { title: row.title })"
      @click="emit('remove')"
    >
      <Trash2 :size="15" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Pause, Play, Trash2 } from 'lucide-vue-next'
import type { MediaAudioRowDto } from '@exam-one/contracts'
import { fmtBytes, fmtDuration } from '~/utils/fmtBytes'

const props = defineProps<{ row: MediaAudioRowDto; selected: boolean; playing: boolean }>()
const emit = defineEmits<{ toggle: []; play: []; remove: [] }>()
const { locale } = useI18n()

const meta = computed(() =>
  [props.row.level, props.row.part, fmtDuration(props.row.durationSec)].filter(Boolean).join(' · ')
)
const date = computed(() =>
  new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' }).format(
    new Date(props.row.modifiedAt)
  )
)
</script>
