import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type {
  LlmKeySummary,
  LlmModelListData,
  LlmProvider,
  LlmSettingsDto,
  UpdateLlmSettingsInput,
} from '@exam-one/contracts'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { decryptSecret, encryptSecret } from '../common/crypto/secret-box'
import type { LlmConfig } from './llm.adapter'
import {
  DEFAULT_LLM_REASONING_EFFORT,
  isLlmProvider,
  isLlmReasoningEffort,
  MAX_LLM_FALLBACK_MODELS,
} from './llm-options'
import { redactSecrets } from './llm-errors'
import { LlmProviderHttpError, listModels } from './llm-providers'

const KEY_LAST_CHARS = 4
/** Rejected key checks per user per day; stops the key check from being used to test stolen keys. */
const MAX_REJECTED_KEY_CHECKS = 20
const REJECTED_KEY_WINDOW_MS = 24 * 60 * 60 * 1000

interface RejectedChecks {
  count: number
  resetAt: number
}

interface CredentialRow {
  provider: string
  keyCiphertext: string
  keyLast4: string
  updatedAt: Date
}

function toKeySummary(row: CredentialRow): LlmKeySummary | null {
  if (!isLlmProvider(row.provider)) return null
  return { provider: row.provider, last4: row.keyLast4, updatedAt: row.updatedAt.toISOString() }
}

/** Authenticated with each sealed key, so a ciphertext only opens for its own user and provider. */
function credentialContext(userId: string, provider: LlmProvider): string {
  return `${userId}:${provider}`
}

function uniqueFallbacks(model: string, fallbacks: string[] | undefined): string[] {
  const cleaned = (fallbacks ?? []).map(id => id.trim()).filter(id => id && id !== model)
  return [...new Set(cleaned)].slice(0, MAX_LLM_FALLBACK_MODELS)
}

/** Per-user LLM provider, model and API keys. Keys are encrypted at rest and never returned. */
@Injectable()
export class LlmSettingsService {
  private readonly logger = new Logger(LlmSettingsService.name)
  private readonly rejectedChecks = new Map<string, RejectedChecks>()

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  private secretsKey(): string {
    return this.config.getOrThrow<string>('app.SECRETS_ENCRYPTION_KEY')
  }

  async get(userId: string): Promise<LlmSettingsDto> {
    const [setting, credentials] = await Promise.all([
      this.prisma.setting.findUnique({ where: { userId } }),
      this.prisma.llmCredential.findMany({ where: { userId }, orderBy: { provider: 'asc' } }),
    ])
    const provider = setting?.llmProvider
    return {
      provider: isLlmProvider(provider) ? provider : null,
      model: setting?.llmModel ?? null,
      fallbackModels: setting?.llmFallbackModels ?? [],
      reasoningEffort: isLlmReasoningEffort(setting?.llmReasoningEffort)
        ? setting.llmReasoningEffort
        : DEFAULT_LLM_REASONING_EFFORT,
      keys: credentials.map(toKeySummary).filter((key): key is LlmKeySummary => key !== null),
    }
  }

  /** Stores a key only after the provider accepts it. */
  async saveKey(userId: string, provider: LlmProvider, rawKey: string): Promise<LlmKeySummary> {
    const apiKey = rawKey.trim()
    await this.checkKey(userId, provider, apiKey)
    const data = {
      keyCiphertext: encryptSecret(apiKey, this.secretsKey(), credentialContext(userId, provider)),
      keyLast4: apiKey.slice(-KEY_LAST_CHARS),
    }
    const row = await this.prisma.llmCredential.upsert({
      where: { userId_provider: { userId, provider } },
      update: data,
      create: { userId, provider, ...data },
    })
    return { provider, last4: row.keyLast4, updatedAt: row.updatedAt.toISOString() }
  }

  async removeKey(userId: string, provider: LlmProvider): Promise<LlmSettingsDto> {
    await this.prisma.llmCredential.deleteMany({ where: { userId, provider } })
    await this.prisma.setting.updateMany({
      where: { userId, llmProvider: provider },
      data: { llmProvider: null, llmModel: null, llmFallbackModels: [] },
    })
    return this.get(userId)
  }

