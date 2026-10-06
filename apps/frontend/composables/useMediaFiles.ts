import type {
  MediaAudioDeleteResultDto,
  MediaAudioListDto,
  MediaAudioRowDto,
  MediaSummaryDto,
} from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'

/**
 * Settings → Generated files: the overview totals and the listening audio list. The list
 * spans every pack, so it is not reset when the active pack changes; it is shared state so
 * switching between the two sub-pages keeps it.
 */
const summary = () => useState<MediaSummaryDto | null>('media-summary', () => null)
const rows = () => useState<MediaAudioRowDto[]>('media-audio-rows', () => [])
const audioLoaded = () => useState<boolean>('media-audio-loaded', () => false)

export function useMediaFiles() {
  const summaryState = summary()
  const rowState = rows()
  const loaded = audioLoaded()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadSummary(): Promise<void> {
    try {
      summaryState.value = await apiFetch<MediaSummaryDto>('/media/summary')
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    }
  }

  async function loadAudio(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch<MediaAudioListDto>('/media/audio')
      rowState.value = data.rows
      loaded.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      loading.value = false
    }
  }

  /** Delete rows, drop them from the list right away, then refresh the totals. */
  async function removeAudio(ids: readonly string[]): Promise<MediaAudioDeleteResultDto | null> {
    if (!ids.length) return null
    error.value = null
    try {
      const result = await apiFetch<MediaAudioDeleteResultDto>('/media/audio/delete', {
        method: 'POST',
        body: { ids: [...ids] },
      })
      const removed = new Set(ids)
      rowState.value = rowState.value.filter(row => !removed.has(row.id))
      await loadSummary()
      return result
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
      await loadAudio()
      return null
    }
  }

  return {
    summary: summaryState,
    rows: rowState,
    loaded,
    loading,
    error,
    loadSummary,
    loadAudio,
    removeAudio,
  }
}
