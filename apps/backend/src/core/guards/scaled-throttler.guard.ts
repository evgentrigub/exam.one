import { Injectable } from '@nestjs/common'
import { ThrottlerGuard, type ThrottlerRequest } from '@nestjs/throttler'

/**
 * `RATE_LIMIT_MULTIPLIER` (default 1) scales every rate limit, the global one and each route's
 * `@Throttle` override. Test stacks drive many accounts from one IP and set it high; a real
 * instance leaves it unset. Anything other than a whole number >= 1 is ignored.
 */
export function rateLimitMultiplier(raw: string | undefined): number {
  const value = Number(raw?.trim() || '1')
  return Number.isSafeInteger(value) && value >= 1 ? value : 1
}

@Injectable()
export class ScaledThrottlerGuard extends ThrottlerGuard {
  private readonly multiplier = rateLimitMultiplier(process.env['RATE_LIMIT_MULTIPLIER'])

  protected override handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    return super.handleRequest({ ...requestProps, limit: requestProps.limit * this.multiplier })
  }
}
