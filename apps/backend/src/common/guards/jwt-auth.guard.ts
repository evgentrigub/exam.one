import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@exam-one/nestjs-libraries'
import type { Request } from 'express'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { ACCESS_COOKIE } from '../../auth/auth.constants'
import type { AppConfig } from '../../config/app.config'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>()
    const token = request.cookies?.[ACCESS_COOKIE] as string | undefined
    if (!token) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      })
    }

    try {
      const secret = this.config.getOrThrow<AppConfig['JWT_SECRET']>('app.JWT_SECRET')
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, { secret })
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user) {
        throw new UnauthorizedException({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })
      }
      request.user = user
      return true
    } catch {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      })
    }
  }
}
