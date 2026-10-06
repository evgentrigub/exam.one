const BYTES_PER_MB = 1_000_000

/** "2.4 MB", "63 MB", "1.27 GB": one decimal under 10 MB, GB from 1000 MB on. */
export function fmtBytes(bytes: number): string {
  const mb = Math.max(0, bytes) / BYTES_PER_MB
  if (mb >= 1000) return `${(mb / 1000).toFixed(2)} GB`
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

/** "1:42": minutes and zero-padded seconds. */
export function fmtDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
