/**
 * Probe whether listening audio files exist for the current exercise.
 */

import type { ListeningA2Exercise } from '~/utils/exercises/listening'
import { collectListeningAudioSrcs } from '~/utils/listening/audioUrls'

export function useListeningAudioAvailability(
  exercise: Ref<ListeningA2Exercise> | ComputedRef<ListeningA2Exercise>
) {
  const checking = ref(false)
  const missingSrcs = ref<string[]>([])
  const checked = ref(false)

  const expectedSrcs = computed(() => collectListeningAudioSrcs(exercise.value))
  const missingCount = computed(() => missingSrcs.value.length)
  const anyMissing = computed(() => missingCount.value > 0)
  const allMissing = computed(
    () => expectedSrcs.value.length > 0 && missingCount.value === expectedSrcs.value.length
  )

  async function probeSrc(src: string): Promise<boolean> {
    try {
      const response = await fetch(src, { method: 'HEAD', cache: 'no-store' })
      if (response.ok) return true
      // Some static hosts reject HEAD; try a ranged GET.
      const getResponse = await fetch(src, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        cache: 'no-store',
      })
      return getResponse.ok || getResponse.status === 206
    } catch {
      return false
    }
  }

  async function refresh(): Promise<void> {
    if (!import.meta.client) return
    checking.value = true
    try {
      const srcs = expectedSrcs.value
      if (srcs.length === 0) {
        missingSrcs.value = []
        checked.value = true
        return
      }

      const results = await Promise.all(srcs.map(async src => ({ src, ok: await probeSrc(src) })))
      missingSrcs.value = results.filter(r => !r.ok).map(r => r.src)
      checked.value = true
    } finally {
      checking.value = false
    }
  }

  watch(
    () => [exercise.value.id, exercise.value.audio, expectedSrcs.value.join('|')] as const,
    () => {
      void refresh()
    },
    { immediate: true }
  )

  return {
    checking: readonly(checking),
    checked: readonly(checked),
    missingSrcs: readonly(missingSrcs),
    missingCount,
    anyMissing,
    allMissing,
    expectedCount: computed(() => expectedSrcs.value.length),
    refresh,
  }
}
