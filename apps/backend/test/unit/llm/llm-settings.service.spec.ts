import { BadGatewayException, BadRequestException, HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { LlmSettingsService } from '../../../src/ai/llm-settings.service'
import * as providers from '../../../src/ai/llm-providers'
import { decryptSecret, encryptSecret } from '../../../src/common/crypto/secret-box'
import { makeSetting } from '../../../src/testing/fixtures'

jest.mock('../../../src/ai/llm-providers', () => ({
  ...jest.requireActual('../../../src/ai/llm-providers'),
  listModels: jest.fn(),
}))

const listModels = providers.listModels as jest.MockedFunction<typeof providers.listModels>
const KEY = Buffer.alloc(32, 9).toString('base64')
const NOW = new Date('2026-10-12T10:00:00.000Z')

function credential(provider: string, apiKey: string) {
  return {
    id: `cred-${provider}`,
    userId: 'user-1',
    provider,
    keyCiphertext: encryptSecret(apiKey, KEY, `user-1:${provider}`),
    keyLast4: apiKey.slice(-4),
    createdAt: NOW,
    updatedAt: NOW,
  }
}

describe('LlmSettingsService', () => {
  let service: LlmSettingsService
  let prisma: {
    setting: { findUnique: jest.Mock; upsert: jest.Mock; updateMany: jest.Mock }
    llmCredential: { findMany: jest.Mock; findUnique: jest.Mock; upsert: jest.Mock; deleteMany: jest.Mock }
  }

  beforeEach(async () => {
    listModels.mockReset()
    prisma = {
      setting: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn(),
        updateMany: jest.fn(),
      },
      llmCredential: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmSettingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn(() => KEY) } },
      ],
    }).compile()
    service = module.get(LlmSettingsService)
  })

  describe('get', () => {
    it('returns defaults and no keys for a new user', async () => {
      await expect(service.get('user-1')).resolves.toEqual({
        provider: null,
        model: null,
        fallbackModels: [],
        reasoningEffort: 'medium',
        keys: [],
      })
    })

    it('lists saved keys by last four characters only', async () => {
      prisma.setting.findUnique.mockResolvedValue(
        makeSetting({ llmProvider: 'openrouter', llmModel: 'a/b:free', llmFallbackModels: ['c/d:free'] })
      )
      prisma.llmCredential.findMany.mockResolvedValue([credential('openrouter', 'sk-or-secret-1234')])

      const result = await service.get('user-1')

      expect(result).toEqual({
        provider: 'openrouter',
        model: 'a/b:free',
        fallbackModels: ['c/d:free'],
        reasoningEffort: 'medium',
        keys: [{ provider: 'openrouter', last4: '1234', updatedAt: NOW.toISOString() }],
      })
      expect(JSON.stringify(result)).not.toContain('sk-or-secret')
    })
  })

  describe('saveKey', () => {
    it('checks the key with the provider, then stores it encrypted', async () => {
      listModels.mockResolvedValue([{ id: 'gpt-x', name: 'gpt-x' }])
      prisma.llmCredential.upsert.mockImplementation(async ({ create }) => ({ ...create, updatedAt: NOW }))

      const summary = await service.saveKey('user-1', 'openai', ' sk-proj-abcd9876 ')

      expect(listModels).toHaveBeenCalledWith('openai', 'sk-proj-abcd9876')
      const args = prisma.llmCredential.upsert.mock.calls[0][0]
      expect(args.where).toEqual({ userId_provider: { userId: 'user-1', provider: 'openai' } })
      expect(args.create.keyCiphertext).not.toContain('sk-proj')
      expect(decryptSecret(args.create.keyCiphertext, KEY, 'user-1:openai')).toBe('sk-proj-abcd9876')
      expect(summary).toEqual({ provider: 'openai', last4: '9876', updatedAt: NOW.toISOString() })
    })

    it('rejects a key the provider refuses, without storing it', async () => {
      listModels.mockRejectedValue(new providers.LlmProviderHttpError(401, 'Provider returned HTTP 401.'))

      await expect(service.saveKey('user-1', 'xai', 'bad-key-0000')).rejects.toBeInstanceOf(BadRequestException)
      expect(prisma.llmCredential.upsert).not.toHaveBeenCalled()
    })

    it('stops checking keys for a user after too many rejected keys', async () => {
      listModels.mockRejectedValue(new providers.LlmProviderHttpError(401, 'Provider returned HTTP 401.'))
      for (let i = 0; i < 20; i += 1) {
        await expect(service.saveKey('user-1', 'openai', `bad-key-${i}-0000`)).rejects.toBeInstanceOf(
          BadRequestException
        )
      }
      listModels.mockClear()

      await expect(service.saveKey('user-1', 'openai', 'sk-proj-good-1234')).rejects.toBeInstanceOf(
        HttpException
      )
      expect(listModels).not.toHaveBeenCalled()
      await expect(service.saveKey('user-2', 'openai', 'bad-key-x-0000')).rejects.toBeInstanceOf(BadRequestException)
    })

    it('reports an unreachable provider as a gateway error', async () => {
      listModels.mockRejectedValue(new TypeError('fetch failed'))

      await expect(service.saveKey('user-1', 'gemini', 'g-key-0000')).rejects.toBeInstanceOf(BadGatewayException)
    })
  })

  describe('removeKey', () => {
    it('clears the active selection when the active provider key is removed', async () => {
      prisma.setting.findUnique.mockResolvedValue(makeSetting({ llmProvider: 'openai', llmModel: 'gpt-x' }))

      await service.removeKey('user-1', 'openai')

      expect(prisma.llmCredential.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1', provider: 'openai' } })
      expect(prisma.setting.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', llmProvider: 'openai' },
        data: { llmProvider: null, llmModel: null, llmFallbackModels: [] },
      })
    })
  })

  describe('update', () => {
    it('rejects a provider without a saved key', async () => {
      await expect(
        service.update('user-1', { provider: 'anthropic', model: 'claude-x' })
      ).rejects.toBeInstanceOf(BadRequestException)
      expect(prisma.setting.upsert).not.toHaveBeenCalled()
    })

    it('saves the selection, dropping the main model and duplicates from fallbacks', async () => {
      prisma.llmCredential.findUnique.mockResolvedValue(credential('openrouter', 'sk-or-1234'))
      prisma.setting.upsert.mockResolvedValue(makeSetting())

      await service.update('user-1', {
        provider: 'openrouter',
        model: 'a/main:free',
        fallbackModels: ['a/main:free', 'b/backup:free', 'b/backup:free'],
      })

      const args = prisma.setting.upsert.mock.calls[0][0]
      expect(args.update).toEqual({
        llmProvider: 'openrouter',
        llmModel: 'a/main:free',
        llmFallbackModels: ['b/backup:free'],
        llmReasoningEffort: 'medium',
      })
    })
  })

  describe('resolveConfig', () => {
    it('returns null until a provider, key and model are all set', async () => {
      prisma.setting.findUnique.mockResolvedValue(makeSetting({ llmProvider: 'openai', llmModel: null }))
      await expect(service.resolveConfig('user-1')).resolves.toBeNull()
    })

    it('decrypts the key of the active provider', async () => {
      prisma.setting.findUnique.mockResolvedValue(
        makeSetting({ llmProvider: 'gemini', llmModel: 'gemini-x', llmFallbackModels: ['gemini-y'], llmReasoningEffort: 'high' })
      )
      prisma.llmCredential.findUnique.mockResolvedValue(credential('gemini', 'g-secret-5555'))

      await expect(service.resolveConfig('user-1')).resolves.toEqual({
        provider: 'gemini',
        apiKey: 'g-secret-5555',
        model: 'gemini-x',
        fallbackModels: ['gemini-y'],
        reasoningEffort: 'high',
      })
    })

    it('treats a key that no longer decrypts as missing', async () => {
      prisma.setting.findUnique.mockResolvedValue(makeSetting({ llmProvider: 'xai', llmModel: 'grok-x' }))
      prisma.llmCredential.findUnique.mockResolvedValue({
        ...credential('xai', 'xai-1111'),
        keyCiphertext: encryptSecret('xai-1111', Buffer.alloc(32, 3).toString('base64'), 'user-1:xai'),
      })

      await expect(service.resolveConfig('user-1')).resolves.toBeNull()
    })
  })
})
