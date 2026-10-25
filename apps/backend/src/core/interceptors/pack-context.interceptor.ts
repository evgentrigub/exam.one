import { PrismaService } from '@exam-one/nestjs-libraries'
import { AsyncLocalStorage } from 'node:async_hooks'
import {
  BadRequestException,
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { getPack, getLivePack } from '@exam-one/exam-packs'

export const packContext = new AsyncLocalStorage<{ packId?: string; userId?: string }>()

/** Request-scoped identity survives asynchronous provider calls and concurrent pack switches. */
@Injectable()
export class PackContextInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>
      method: string
      url: string
      user?: { id: string }
    }>()
    const explicit = req.headers['x-exam-pack']
    const setting =
      !explicit && req.user
        ? await this.prisma.setting.findUnique({ where: { userId: req.user.id } })
        : null
    const id = explicit
      ? (getPack(explicit)?.packId ?? explicit)
      : setting
        ? getLivePack(setting.packId).packId
        : undefined
    if (id && !getPack(id)?.live && !(req.method === 'GET' && req.url.includes('/attempts'))) {
      throw new BadRequestException({
        code: 'PACK_UNAVAILABLE',
        message: 'Choose a registered live exam pack',
      })
    }
    return new Observable(subscriber =>
      packContext.run(
        { ...(id ? { packId: id } : {}), ...(req.user ? { userId: req.user.id } : {}) },
        () => {
          const subscription = next.handle().subscribe(subscriber)
          return () => subscription.unsubscribe()
        }
      )
    )
  }
}
