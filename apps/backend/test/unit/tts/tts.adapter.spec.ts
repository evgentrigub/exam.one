import {
  clearTtsVoicesCache,
  listeningTranscriptHashKey,
  synthesizeListeningTranscript,
  synthesizeSpeech,
  ttsHealthStatus,
} from '../../../src/speech/tts/tts.adapter'

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

describe('pack voices and health', () => {
  const realFetch = global.fetch
  beforeEach(() => clearTtsVoicesCache())
  afterEach(() => {
    global.fetch = realFetch
  })
  /** The TTS server: GET /v1/audio/voices lists `served`, POST /v1/audio/speech returns a WAV. */
  const server = (served: string[]) =>
    jest.fn((url: string) =>
      Promise.resolve(
        String(url).endsWith('/v1/audio/voices')
          ? Response.json({ voices: served })
          : new Response(new Uint8Array([82, 73, 70, 70]))
      )
    )
  const english = {
    ...config,
    voice: 'bf_emma',
    lang: 'en',
    voices: [
      { id: 'bf_emma', gender: 'female' as const },
      { id: 'bm_george', gender: 'male' as const },
    ],
  }
  const body = (mock: jest.Mock) =>
    JSON.parse(String(mock.mock.calls.find(call => call[1]?.method === 'POST')![1].body))

  it('sends an English monologue with its speaker voice and language, without the label', async () => {
    const fetchMock = server(['bf_emma', 'bm_george'])
    global.fetch = fetchMock as unknown as typeof fetch
    await synthesizeListeningTranscript('Paul: Hi Jenny, the concert has moved.', english)
    expect(body(fetchMock)).toMatchObject({
      voice: 'bm_george',
      lang: 'en',
      input: 'Hi Jenny, the concert has moved.',
    })
  })

  it('keeps a German monologue on martin with its text unchanged', async () => {
    const fetchMock = server(['martin', 'victoria'])
    global.fetch = fetchMock as unknown as typeof fetch
    await synthesizeListeningTranscript('Achtung am Gleis drei.', config)
    expect(body(fetchMock)).toMatchObject({ voice: 'martin', lang: 'de', input: 'Achtung am Gleis drei.' })
  })

  it('narrates a German monologue with the default voice when one is set', async () => {
    const fetchMock = server(['martin', 'victoria'])
    global.fetch = fetchMock as unknown as typeof fetch
    await synthesizeListeningTranscript('Achtung am Gleis drei.', { ...config, narrator: 'victoria' })
    expect(body(fetchMock)).toMatchObject({ voice: 'victoria', lang: 'de' })
    expect(listeningTranscriptHashKey('Achtung.', { ...config, narrator: 'victoria' })).not.toBe(
      listeningTranscriptHashKey('Achtung.', config)
    )
  })

  it('falls back to an installed voice of the pack when the narrator is missing', async () => {
    const fetchMock = server(['bf_emma'])
    global.fetch = fetchMock as unknown as typeof fetch
    await synthesizeListeningTranscript('Paul: Hi Jenny, the concert has moved.', english)
    expect(body(fetchMock)).toMatchObject({ voice: 'bf_emma', lang: 'en' })
  })

  it('tells an unreachable server from one without the pack voices', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('fetch failed')) as unknown as typeof fetch
    await expect(ttsHealthStatus(english)).resolves.toBe('offline')
    global.fetch = jest
      .fn()
      .mockResolvedValue(Response.json({ voices: ['martin', 'victoria'] })) as unknown as typeof fetch
    await expect(ttsHealthStatus(english)).resolves.toBe('unsupported')
    global.fetch = jest
      .fn()
      .mockResolvedValue(Response.json({ voices: ['bf_emma', 'bm_george', 'martin'] })) as unknown as typeof fetch
    await expect(ttsHealthStatus(english)).resolves.toBe('ok')
    // One installed voice of the pack is enough; the others fall back to it.
    global.fetch = jest.fn().mockResolvedValue(Response.json({ voices: ['bm_george'] })) as unknown as typeof fetch
    await expect(ttsHealthStatus(english)).resolves.toBe('ok')
  })
})
