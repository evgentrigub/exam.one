import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { User } from '@exam-one/database'

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest<{ user: User }>()
  return request.user
})
