/**
 * Poll NestJS /api/v1/tts/health while a listening session is mounted.
 */

import type { TtsHealthData } from '@exam-one/contracts'

/** `unsupported`: the service answers but lacks the active pack's language or voices. */
export type TtsHealthStatus = 'checking' | 'ready' | 'offline' | 'unsupported'

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
      const res = await aiFetch<TtsHealthData>('/tts/health')
      status.value = res.data?.ok
        ? 'ready'
        : res.data?.reason === 'unsupported'
          ? 'unsupported'
          : 'offline'
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
