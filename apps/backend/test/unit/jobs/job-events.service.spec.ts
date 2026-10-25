import type { ConfigService } from '@nestjs/config'
import type { JobEvent } from '@exam-one/contracts'
import { JobEventsService } from '../../../src/jobs/job-events.service'

type Handler = (...args: string[]) => void
const instances: { handlers: Map<string, Handler>; publish: jest.Mock }[] = []

jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => {
    const handlers = new Map<string, Handler>()
    const instance = {
      handlers,
      on: (event: string, handler: Handler) => {
        handlers.set(event, handler)
      },
      publish: jest.fn().mockResolvedValue(1),
    }
    instances.push(instance)
    return instance
  })
)

describe('JobEventsService', () => {
  const config = { getOrThrow: () => 'redis://localhost:6379' } as unknown as ConfigService

  beforeEach(() => {
    instances.length = 0
  })

  it('only streams events published on the user channel', () => {
    const service = new JobEventsService(config)
    const subscriber = instances[1]!
    const received: JobEvent[] = []
    service.streamFor('user-a').subscribe(event => received.push(event))

    subscriber.handlers.get('pmessage')!(
      'jobs:user:*',
      'jobs:user:user-b',
      JSON.stringify({ type: 'heartbeat' })
    )
    subscriber.handlers.get('pmessage')!(
      'jobs:user:*',
      'jobs:user:user-a',
      JSON.stringify({ type: 'remove', id: 'j', revision: 2 })
    )
    subscriber.handlers.get('pmessage')!('jobs:user:*', 'jobs:user:user-a', 'not json')

    expect(received).toEqual([{ type: 'remove', id: 'j', revision: 2 }])
  })

  it('publishes to the per-user channel', async () => {
    const service = new JobEventsService(config)
    await service.publish('user-a', { type: 'heartbeat' })
    expect(instances[0]!.publish).toHaveBeenCalledWith('jobs:user:user-a', '{"type":"heartbeat"}')
  })
})
