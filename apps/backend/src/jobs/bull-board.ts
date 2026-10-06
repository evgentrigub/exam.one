import { createHash, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

function equal(left: string, right: string): boolean {
  const a = createHash('sha256').update(left).digest()
  const b = createHash('sha256').update(right).digest()
  return timingSafeEqual(a, b)
}

export function protectBoard(request: Request, response: Response, next: NextFunction): void {
  const expectedUser = process.env['BULL_BOARD_USER'] ?? ''
  const expectedPassword = process.env['BULL_BOARD_PASSWORD'] ?? ''
  if (!expectedUser || !expectedPassword) {
    response.sendStatus(404)
    return
  }
  const header = request.headers.authorization ?? ''
  const decoded = header.startsWith('Basic ') ? Buffer.from(header.slice(6), 'base64').toString('utf8') : ''
  const separator = decoded.indexOf(':')
  if (separator < 0 || !equal(decoded.slice(0, separator), expectedUser) || !equal(decoded.slice(separator + 1), expectedPassword)) {
    response.setHeader('WWW-Authenticate', 'Basic realm="Queues"')
    response.sendStatus(401)
    return
  }
  next()
}
