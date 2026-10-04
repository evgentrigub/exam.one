import type { VoiceModelDto, VoiceModelsDto } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'
import { useMediaFiles } from '~/composables/useMediaFiles'

const POLL_MS = 1000

/**
 * Settings → Generated files → Voice models. Downloads run on the TTS service; while any is
 * in progress the list is polled every second until none is left, or the page unmounts.
 */
export function useVoiceModels() {
  const state = useState<VoiceModelsDto | null>('media-voices', () => null)
  const error = ref<string | null>(null)
  const busy = ref<Set<string>>(new Set())
  const { loadSummary } = useMediaFiles()
  let timer: ReturnType<typeof setTimeout> | null = null
  let active = true

  const voices = computed<VoiceModelDto[]>(() => state.value?.voices ?? [])
  const online = computed(() => state.value?.online ?? true)
  const downloading = computed(() =>
    voices.value.some(voice => voice.progress?.state === 'downloading')
  )

  function stopPolling(): void {
    if (timer) clearTimeout(timer)
    timer = null
  }

  function schedule(keepPolling: boolean): void {
    stopPolling()
    if (active && (keepPolling || downloading.value)) timer = setTimeout(() => void load(), POLL_MS)
  }

  async function load(): Promise<void> {
    const wasDownloading = downloading.value
    let reachable = false
    try {
      const next = await apiFetch<VoiceModelsDto>('/media/voices')
      reachable = next.online
      // A busy or briefly unreachable TTS must not wipe the list mid-download.
      if (reachable || !wasDownloading) state.value = next
      error.value = null
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    }
    if (reachable && wasDownloading && !downloading.value) await loadSummary()
    schedule(wasDownloading && !reachable)
  }

  async function run(voiceId: string, action: () => Promise<unknown>): Promise<void> {
    busy.value = new Set([...busy.value, voiceId])
    error.value = null
    try {
      await action()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      busy.value = new Set([...busy.value].filter(id => id !== voiceId))
    }
    await load()
  }

  const download = (voiceId: string) =>
    run(voiceId, () =>
      apiFetch(`/media/voices/${encodeURIComponent(voiceId)}/download`, { method: 'POST' })
    )

  const cancel = (voiceId: string) =>
    run(voiceId, () =>
      apiFetch(`/media/voices/${encodeURIComponent(voiceId)}/download`, { method: 'DELETE' })
    )

  const remove = (voiceId: string) =>
    run(voiceId, async () => {
      await apiFetch(`/media/voices/${encodeURIComponent(voiceId)}`, { method: 'DELETE' })
      await loadSummary()
    })

  const setDefault = (lang: string, voiceId: string) =>
    run(voiceId, () =>
      apiFetch('/media/voices/default', { method: 'PUT', body: { lang, voiceId } })
    )

  onBeforeUnmount(() => {
    active = false
    stopPolling()
  })

  return { state, voices, online, error, busy, load, download, cancel, remove, setDefault }
}
