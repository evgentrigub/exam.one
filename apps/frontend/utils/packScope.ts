let epoch = 0
const resetters = new Set<() => void>()
export function packEpoch(): number {
  return epoch
}
export function onPackReset(reset: () => void): void {
  resetters.add(reset)
}
export function resetPackScope(): void {
  epoch++
  for (const reset of resetters) reset()
}
