import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { randomUUID } from 'node:crypto'

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const requestId = request.headers['x-request-id'] ?? randomUUID()
    request['requestId'] = requestId

    const response = context.switchToHttp().getResponse()
    // SSE routes flush their headers before interceptors run.
    if (!response.headersSent) response.setHeader('x-request-id', requestId)

    return next.handle()
  }
}
