/**
 * Poll NestJS /api/v1/tts/health while a listening session is mounted.
 */

export type TtsHealthStatus = 'checking' | 'ready' | 'offline'

const POLL_MS = 12_000

export function useTtsHealth() {
  const status = ref<TtsHealthStatus>('checking')
  const lastCheckedAt = ref<string | null>(null)

  let timer: ReturnType<typeof setInterval> | null = null
  let inFlight = false

  async function refresh(): Promise<void> {
    if (!import.meta.client || inFlight) return
    inFlight = true
    try {
      const res = await aiFetch<{ ok: boolean }>('/tts/health')
      status.value = res.data?.ok ? 'ready' : 'offline'
      lastCheckedAt.value = new Date().toISOString()
    } catch {
      status.value = 'offline'
      lastCheckedAt.value = new Date().toISOString()
    } finally {
      inFlight = false
    }
  }

  function start(): void {
    if (!import.meta.client) return
    void refresh()
    stop()
    timer = setInterval(() => {
      void refresh()
    }, POLL_MS)
  }

  function stop(): void {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onMounted(start)
  onUnmounted(stop)

  return {
    status: readonly(status),
    lastCheckedAt: readonly(lastCheckedAt),
    isReady: computed(() => status.value === 'ready'),
    refresh,
    start,
    stop,
  }
}
