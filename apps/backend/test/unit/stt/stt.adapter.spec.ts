import { checkSttHealth, getSttConfig, transcribeAudio } from '../../../src/speech/stt/stt.adapter'

describe('language-aware STT adapter', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('sends the exam language without forcing a model', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ text: ' Hello ' })))
    const config = { ...getSttConfig({}), language: 'en' }
    await expect(
      transcribeAudio(
        { data: new ArrayBuffer(4), fileName: 'answer.webm', mimeType: 'audio/webm' },
        config
      )
    ).resolves.toBe('Hello')
    const form = (global.fetch as jest.Mock).mock.calls[0][1].body as FormData
    expect(form.get('language')).toBe('en')
    expect(form.has('model')).toBe(false)
  })

  it('reports a missing preferred model without declaring the service offline', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ready: false, state: 'missing', detail: 'Install Phonon.' }))
      )
    await expect(checkSttHealth({ ...getSttConfig({}), language: 'en' })).resolves.toMatchObject({
      ready: false,
      state: 'missing',
      detail: 'Install Phonon.',
      language: 'en',
    })
    const url = new URL((global.fetch as jest.Mock).mock.calls[0][0] as string)
    expect(url.searchParams.get('language')).toBe('en')
    expect(url.searchParams.has('model')).toBe(false)
  })
})
