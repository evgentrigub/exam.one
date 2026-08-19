import type { Request } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    cookies?: Record<string, string | undefined>
    user?: unknown
  }
}

export type AuthedRequest = Request & { user: import('@exam-one/database').User }
