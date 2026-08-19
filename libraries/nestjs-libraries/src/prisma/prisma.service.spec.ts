import { PrismaService } from './prisma.service'

describe('PrismaService', () => {
  let service: PrismaService

  beforeEach(() => {
    service = new PrismaService()
  })

  it('connects on module init', async () => {
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined)

    await service.onModuleInit()

    expect(connectSpy).toHaveBeenCalledTimes(1)
  })

  it('disconnects on module destroy', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined)

    await service.onModuleDestroy()

    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })
})
