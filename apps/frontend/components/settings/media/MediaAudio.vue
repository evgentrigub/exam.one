<template>
  <SetCard>
    <SetHead :title="$t('settings.audioTitle')" :desc="$t('settings.audioDesc')" />

    <div class="flex flex-wrap items-center gap-2 mb-3">
      <button
        v-for="chip in chips"
        :key="chip.id"
        type="button"
        class="btn btn-xs rounded-full gap-1.5"
        :class="filter === chip.id ? 'btn-primary' : 'btn-ghost border border-base-300'"
        @click="filter = chip.id"
      >
        {{ $t(chip.labelKey) }}<span class="opacity-60 font-mono">{{ chip.count }}</span>
      </button>
      <span class="mx-1 h-4 w-px bg-base-300" aria-hidden="true" />
      <button
        type="button"
        class="btn btn-xs rounded-full gap-1.5"
        :class="completedOnly ? 'btn-primary' : 'btn-ghost border border-base-300'"
        :aria-pressed="completedOnly"
        @click="completedOnly = !completedOnly"
      >
        {{ $t('settings.mediaCompleted')
        }}<span class="opacity-60 font-mono">{{ completedCount }}</span>
      </button>
    </div>

    <p v-if="error" class="mb-3 text-sm text-error">{{ error }}</p>

    <div
      v-if="shown.length === 0"
      class="rounded-field bg-base-200/60 py-10 text-center text-sm text-base-content/55"
    >
      {{ emptyText }}
    </div>
    <div v-else class="rounded-field border border-base-300">
      <div
        class="flex items-center gap-3 px-4 h-11 border-b border-base-300 bg-base-200/40 text-xs text-base-content/60"
      >
        <input
          type="checkbox"
          class="checkbox checkbox-sm"
          :checked="allSelected"
          :aria-label="$t('settings.audioSelectAll')"
          @change="toggleAll"
        />
        <span>
          {{
            selectedShown.length
              ? $t('settings.audioSelected', { n: selectedShown.length })
              : $t(
                  'settings.audioSummary',
                  { n: shown.length, size: fmtBytes(shownBytes) },
                  shown.length
                )
          }}
        </span>
        <div class="ml-auto flex items-center gap-2">
          <button
            v-if="selectedShown.length > 0"
            type="button"
            class="btn btn-xs btn-error rounded-field gap-1"
            :disabled="deleting"
            @click="remove(selectedShown)"
          >
            <Trash2 :size="12" /> {{ $t('settings.audioDeleteSelected') }}
          </button>
          <button
            v-if="selectedShown.length === 0 && !confirmAll"
            type="button"
            class="btn btn-xs btn-ghost text-error rounded-field gap-1"
            @click="confirmAll = true"
          >
            <Trash2 :size="12" /> {{ $t('settings.audioDeleteAll') }}
          </button>
          <template v-if="confirmAll && selectedShown.length === 0">
            <span class="text-base-content/70">
              {{ $t('settings.audioDeleteConfirm', { n: shown.length }, shown.length) }}
            </span>
            <button
              type="button"
              class="btn btn-xs btn-error rounded-field"
              :disabled="deleting"
              @click="deleteAllShown"
            >
              {{ $t('settings.audioDelete') }}
            </button>
            <button
              type="button"
              class="btn btn-xs btn-ghost rounded-field"
              @click="confirmAll = false"
            >
              {{ $t('settings.cancel') }}
            </button>
          </template>
        </div>
      </div>
      <div class="divide-y divide-base-300">
        <MediaAudioRow
          v-for="row in shown"
          :key="row.id"
          :row="row"
          :selected="selected.includes(row.id)"
          :playing="playing === row.id"
          @toggle="toggle(row.id)"
          @play="togglePlay(row)"
          @remove="remove([row.id])"
        />
      </div>
    </div>
  </SetCard>
