import { Test, type TestingModule } from '@nestjs/testing'
import { LlmService } from '../../../src/ai/llm.service'
import { LlmSettingsService } from '../../../src/ai/llm-settings.service'
import * as adapter from '../../../src/ai/llm.adapter'
import { packContext } from '../../../src/core/interceptors/pack-context.interceptor'

jest.mock('../../../src/ai/llm.adapter', () => ({
  callLlmWithFallback: jest.fn(),
  verifyLlmConnection: jest.fn(),
}))

const callLlmWithFallback = adapter.callLlmWithFallback as jest.MockedFunction<
  typeof adapter.callLlmWithFallback
>
const verifyLlmConnection = adapter.verifyLlmConnection as jest.MockedFunction<
  typeof adapter.verifyLlmConnection
>

const config: adapter.LlmConfig = {
  provider: 'openrouter',
  apiKey: 'sk-test',
  model: 'test-model',
  fallbackModels: [],
  reasoningEffort: 'medium',
}

describe('LlmService', () => {
  let resolveConfig: jest.Mock

  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmService, { provide: LlmSettingsService, useValue: { resolveConfig } }],
    }).compile()
    return module.get(LlmService)
  }

  beforeEach(() => {
    resolveConfig = jest.fn().mockResolvedValue(null)
    callLlmWithFallback.mockReset()
    verifyLlmConnection.mockReset()
  })

  it('resolves the config of the user in the request context', async () => {
    resolveConfig.mockResolvedValue(config)
    const service = await createService()

    await packContext.run({ userId: 'user-7' }, () => service.getConfig())

    expect(resolveConfig).toHaveBeenCalledWith('user-7')
  })

  it('has no config outside a user context', async () => {
    const service = await createService()
    await expect(service.getConfig()).resolves.toBeNull()
    expect(resolveConfig).not.toHaveBeenCalled()
  })

  it('completes with fallback using the user config', async () => {
    resolveConfig.mockResolvedValue(config)
    callLlmWithFallback.mockResolvedValue('answer')
    const service = await createService()
    const messages = [{ role: 'user' as const, content: 'Hi' }]

    await expect(
      packContext.run({ userId: 'user-1' }, () => service.complete(messages, { maxTokens: 5 }))
    ).resolves.toBe('answer')
    expect(callLlmWithFallback).toHaveBeenCalledWith(config, messages, { maxTokens: 5 })
  })

  it('refuses to complete without a key, pointing to Settings', async () => {
    const service = await createService()
    await expect(packContext.run({ userId: 'user-1' }, () => service.complete([]))).rejects.toThrow(
      /Settings → AI provider/
    )
  })

  it('reports unconfigured health when the user has no key', async () => {
    const service = await createService()

    await expect(service.health('user-1')).resolves.toEqual({
      data: {
        configured: false,
        connected: false,
        provider: null,
        model: null,
        message: 'No LLM API key is configured. Add one in Settings → AI provider.',
      },
      error: null,
    })
  })

  it('reports connected health after a successful check', async () => {
    resolveConfig.mockResolvedValue(config)
    verifyLlmConnection.mockResolvedValue({
      status: 'ok',
      provider: 'openrouter',
      model: 'test-model',
    })
    const service = await createService()

    await expect(service.health('user-1')).resolves.toEqual({
      data: {
        configured: true,
        connected: true,
        provider: 'openrouter',
        model: 'test-model',
        message: null,
      },
      error: null,
    })
    expect(resolveConfig).toHaveBeenCalledWith('user-1')
  })
})
