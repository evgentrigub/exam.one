import { protectBoard } from '../../../src/jobs/bull-board'
import type { Request, Response, NextFunction } from 'express'

describe('queue dashboard authorization', () => {
  const user = process.env['BULL_BOARD_USER']
  const password = process.env['BULL_BOARD_PASSWORD']
  afterEach(() => {
    if (user === undefined) delete process.env['BULL_BOARD_USER']
    else process.env['BULL_BOARD_USER'] = user
    if (password === undefined) delete process.env['BULL_BOARD_PASSWORD']
    else process.env['BULL_BOARD_PASSWORD'] = password
  })

  function request(header?: string) {
    const response = { sendStatus: jest.fn(), setHeader: jest.fn() }
    const next = jest.fn()
    protectBoard(
      { headers: { authorization: header } } as Request,
      response as unknown as Response,
      next as NextFunction
    )
    return { response, next }
  }

  it('does not serve the board without configured credentials', () => {
    delete process.env['BULL_BOARD_USER']
    delete process.env['BULL_BOARD_PASSWORD']
    expect(request().response.sendStatus).toHaveBeenCalledWith(404)
  })

  it('rejects missing or incorrect credentials', () => {
    process.env['BULL_BOARD_USER'] = 'operator'
    process.env['BULL_BOARD_PASSWORD'] = 'secret'
    expect(request().response.sendStatus).toHaveBeenCalledWith(401)
    expect(
      request(`Basic ${Buffer.from('operator:incorrect').toString('base64')}`).response.sendStatus
    ).toHaveBeenCalledWith(401)
  })

  it('accepts a matching user and password', () => {
    process.env['BULL_BOARD_USER'] = 'operator'
    process.env['BULL_BOARD_PASSWORD'] = 'secret'
    const { next } = request(`Basic ${Buffer.from('operator:secret').toString('base64')}`)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
