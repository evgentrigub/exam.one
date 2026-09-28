import { synthesizeSpeech } from '../../../src/speech/tts/tts.adapter'

const config = {
  baseUrl: 'http://tts.test',
  voice: 'martin',
  speed: 1,
  lang: 'de',
  turnPauseMs: 350,
  concurrency: 1,
}

describe('synthesizeSpeech', () => {
  const realFetch = global.fetch
  afterEach(() => {
    global.fetch = realFetch
  })

  it('retries once when the request fails before any response', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(new Response(new Uint8Array([82, 73, 70, 70]), { status: 200 }))
    global.fetch = fetchMock as unknown as typeof fetch
    await expect(synthesizeSpeech({ text: 'Hallo' }, config)).resolves.toEqual(Buffer.from('RIFF'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry an HTTP error response', async () => {
    const fetchMock = jest.fn().mockResolvedValue(new Response('boom', { status: 500 }))
    global.fetch = fetchMock as unknown as typeof fetch
    await expect(synthesizeSpeech({ text: 'Hallo' }, config)).rejects.toThrow('TTS request failed (500')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('gives up after the single retry', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new TypeError('fetch failed'))
    global.fetch = fetchMock as unknown as typeof fetch
    await expect(synthesizeSpeech({ text: 'Hallo' }, config)).rejects.toThrow('fetch failed')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
