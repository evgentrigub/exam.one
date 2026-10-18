import { ConfigService } from '@nestjs/config'
import { BadRequestException, ConflictException, ServiceUnavailableException } from '@nestjs/common'
import { SttModelsService } from '../../../src/media/stt-models.service'

describe('SttModelsService', () => {
  const originalFetch = global.fetch
  const models = [{ id: 'phonon-2', languages: ['en'], installed: true }]
  function service() {
    return new SttModelsService({
      getOrThrow: () => 'http://stt:8882',
    } as unknown as ConfigService)
  }
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('leaves external endpoints usable without exposing unsupported management', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('{}', { status: 404 }))
    await expect(service().list()).resolves.toMatchObject({ online: true, manageable: false })
    await expect(service().mutate('phonon-2', 'download')).rejects.toBeInstanceOf(
      ServiceUnavailableException
    )
  })

  it('allows changing the installed model through language preferences', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(
        async (_url, options) =>
          new Response(JSON.stringify(options?.method === 'PUT' ? { ok: true } : { models }))
      )
    await expect(service().prefer('en', 'phonon-2')).resolves.toEqual({ ok: true })
    expect(global.fetch).toHaveBeenLastCalledWith(
      'http://stt:8882/v1/models/stt/preferred',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ lang: 'en', modelId: 'phonon-2' }),
      })
    )
  })

  it('rejects wrong-language preferences and unknown catalog ids', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(async () => new Response(JSON.stringify({ models })))
    await expect(service().prefer('de', 'phonon-2')).rejects.toBeInstanceOf(BadRequestException)
    await expect(service().mutate('arbitrary-model', 'remove')).rejects.toBeInstanceOf(
      BadRequestException
    )
  })

  it('blocks retired model downloads and new selections while allowing removal', async () => {
    const retired = [
      { id: 'parakeet-v3-q8', languages: ['de'], installed: true, downloadable: false },
    ]
    global.fetch = jest
      .fn()
      .mockImplementation(
        async (_url, options) =>
          new Response(
            JSON.stringify(options?.method === 'DELETE' ? { freedBytes: 740 } : { models: retired })
          )
      )
    await expect(service().mutate('parakeet-v3-q8', 'download')).rejects.toBeInstanceOf(
      BadRequestException
    )
    await expect(service().prefer('de', 'parakeet-v3-q8')).rejects.toBeInstanceOf(
      BadRequestException
    )
    await expect(service().mutate('parakeet-v3-q8', 'remove')).resolves.toEqual({ freedBytes: 740 })
  })

  it('preserves active-transcription removal conflicts', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ models })))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: 'Transcription is active' }), { status: 409 })
      )
    await expect(service().mutate('phonon-2', 'remove')).rejects.toBeInstanceOf(ConflictException)
  })
})
