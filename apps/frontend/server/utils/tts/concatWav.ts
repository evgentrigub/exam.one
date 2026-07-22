/**
 * Concatenate mono PCM WAV buffers (Kokoro: 24 kHz / 16-bit / mono) with
 * optional silence between segments.
 */

export interface WavFormat {
  channels: number
  sampleRate: number
  bitsPerSample: number
  dataOffset: number
  dataLength: number
}

const DEFAULT_PAUSE_MS = 350

function readUInt16LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt16LE(offset)
}

function readUInt32LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset)
}

function findChunk(buffer: Buffer, chunkId: string): { offset: number; size: number } | null {
  let offset = 12
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4)
    const size = readUInt32LE(buffer, offset + 4)
    if (id === chunkId) {
      return { offset: offset + 8, size }
    }
    offset += 8 + size + (size % 2)
  }
  return null
}

export function parseWavFormat(buffer: Buffer): WavFormat {
  if (buffer.length < 44) {
    throw new Error('WAV buffer too short')
  }
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Not a RIFF/WAVE file')
  }

  const fmt = findChunk(buffer, 'fmt ')
  const data = findChunk(buffer, 'data')
  if (!fmt || !data) {
    throw new Error('WAV missing fmt or data chunk')
  }

  const audioFormat = readUInt16LE(buffer, fmt.offset)
  if (audioFormat !== 1) {
    throw new Error(`Unsupported WAV audio format ${audioFormat} (expected PCM=1)`)
  }

  return {
    channels: readUInt16LE(buffer, fmt.offset + 2),
    sampleRate: readUInt32LE(buffer, fmt.offset + 4),
    bitsPerSample: readUInt16LE(buffer, fmt.offset + 14),
    dataOffset: data.offset,
    dataLength: data.size,
  }
}

function assertCompatible(base: WavFormat, next: WavFormat, index: number): void {
  if (
    base.channels !== next.channels
    || base.sampleRate !== next.sampleRate
    || base.bitsPerSample !== next.bitsPerSample
  ) {
    throw new Error(
      `WAV format mismatch at segment ${index}: `
      + `expected ${base.channels}ch/${base.sampleRate}Hz/${base.bitsPerSample}-bit, `
      + `got ${next.channels}ch/${next.sampleRate}Hz/${next.bitsPerSample}-bit`,
    )
  }
}

function silencePcm(format: WavFormat, pauseMs: number): Buffer {
  const bytesPerSample = (format.bitsPerSample / 8) * format.channels
  const sampleCount = Math.max(0, Math.round((format.sampleRate * pauseMs) / 1000))
  return Buffer.alloc(sampleCount * bytesPerSample, 0)
}

function writeWav(pcm: Buffer, format: WavFormat): Buffer {
  const dataSize = pcm.length
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + dataSize, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(format.channels, 22)
  header.writeUInt32LE(format.sampleRate, 24)
  const byteRate = format.sampleRate * format.channels * (format.bitsPerSample / 8)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(format.channels * (format.bitsPerSample / 8), 32)
  header.writeUInt16LE(format.bitsPerSample, 34)
  header.write('data', 36)
  header.writeUInt32LE(dataSize, 40)
  return Buffer.concat([header, pcm])
}

/**
 * Concatenate WAV segments with silence between them.
 * All inputs must share channels / sample rate / bit depth (Kokoro mono 24 kHz 16-bit).
 */
export function concatWavWithPauses(
  wavBuffers: Buffer[],
  pauseMs: number = DEFAULT_PAUSE_MS,
): Buffer {
  if (wavBuffers.length === 0) {
    throw new Error('concatWavWithPauses requires at least one WAV buffer')
  }
  if (wavBuffers.length === 1) {
    const only = wavBuffers[0]
    if (!only) throw new Error('concatWavWithPauses received empty buffer')
    return only
  }

  const first = wavBuffers[0]
  if (!first) throw new Error('concatWavWithPauses received empty first buffer')
  const baseFormat = parseWavFormat(first)
  const pcmParts: Buffer[] = []

  for (let i = 0; i < wavBuffers.length; i += 1) {
    const buffer = wavBuffers[i]
    if (!buffer) continue
    const format = parseWavFormat(buffer)
    assertCompatible(baseFormat, format, i)
    pcmParts.push(buffer.subarray(format.dataOffset, format.dataOffset + format.dataLength))
    if (i < wavBuffers.length - 1 && pauseMs > 0) {
      pcmParts.push(silencePcm(baseFormat, pauseMs))
    }
  }

  return writeWav(Buffer.concat(pcmParts), baseFormat)
}
