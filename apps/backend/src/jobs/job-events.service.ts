import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { JobEvent } from '@exam-one/contracts'
import Redis from 'ioredis'
import { Observable, Subject, filter, map } from 'rxjs'
import type { AppConfig } from '../config/app.config'

@Injectable()
export class JobEventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobEventsService.name)
  private readonly publisher: Redis
  private readonly subscriber: Redis
  private readonly events = new Subject<{ userId: string; event: JobEvent }>()

  constructor(config: ConfigService) {
    const url = config.getOrThrow<AppConfig['REDIS_URL']>('app.REDIS_URL')
    // Keep reconnecting after blips; ioredis re-subscribes the pattern on reconnect.
    const options = { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 5000, retryStrategy: (times: number) => Math.min(times * 200, 5000) }
    this.publisher = new Redis(url, options)
    this.subscriber = new Redis(url, options)
    this.publisher.on('error', () => this.logger.warn('Redis publisher unavailable'))
    this.subscriber.on('error', () => this.logger.warn('Redis subscriber unavailable'))
    this.subscriber.on('pmessage', (_pattern, channel, message) => {
      try {
        this.events.next({ userId: channel.slice('jobs:user:'.length), event: JSON.parse(message) as JobEvent })
      } catch {
        return
      }
    })
  }

  async onModuleInit(): Promise<void> {
    await Promise.all([this.publisher.connect(), this.subscriber.connect()])
    await this.publisher.ping()
    await this.subscriber.psubscribe('jobs:user:*')
  }

  async onModuleDestroy(): Promise<void> {
    this.events.complete()
    await Promise.all([this.publisher.quit(), this.subscriber.quit()])
  }

  async ping(): Promise<void> {
    await this.publisher.ping()
  }

  streamFor(userId: string): Observable<JobEvent> {
    return this.events.pipe(filter(message => message.userId === userId), map(message => message.event))
  }

  async publish(userId: string, event: JobEvent): Promise<void> {
    await this.publisher.publish(`jobs:user:${userId}`, JSON.stringify(event))
  }
}