  async models(userId: string, provider: LlmProvider): Promise<LlmModelListData> {
    const apiKey = await this.savedKey(userId, provider)
    if (!apiKey) throw this.missingKey(provider)
    try {
      return { models: await listModels(provider, apiKey) }
    } catch (error: unknown) {
      throw this.providerFailure(provider, error, apiKey)
    }
  }

  async update(userId: string, input: UpdateLlmSettingsInput): Promise<LlmSettingsDto> {
    const credential = await this.prisma.llmCredential.findUnique({
      where: { userId_provider: { userId, provider: input.provider } },
    })
    if (!credential) throw this.missingKey(input.provider)
    const model = input.model.trim()
    const data = {
      llmProvider: input.provider,
      llmModel: model,
      llmFallbackModels: uniqueFallbacks(model, input.fallbackModels),
      llmReasoningEffort: input.reasoningEffort ?? DEFAULT_LLM_REASONING_EFFORT,
    }
    await this.prisma.setting.upsert({ where: { userId }, update: data, create: { userId, ...data } })
    return this.get(userId)
  }

  /** The full config for AI calls, or null until the user has chosen a provider, key and model. */
  async resolveConfig(userId: string): Promise<LlmConfig | null> {
    const setting = await this.prisma.setting.findUnique({ where: { userId } })
    const provider = setting?.llmProvider
    if (!setting || !isLlmProvider(provider) || !setting.llmModel) return null
    const apiKey = await this.savedKey(userId, provider)
    if (!apiKey) return null
    return {
      provider,
      apiKey,
      model: setting.llmModel,
      fallbackModels: setting.llmFallbackModels,
      reasoningEffort: isLlmReasoningEffort(setting.llmReasoningEffort)
        ? setting.llmReasoningEffort
        : DEFAULT_LLM_REASONING_EFFORT,
    }
  }

  private async savedKey(userId: string, provider: LlmProvider): Promise<string | null> {
    const row = await this.prisma.llmCredential.findUnique({
      where: { userId_provider: { userId, provider } },
    })
    if (!row) return null
    try {
      return decryptSecret(row.keyCiphertext, this.secretsKey(), credentialContext(userId, provider))
    } catch {
      // Usually SECRETS_ENCRYPTION_KEY was rotated; the user has to paste the key again.
      this.logger.warn(`Saved ${provider} key for user ${userId} could not be decrypted.`)
      return null
    }
  }

  private async checkKey(userId: string, provider: LlmProvider, apiKey: string): Promise<void> {
    const now = Date.now()
    const rejected = this.rejectedChecks.get(userId)
    if (rejected && rejected.resetAt > now && rejected.count >= MAX_REJECTED_KEY_CHECKS) {
      throw new HttpException(
        { code: 'KEY_CHECKS_EXCEEDED', message: 'Too many rejected keys today. Try again tomorrow.' },
        HttpStatus.TOO_MANY_REQUESTS
      )
    }
    try {
      await listModels(provider, apiKey)
    } catch (error: unknown) {
      const failure = this.providerFailure(provider, error, apiKey)
      if (failure instanceof BadRequestException) {
        const current = rejected && rejected.resetAt > now ? rejected : { count: 0, resetAt: now + REJECTED_KEY_WINDOW_MS }
        this.rejectedChecks.set(userId, { ...current, count: current.count + 1 })
        this.logger.warn(`Rejected ${provider} key check for user ${userId} (${current.count + 1} today).`)
      }
      throw failure
    }
  }

  private missingKey(provider: LlmProvider): BadRequestException {
    return new BadRequestException({ code: 'LLM_KEY_MISSING', message: `Save a ${provider} API key first.` })
  }

  private providerFailure(provider: LlmProvider, error: unknown, apiKey: string): Error {
    if (error instanceof LlmProviderHttpError && (error.status === 401 || error.status === 403)) {
      const scopeHint = error.status === 403 ? ' If it is a restricted key, allow it to read the model list.' : ''
      return new BadRequestException({ code: 'INVALID_API_KEY', message: `${provider} rejected this API key.${scopeHint}` })
    }
    const detail = redactSecrets(error instanceof Error ? error.message : 'Unknown error', apiKey)
    this.logger.warn(`Could not reach ${provider}: ${detail}`)
    return new BadGatewayException({ code: 'LLM_PROVIDER_UNAVAILABLE', message: `Could not reach ${provider}. ${detail}` })
  }
}
