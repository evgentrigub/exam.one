import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { EmailService } from '../../../src/core/email/email.service'

const sendMail = jest.fn().mockResolvedValue({})
const createTransport = jest.fn().mockReturnValue({ sendMail })

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: (...args: unknown[]) => createTransport(...args),
  },
}))

describe('EmailService', () => {
  let config: { getOrThrow: jest.Mock; get: jest.Mock }

  function configFrom(map: Record<string, string | number>) {
    config = {
      getOrThrow: jest.fn((key: string) => {
        if (!(key in map)) throw new Error(`missing ${key}`)
        return map[key]
      }),
      get: jest.fn((key: string) => map[key]),
    }
    return config
  }

  async function createService(map: Record<string, string | number>) {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService, { provide: ConfigService, useValue: configFrom(map) }],
    }).compile()
    return module.get(EmailService)
  }

  beforeEach(() => {
    sendMail.mockClear()
    createTransport.mockClear()
  })

  it('is not configured when the provider is not smtp', async () => {
    const service = await createService({ 'app.EMAIL_PROVIDER': 'none' })
    expect(service.isConfigured()).toBe(false)
  })

  it('is not configured when SMTP host is empty', async () => {
    const service = await createService({
      'app.EMAIL_PROVIDER': 'smtp',
      'app.SMTP_HOST': '',
    })
    expect(service.isConfigured()).toBe(false)
  })

  it('is configured when smtp has a host', async () => {
    const service = await createService({
      'app.EMAIL_PROVIDER': 'smtp',
      'app.SMTP_HOST': 'localhost',
    })
    expect(service.isConfigured()).toBe(true)
  })

  it('skips sendMail when SMTP is not configured', async () => {
    const service = await createService({ 'app.EMAIL_PROVIDER': 'none' })

    await service.sendMail({ to: 'a@b.com', subject: 'Hi', text: 'Hello' })

    expect(createTransport).not.toHaveBeenCalled()
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('sends mail through the SMTP transport', async () => {
    const service = await createService({
      'app.EMAIL_PROVIDER': 'smtp',
      'app.SMTP_HOST': 'smtp.example.com',
      'app.SMTP_PORT': 587,
      'app.SMTP_USER': 'user',
      'app.SMTP_PASS': 'pass',
      'app.SMTP_FROM': 'exam.one <noreply@localhost>',
    })

    await service.sendMail({
      to: 'ada@example.com',
      subject: 'Confirm',
      text: 'Code 123',
      html: '<p>Code 123</p>',
    })

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: { user: 'user', pass: 'pass' },
    })
    expect(sendMail).toHaveBeenCalledWith({
      from: 'exam.one <noreply@localhost>',
      to: 'ada@example.com',
      subject: 'Confirm',
      text: 'Code 123',
      html: '<p>Code 123</p>',
    })
  })

  it('uses port 465 as secure and falls back html to text', async () => {
    const service = await createService({
      'app.EMAIL_PROVIDER': 'smtp',
      'app.SMTP_HOST': 'smtp.example.com',
      'app.SMTP_PORT': 465,
      'app.SMTP_USER': 'user',
      'app.SMTP_PASS': 'pass',
      'app.SMTP_FROM': 'noreply@localhost',
    })

    await service.sendMail({ to: 'ada@example.com', subject: 'Hi', text: 'Hello' })

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 465, secure: true })
    )
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ html: 'Hello' }))
  })
})
