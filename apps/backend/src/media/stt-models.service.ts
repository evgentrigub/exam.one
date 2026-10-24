import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { SttModelsDto } from '@exam-one/contracts'

@Injectable()
export class SttModelsService {
  constructor(private readonly config: ConfigService) {}

  private async request(path: string, method = 'GET', body?: object): Promise<Response> {
    const base = this.config.getOrThrow<string>('app.STT_BASE_URL').replace(/\/+$/, '')
    try {
      return await fetch(`${base}/v1/models/stt${path}`, {
        method,
        ...(body
          ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
          : {}),
        signal: AbortSignal.timeout(10_000),
      })
    } catch {
      throw new ServiceUnavailableException({
        code: 'STT_OFFLINE',
        message: 'The speech recognition service is offline',
      })
    }
  }

  async list(): Promise<SttModelsDto> {
    const empty: SttModelsDto = {
      online: false,
      manageable: false,
      installedBytes: 0,
      models: [],
    }
    try {
      const response = await this.request('')
      if (!response.ok) return { ...empty, online: true }
      const catalog = (await response.json()) as Partial<SttModelsDto>
      if (!Array.isArray(catalog.models)) return { ...empty, online: true }
      return {
        ...empty,
        ...catalog,
        online: true,
        manageable: true,
      }
    } catch {
      return empty
    }
  }

  async mutate(id: string, operation: 'download' | 'cancel' | 'remove'): Promise<unknown> {
    if (!/^[a-z0-9][a-z0-9-]{1,60}$/.test(id)) {
      throw new BadRequestException({
        code: 'INVALID_STT_MODEL',
        message: 'Unknown speech recognition model',
      })
    }
    const catalog = await this.list()
    if (!catalog.manageable) {
      throw new ServiceUnavailableException({
        code: 'STT_MANAGEMENT_UNAVAILABLE',
        message: 'This STT endpoint does not support model management',
      })
    }
    const model = catalog.models.find(model => model.id === id)
    if (!model) {
      throw new BadRequestException({
        code: 'INVALID_STT_MODEL',
        message: 'Unknown speech recognition model',
      })
    }
    if (operation === 'download' && model.downloadable === false) {
      throw new BadRequestException({
        code: 'STT_MODEL_RETIRED',
        message: 'This legacy model is no longer downloadable; install the recommended model',
      })
    }
    return this.result(
      await this.request(
        `/${encodeURIComponent(id)}${operation === 'remove' ? '' : '/download'}`,
        operation === 'download' ? 'POST' : 'DELETE'
      )
    )
  }

  async prefer(lang: string, modelId: string): Promise<unknown> {
    const catalog = await this.list()
    if (!catalog.manageable)
      throw new ServiceUnavailableException({ code: 'STT_MANAGEMENT_UNAVAILABLE' })
    const model = catalog.models.find(entry => entry.id === modelId)
    if (!model?.installed || model.downloadable === false || !model.languages.includes(lang)) {
      throw new BadRequestException({
        code: 'INVALID_STT_MODEL',
        message: 'Select an installed model supporting this language',
      })
    }
    return this.result(await this.request('/preferred', 'PUT', { lang, modelId }))
  }

  private async result(response: Response): Promise<unknown> {
    const body = (await response.json().catch(() => ({}))) as { detail?: string }
    if (response.status === 409)
      throw new ConflictException({ code: 'STT_MODEL_BUSY', message: body.detail })
    if (!response.ok)
      throw new BadRequestException({
        code: 'STT_MODEL_ERROR',
        message: body.detail || 'Speech model operation failed',
      })
    return body
  }
}
