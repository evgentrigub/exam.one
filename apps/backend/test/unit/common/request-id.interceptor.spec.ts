import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { of } from 'rxjs'
import { RequestIdInterceptor } from '../../../src/core/interceptors/request-id.interceptor'

function context(headersSent: boolean) {
  const request: Record<string, unknown> = { headers: { 'x-request-id': 'req-1' } }
  const response = { headersSent, setHeader: jest.fn() }
  const ctx = { switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }) }
  return { ctx: ctx as unknown as ExecutionContext, request, response }
}

describe('RequestIdInterceptor', () => {
  const next: CallHandler = { handle: () => of('ok') }

  it('echoes the request id as a response header', () => {
    const { ctx, request, response } = context(false)
    new RequestIdInterceptor().intercept(ctx, next)
    expect(request['requestId']).toBe('req-1')
    expect(response.setHeader).toHaveBeenCalledWith('x-request-id', 'req-1')
  })

  it('leaves SSE responses alone once their headers are flushed', () => {
    const { ctx, response } = context(true)
    expect(() => new RequestIdInterceptor().intercept(ctx, next)).not.toThrow()
    expect(response.setHeader).not.toHaveBeenCalled()
  })
})
