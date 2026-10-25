import { Injectable } from '@nestjs/common'
import type { AiResponse, LlmHealthData } from '@exam-one/contracts'
import { packContext } from '../core/interceptors/pack-context.interceptor'
import {
  callLlmWithFallback,
  verifyLlmConnection,
  type LlmConfig,
  type LlmMessage,
  type LlmOptions,
} from './llm.adapter'
import { LlmSettingsService } from './llm-settings.service'

const MISSING_KEY_MESSAGE =
  'AI features are unavailable because no API key is configured. Add one in Settings → AI provider.'
const UNCONFIGURED_HEALTH_MESSAGE =
  'No LLM API key is configured. Add one in Settings → AI provider.'

/** LLM access for the current user; HTTP requests and job processors both carry the user in `packContext`. */
@Injectable()
export class LlmService {
  constructor(private readonly settings: LlmSettingsService) {}

  async getConfig(userId = packContext.getStore()?.userId): Promise<LlmConfig | null> {
    if (!userId) return null
    return this.settings.resolveConfig(userId)
  }

  async hasConfig(userId?: string): Promise<boolean> {
    return (await this.getConfig(userId)) !== null
  }

  missingKeyError(): string {
    return MISSING_KEY_MESSAGE
  }

  async complete(messages: LlmMessage[], opts?: LlmOptions): Promise<string> {
    const llmConfig = await this.getConfig()
    if (!llmConfig) {
      throw new Error(MISSING_KEY_MESSAGE)
    }
    return callLlmWithFallback(llmConfig, messages, opts)
  }

  async health(userId?: string): Promise<AiResponse<LlmHealthData>> {
    const llmConfig = await this.getConfig(userId)
    if (!llmConfig) {
      return {
        data: {
          configured: false,
          connected: false,
          provider: null,
          model: null,
          message: UNCONFIGURED_HEALTH_MESSAGE,
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
        model: result.model,
        message: result.status === 'error' ? result.message : null,
      },
      error: null,
    }
  }
}
