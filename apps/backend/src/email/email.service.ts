import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer, { type Transporter } from 'nodemailer'
import type { AppConfig } from '../config/app.config'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: Transporter | null = null

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    const provider = this.config.getOrThrow<AppConfig['EMAIL_PROVIDER']>('app.EMAIL_PROVIDER')
    if (provider !== 'smtp') return false
    const host = this.config.get<string>('app.SMTP_HOST') ?? ''
    return host.length > 0
  }

  async sendMail(options: {
    to: string
    subject: string
    text: string
    html?: string
  }): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn(`Email skipped (SMTP not configured): ${options.subject} → ${options.to}`)
      return
    }

    const transporter = this.getTransporter()
    const from = this.config.getOrThrow<string>('app.SMTP_FROM')
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text,
    })
    this.logger.log(`Email sent: ${options.subject} → ${options.to}`)
  }

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('app.SMTP_HOST'),
      port: this.config.getOrThrow<number>('app.SMTP_PORT'),
      secure: this.config.getOrThrow<number>('app.SMTP_PORT') === 465,
      auth: {
        user: this.config.getOrThrow<string>('app.SMTP_USER'),
        pass: this.config.getOrThrow<string>('app.SMTP_PASS'),
      },
    })
    return this.transporter
  }
}
