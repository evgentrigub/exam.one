import { open } from 'node:fs/promises'

const HEADER_PROBE_BYTES = 4096

/**
 * Seconds of audio in a PCM WAV buffer's header: the `data` chunk size over the `fmt ` byte
 * rate. Walks the RIFF chunks, so extra chunks before `data` are fine. 0 when unreadable.
 */
export function wavDurationFromHeader(header: Buffer, fileSize: number): number {
  if (
    header.length < 12 ||
    header.toString('ascii', 0, 4) !== 'RIFF' ||
    header.toString('ascii', 8, 12) !== 'WAVE'
  )
    return 0
  let byteRate = 0
  let offset = 12
  while (offset + 8 <= header.length) {
    const id = header.toString('ascii', offset, offset + 4)
    const size = header.readUInt32LE(offset + 4)
    const body = offset + 8
    if (id === 'fmt ' && body + 12 <= header.length) byteRate = header.readUInt32LE(body + 8)
    if (id === 'data') {
      if (!byteRate) return 0
      // A streamed WAV may leave the size unset (0 or 0xFFFFFFFF): use what is on disk.
      const dataBytes =
        size > 0 && size !== 0xffffffff ? Math.min(size, fileSize - body) : fileSize - body
      return Math.max(0, dataBytes) / byteRate
    }
    offset = body + size + (size % 2)
  }
  return 0
}

export async function wavDurationSec(filePath: string, fileSize: number): Promise<number> {
  const handle = await open(filePath, 'r')
  try {
    const header = Buffer.alloc(Math.min(HEADER_PROBE_BYTES, fileSize))
    await handle.read(header, 0, header.length, 0)
    return wavDurationFromHeader(header, fileSize)
  } catch {
    return 0
  } finally {
    await handle.close()
  }
}
