/**
 * Bounded async concurrency helper (no extra deps).
 * Runs up to `limit` tasks at a time; preserves result order.
 */
export async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const concurrency = Math.max(1, Math.floor(limit) || 1)
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function runWorker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      const item = items[index]
      if (item === undefined) continue
      results[index] = await worker(item, index)
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker())
  await Promise.all(workers)
  return results
}

export function getTtsConcurrency(env: NodeJS.ProcessEnv = process.env): number {
  const raw = Number(env['TTS_CONCURRENCY'] ?? '3')
  if (!Number.isFinite(raw) || raw < 1) return 3
  return Math.min(8, Math.floor(raw))
}
