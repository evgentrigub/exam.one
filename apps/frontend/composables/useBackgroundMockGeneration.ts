import { useJobCenter } from '~/composables/useJobCenter'

type Preflight = {
  checking: boolean
  checkedAt: string | null
  llmConfigured: boolean
  llmConnected: boolean
  ttsAvailable: boolean
  provider: string | null
  model: string | null
  llmMessage: string | null
  ttsMessage: string | null
}

export function useBackgroundMockGeneration() {
  const packId = useSettingsStore().packId
  const preflight = useState<Preflight>(`background-mock-preflight:${useAuth().user.value?.id}:${packId}`, () => ({
    checking: false, checkedAt: null, llmConfigured: false, llmConnected: false,
    ttsAvailable: false, provider: null, model: null, llmMessage: null, ttsMessage: null,
  }))
  const center = useJobCenter()
  const isGenerating = computed(() => center.jobs.value.some(job =>
    job.type === 'MOCK_EXAM_SET' && job.packId === packId && ['QUEUED', 'RUNNING', 'CANCEL_REQUESTED'].includes(job.status)
  ))
  const preflightReady = computed(() => preflight.value.llmConfigured && preflight.value.llmConnected && preflight.value.ttsAvailable)
  async function checkPreflight(): Promise<boolean> {
    preflight.value = { ...preflight.value, checking: true }
    const [llmResult, ttsResult] = await Promise.allSettled([
      aiFetch<{ configured: boolean; connected: boolean; provider: string | null; model: string | null; message: string | null }>('/llm/health', { packId }),
      aiFetch<{ ok: boolean }>('/tts/health', { packId }),
    ])
    const llm = llmResult.status === 'fulfilled' ? llmResult.value : null
    const tts = ttsResult.status === 'fulfilled' ? ttsResult.value : null
    preflight.value = {
      checking: false, checkedAt: new Date().toISOString(),
      llmConfigured: Boolean(llm?.data?.configured), llmConnected: Boolean(llm?.data?.connected),
      ttsAvailable: Boolean(tts?.data?.ok), provider: llm?.data?.provider ?? null,
      model: llm?.data?.model ?? null,
      llmMessage: llm?.data?.message ?? llm?.error ?? (llmResult.status === 'rejected' ? String(llmResult.reason) : null),
      ttsMessage: tts?.error ?? (ttsResult.status === 'rejected' ? String(ttsResult.reason) : null),
    }
    return preflightReady.value
  }
  async function startGeneration(setNumber: number): Promise<boolean> {
    if (isGenerating.value || !(await checkPreflight())) return false
    await center.enqueueMock(setNumber)
    return true
  }
  return { isGenerating, preflight: readonly(preflight), preflightReady, checkPreflight, startGeneration }
}
