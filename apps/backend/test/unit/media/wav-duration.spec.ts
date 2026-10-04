import { wavDurationFromHeader } from '../../../src/media/wav-duration'

function header(chunks: Array<[string, Buffer]>): Buffer {
  const body = chunks.map(([id, data]) => {
    const head = Buffer.alloc(8)
    head.write(id, 0, 'ascii')
    head.writeUInt32LE(data.length, 4)
    return Buffer.concat([head, data, data.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)])
  })
  return Buffer.concat([Buffer.from('RIFF\0\0\0\0WAVE', 'ascii'), ...body])
}

function fmt(byteRate: number): Buffer {
  const data = Buffer.alloc(16)
  data.writeUInt16LE(1, 0)
  data.writeUInt16LE(1, 2)
  data.writeUInt32LE(byteRate / 2, 4)
  data.writeUInt32LE(byteRate, 8)
  return data
}

describe('wavDurationFromHeader', () => {
  it('divides the data chunk by the byte rate, skipping extra chunks', () => {
    const wav = header([
      ['fmt ', fmt(48_000)],
      ['LIST', Buffer.alloc(5)],
      ['data', Buffer.alloc(96_000)],
    ])
    expect(wavDurationFromHeader(wav, wav.length)).toBe(2)
  })

  it('uses the bytes on disk when the data size was never filled in', () => {
    const wav = header([
      ['fmt ', fmt(48_000)],
      ['data', Buffer.alloc(48_000)],
    ])
    wav.writeUInt32LE(0xffffffff, wav.indexOf('data') + 4)
    expect(wavDurationFromHeader(wav, wav.length)).toBe(1)
  })

  it('returns 0 for anything that is not a PCM WAV', () => {
    expect(wavDurationFromHeader(Buffer.from('ID3 not a wav at all'), 20)).toBe(0)
    expect(wavDurationFromHeader(header([['data', Buffer.alloc(10)]]), 30)).toBe(0)
  })
})
