import type { SttModelsDto } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'
import { useMediaFiles } from '~/composables/useMediaFiles'

export function useSttModels() {
  const state = ref<SttModelsDto | null>(null)
  const error = ref<string | null>(null)
  const busy = ref(false)
  const { loadSummary } = useMediaFiles()
  let active = true
  let timer: ReturnType<typeof setTimeout> | undefined

  async function load(): Promise<void> {
    if (timer) clearTimeout(timer)
    const wasDownloading = state.value?.models.some(
      model => model.progress?.state === 'downloading'
    )
    try {
      state.value = await apiFetch<SttModelsDto>('/media/stt-models')
      if (
        wasDownloading &&
        state.value.online &&
        !state.value.models.some(model => model.progress?.state === 'downloading')
      )
        await loadSummary()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    }
    if (active) timer = setTimeout(() => void load(), 1500)
  }

  async function run(
    path: string,
    method: 'POST' | 'DELETE' | 'PUT',
    body?: object
  ): Promise<void> {
    busy.value = true
    error.value = null
    try {
      await apiFetch(`/media/stt-models${path}`, { method, ...(body ? { body } : {}) })
      await Promise.all([load(), loadSummary()])
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      busy.value = false
    }
  }

  onBeforeUnmount(() => {
    active = false
    if (timer) clearTimeout(timer)
  })

  return {
    // State
    state: readonly(state),
    error: readonly(error),
    busy: readonly(busy),
    // Methods
    load,
    download: (id: string) => run(`/${encodeURIComponent(id)}/download`, 'POST'),
    cancel: (id: string) => run(`/${encodeURIComponent(id)}/download`, 'DELETE'),
    remove: (id: string) => run(`/${encodeURIComponent(id)}`, 'DELETE'),
    prefer: (lang: string, modelId: string) => run('/preferred', 'PUT', { lang, modelId }),
  }
}
