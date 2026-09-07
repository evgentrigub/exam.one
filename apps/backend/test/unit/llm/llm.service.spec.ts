import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { LlmService } from '../../../src/ai/llm.service'
import * as adapter from '../../../src/ai/llm.adapter'

jest.mock('../../../src/ai/llm.adapter', () => ({
  getLlmConfig: jest.fn(),
  callLlm: jest.fn(),
  verifyLlmConnection: jest.fn(),
}))

const getLlmConfig = adapter.getLlmConfig as jest.MockedFunction<typeof adapter.getLlmConfig>
const verifyLlmConnection = adapter.verifyLlmConnection as jest.MockedFunction<
  typeof adapter.verifyLlmConnection
>

describe('LlmService', () => {
  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app.NODE_ENV') return 'test'
              return ''
            }),
          },
        },
      ],
    }).compile()
    return module.get(LlmService)
  }

  beforeEach(() => {
    getLlmConfig.mockReset()
    verifyLlmConnection.mockReset()
  })

  it('reports unconfigured health when no API key is set', async () => {
    getLlmConfig.mockReturnValue(null)
    const service = await createService()

    await expect(service.health()).resolves.toEqual({
      data: {
        configured: false,
        connected: false,
        provider: null,
        model: null,
        message: 'No LLM API key is configured.',
      },
      error: null,
    })
  })

  it('reports connected health after a successful ping', async () => {
    getLlmConfig.mockReturnValue({
      provider: 'openrouter',
      apiKey: 'sk-test',
      model: 'test-model',
    })
    verifyLlmConnection.mockResolvedValue({
      status: 'ok',
      provider: 'openrouter',
      model: 'test-model',
    })
    const service = await createService()

    await expect(service.health()).resolves.toEqual({
      data: {
        configured: true,
        connected: true,
        provider: 'openrouter',
        model: 'test-model',
        message: null,
      },
      error: null,
    })
  })
})
