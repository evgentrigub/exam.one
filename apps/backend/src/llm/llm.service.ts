import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AiResponse, LlmHealthData } from '@exam-one/contracts'
import type { AppConfig } from '../config/app.config'
import {
  callLlm,
  getLlmConfig,
  verifyLlmConnection,
  type LlmConfig,
  type LlmMessage,
  type LlmOptions,
} from './llm.adapter'

const MISSING_KEY_MESSAGE =
  'AI features are unavailable because no API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.'

@Injectable()
export class LlmService implements OnModuleInit {
  private readonly logger = new Logger(LlmService.name)

  constructor(private readonly config: ConfigService) {}

  getConfig(): LlmConfig | null {
    return getLlmConfig({
      provider: this.config.get<AppConfig['LLM_PROVIDER']>('app.LLM_PROVIDER'),
      openaiApiKey: this.config.get<string>('app.OPENAI_API_KEY'),
      openrouterApiKey: this.config.get<string>('app.OPENROUTER_API_KEY'),
      openaiModel: this.config.get<string>('app.OPENAI_MODEL'),
      openrouterModel: this.config.get<string>('app.OPENROUTER_MODEL'),
      reasoningEffort: this.config.get<string>('app.LLM_REASONING_EFFORT'),
    })
  }

  missingKeyError(): string {
    return MISSING_KEY_MESSAGE
  }

  async complete(messages: LlmMessage[], opts?: LlmOptions): Promise<string> {
    const llmConfig = this.getConfig()
    if (!llmConfig) {
      throw new Error(MISSING_KEY_MESSAGE)
    }
    return callLlm(llmConfig, messages, opts)
  }

  async health(): Promise<AiResponse<LlmHealthData>> {
    const llmConfig = this.getConfig()
    if (!llmConfig) {
      return {
        data: {
          configured: false,
          connected: false,
          provider: null,
          model: null,
          message: 'No LLM API key is configured.',
        },
        error: null,
      }
    }

    const result = await verifyLlmConnection(llmConfig)
    return {
      data: {
        configured: true,
        connected: result.status === 'ok',
        provider: result.provider,
        model: 'model' in result ? result.model : llmConfig.model,
        message: 'message' in result ? result.message : null,
      },
      error: null,
    }
  }

  async onModuleInit(): Promise<void> {
    if ((this.config.get<string>('app.NODE_ENV') ?? process.env['NODE_ENV']) === 'test') {
      return
    }
    const llmConfig = this.getConfig()
    if (!llmConfig) {
      const provider = this.config.get<AppConfig['LLM_PROVIDER']>('app.LLM_PROVIDER') ?? 'openrouter'
      const apiKeyEnvVar = provider === 'openai' ? 'OPENAI_API_KEY' : 'OPENROUTER_API_KEY'
      this.logger.log(
        `AI features disabled: no API key configured for provider "${provider}". Set ${apiKeyEnvVar} to enable AI.`
      )
      return
    }

    this.logger.log(`Verifying LLM connection (${llmConfig.provider}, model: ${llmConfig.model})...`)
    const result = await verifyLlmConnection(llmConfig)
    if (result.status === 'ok') {
      this.logger.log(`LLM connection verified (${result.provider}, model: ${result.model}).`)
      return
    }
    if (result.status === 'error') {
      this.logger.error(
        `LLM connection failed (${result.provider}, model: ${result.model}): ${result.message}`
      )
    }
  }
}