</template>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import type { MediaAudioRowDto } from '@exam-one/contracts'
import { MEDIA_LANGUAGES, mediaLanguage } from '~/data/account/mediaLanguages'
import { useMediaFiles } from '~/composables/useMediaFiles'
import { fmtBytes } from '~/utils/fmtBytes'

const { t } = useI18n()
const { rows, loaded, loading, error, loadAudio, removeAudio } = useMediaFiles()

const filter = ref<string>('all')
const completedOnly = ref(false)
const selected = ref<string[]>([])
const playing = ref<string | null>(null)
const confirmAll = ref(false)
const deleting = ref(false)

const byCompletion = computed(() =>
  completedOnly.value ? rows.value.filter(row => row.completed) : rows.value
)
const chips = computed(() => [
  { id: 'all', labelKey: 'settings.mediaAll', count: byCompletion.value.length },
  ...MEDIA_LANGUAGES.map(language => ({
    id: language.id as string,
    labelKey: language.labelKey as string,
    count: byCompletion.value.filter(row => row.lang === language.id).length,
  })),
])
const inLanguage = computed(() =>
  filter.value === 'all' ? rows.value : rows.value.filter(row => row.lang === filter.value)
)
const completedCount = computed(() => inLanguage.value.filter(row => row.completed).length)
const shown = computed(() =>
  completedOnly.value ? inLanguage.value.filter(row => row.completed) : inLanguage.value
)
const shownBytes = computed(() => shown.value.reduce((sum, row) => sum + row.bytes, 0))
const selectedShown = computed(() =>
  selected.value.filter(id => shown.value.some(row => row.id === id))
)
const allSelected = computed(
  () => shown.value.length > 0 && shown.value.every(row => selected.value.includes(row.id))
)

const emptyText = computed(() => {
  if (loading.value && !loaded.value) return t('settings.audioLoading')
  const language = filter.value === 'all' ? undefined : mediaLanguage(filter.value)
  return language
    ? t('settings.audioEmptyFor', { lang: t(language.labelKey) })
    : t('settings.audioEmpty')
})

watch([filter, completedOnly], () => {
  confirmAll.value = false
})

function toggle(id: string): void {
  selected.value = selected.value.includes(id)
    ? selected.value.filter(x => x !== id)
    : [...selected.value, id]
}

function toggleAll(): void {
  const ids = shown.value.map(row => row.id)
  selected.value = allSelected.value
    ? selected.value.filter(id => !ids.includes(id))
    : [...new Set([...selected.value, ...ids])]
}

// ---- playback: one element, a row's files back to back ------------------------------------
let audio: HTMLAudioElement | null = null
let queue: string[] = []

function stop(): void {
  audio?.pause()
  audio = null
  queue = []
  playing.value = null
}

function playNext(): void {
  const next = queue.shift()
  if (!next) return stop()
  const element = new Audio(next)
  audio = element
  // Only the element still playing may stop playback; a superseded one rejects with AbortError.
  const stopIfCurrent = (): void => {
    if (audio === element) stop()
  }
  element.addEventListener('ended', () => audio === element && playNext(), { once: true })
  element.addEventListener('error', stopIfCurrent, { once: true })
  element.play().catch(stopIfCurrent)
}

function togglePlay(row: MediaAudioRowDto): void {
  const same = playing.value === row.id
  stop()
  if (same) return
  playing.value = row.id
  queue = [...row.urls]
  playNext()
}

async function remove(ids: string[]): Promise<void> {
  if (!ids.length) return
  if (playing.value && ids.includes(playing.value)) stop()
  deleting.value = true
  try {
    const result = await removeAudio(ids)
    if (result) selected.value = selected.value.filter(id => !ids.includes(id))
  } finally {
    deleting.value = false
  }
}

async function deleteAllShown(): Promise<void> {
  await remove(shown.value.map(row => row.id))
  confirmAll.value = false
}

onMounted(() => void loadAudio())
onBeforeUnmount(stop)
</script>
