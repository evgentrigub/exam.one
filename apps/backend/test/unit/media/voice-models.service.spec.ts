import type { ConfigService } from '@nestjs/config'
import type { PrismaService } from '@exam-one/nestjs-libraries'
import { resolveDefaults, VoiceModelsService } from '../../../src/media/voice-models.service'
import * as adapter from '../../../src/speech/tts/tts.adapter'
import { makeUser } from '../../../src/testing/fixtures'

const voice = (id: string, lang: string, installed: boolean) => ({
  id,
  lang,
  name: id,
  gender: 'female' as const,
  accent: null,
  quality: 'medium' as const,
  installed,
  sizeBytes: installed ? 1000 : 5000,
  progress: null,
})

const CATALOG = {
  installedBytes: 3000,
  voices: [
    voice('bf_emma', 'en', true),
    voice('bm_george', 'en', true),
    voice('pl_gosia', 'pl', false),
    voice('ef_dora', 'es', true),
  ],
}

describe('VoiceModelsService', () => {
  const user = makeUser({ id: 'user-1' })
  const realFetch = global.fetch
  const prisma = { setting: { findUnique: jest.fn(), upsert: jest.fn() } }
  const config = {
    getOrThrow: jest.fn(() => 'http://tts.test/'),
  } as unknown as ConfigService
  let service: VoiceModelsService
  let fetchMock: jest.Mock
  let clearCache: jest.SpyInstance

  /** The TTS server: the catalog on GET, `answers[path]` for writes. */
  function server(answers: Record<string, Response> = {}): jest.Mock {
    return jest.fn((url: string, init?: RequestInit) => {
      const pathname = new URL(url).pathname
      if (init?.method === 'GET' && pathname === '/v1/models/voices')
        return Promise.resolve(Response.json(CATALOG))
      return Promise.resolve(answers[`${init?.method} ${pathname}`] ?? Response.json({}))
    })
  }

  beforeEach(() => {
    prisma.setting.findUnique.mockReset().mockResolvedValue({ defaultVoices: {} })
    prisma.setting.upsert.mockReset().mockResolvedValue({})
    fetchMock = server()
    global.fetch = fetchMock as unknown as typeof fetch
    clearCache = jest.spyOn(adapter, 'clearTtsVoicesCache')
    service = new VoiceModelsService(config, prisma as unknown as PrismaService)
  })

  afterEach(() => {
    global.fetch = realFetch
    clearCache.mockRestore()
  })

  it('lists the catalog with the first installed voice of a language as default', async () => {
    const result = await service.list(user)
    expect(result.online).toBe(true)
    expect(result.installedBytes).toBe(3000)
    const defaults = result.voices.filter(entry => entry.isDefault).map(entry => entry.id)
    expect(defaults).toEqual(['bf_emma', 'ef_dora'])
    expect(fetchMock.mock.calls[0]![0]).toBe('http://tts.test/v1/models/voices')
  })

  it('honours the stored default while it is installed', async () => {
    prisma.setting.findUnique.mockResolvedValue({
      defaultVoices: { en: 'bm_george', pl: 'pl_gosia' },
    })
    const result = await service.list(user)
    expect(result.voices.filter(entry => entry.isDefault).map(entry => entry.id)).toEqual([
      'bm_george',
      'ef_dora',
    ])
  })

  it('reports offline instead of failing when TTS is down', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new TypeError('fetch failed')) as unknown as typeof fetch
    await expect(service.list(user)).resolves.toEqual({
      online: false,
      installedBytes: 0,
      voices: [],
    })
    await expect(service.installedBytes()).resolves.toBe(0)
  })

  it('only sets an installed voice of the same language as default', async () => {
    await expect(service.setDefault(user, 'pl', 'pl_gosia')).rejects.toMatchObject({
      response: { code: 'VOICE_NOT_INSTALLED' },
    })
    await expect(service.setDefault(user, 'pl', 'bf_emma')).rejects.toMatchObject({
      response: { code: 'INVALID_VOICE' },
    })
    await expect(service.setDefault(user, 'en', '../etc')).rejects.toMatchObject({
      response: { code: 'INVALID_VOICE' },
    })
    await service.setDefault(user, 'en', 'bm_george')
    expect(prisma.setting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { defaultVoices: { en: 'bm_george' } } })
    )
  })

  it('moves the default on when its voice is removed and clears the voice cache', async () => {
    prisma.setting.findUnique.mockResolvedValue({ defaultVoices: { en: 'bf_emma', es: 'ef_dora' } })
    fetchMock = server({
      'DELETE /v1/models/voices/bf_emma': Response.json({ freedBytes: 523420 }),
    })
    global.fetch = fetchMock as unknown as typeof fetch
    await expect(service.remove(user, 'bf_emma')).resolves.toEqual({ freedBytes: 523420 })
    expect(clearCache).toHaveBeenCalled()
    expect(prisma.setting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { defaultVoices: { es: 'ef_dora', en: 'bm_george' } } })
    )
  })

  it('maps TTS refusals to API errors', async () => {
    global.fetch = server({
      'DELETE /v1/models/voices/pl_gosia': new Response('{}', { status: 409 }),
      'POST /v1/models/voices/zz_nope/download': new Response('{}', { status: 404 }),
    }) as unknown as typeof fetch
    await expect(service.remove(user, 'pl_gosia')).rejects.toMatchObject({
      response: { code: 'VOICE_DOWNLOADING' },
    })
    await expect(service.download('zz_nope')).rejects.toMatchObject({
      response: { code: 'VOICE_NOT_FOUND' },
    })
  })

  it('starts and cancels downloads on the TTS service', async () => {
    await service.download('pl_gosia')
    await service.cancelDownload('pl_gosia')
    const calls = fetchMock.mock.calls.map(
      ([url, init]) => `${(init as RequestInit).method} ${new URL(url).pathname}`
    )
    expect(calls).toEqual([
      'POST /v1/models/voices/pl_gosia/download',
      'DELETE /v1/models/voices/pl_gosia/download',
    ])
  })
})

describe('resolveDefaults', () => {
  it('falls back per language when the stored pick is not installed', () => {
    const voices = [voice('a', 'en', false), voice('b', 'en', true), voice('c', 'de', true)]
    expect(resolveDefaults(voices, { en: 'a', de: 'c' })).toEqual({ en: 'b', de: 'c' })
    expect(resolveDefaults(voices, { en: 'c' })).toEqual({ en: 'b', de: 'c' })
  })
})
