import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { SettingsService } from '../../../src/users/settings.service'
import { makeSetting, makeUser } from '../../../src/testing/fixtures'

describe('SettingsService', () => {
  let service: SettingsService
  let prisma: {
    setting: {
      count: jest.Mock
      findUnique: jest.Mock
      upsert: jest.Mock
    }
  }

  const user = makeUser()

  beforeEach(async () => {
    prisma = {
      setting: {
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(SettingsService)
  })

  it('delegates count() to Prisma', async () => {
    await expect(service.count()).resolves.toBe(0)
  })

  it('upserts the live Goethe A2 pack on getMe', async () => {
    const setting = makeSetting()
    prisma.setting.upsert.mockResolvedValue(setting)

    const result = await service.getMe(user)

    expect(prisma.setting.upsert).toHaveBeenCalledWith({
      where: { userId: user.id },
      update: { packId: 'goethe-de-a2', examLevel: 'A2', targetLanguage: 'de' },
      create: {
        userId: user.id,
        packId: 'goethe-de-a2',
        examLevel: 'A2',
        targetLanguage: 'de',
      },
    })
    expect(result).toEqual(
      expect.objectContaining({
        userId: user.id,
        packId: 'goethe-de-a2',
        examLevel: 'A2',
        targetLanguage: 'de',
      })
    )
  })

  it('maps a C1 examLevel request onto the live Goethe A2 pack', async () => {
    prisma.setting.upsert.mockResolvedValue(makeSetting())

    await service.updateMe(user, { examLevel: 'C1' })

    expect(prisma.setting.upsert).toHaveBeenCalledWith({
      where: { userId: user.id },
      update: { packId: 'goethe-de-a2', examLevel: 'A2', targetLanguage: 'de' },
      create: {
        userId: user.id,
        packId: 'goethe-de-a2',
        examLevel: 'A2',
        targetLanguage: 'de',
      },
    })
  })

  it('creates with defaults for omitted fields', async () => {
    prisma.setting.upsert.mockResolvedValue(makeSetting({ targetLanguage: 'de' }))

    await service.updateMe(user, { targetLanguage: 'de' })

    expect(prisma.setting.upsert).toHaveBeenCalledWith({
      where: { userId: user.id },
      update: { packId: 'goethe-de-a2', examLevel: 'A2', targetLanguage: 'de' },
      create: {
        userId: user.id,
        packId: 'goethe-de-a2',
        examLevel: 'A2',
        targetLanguage: 'de',
      },
    })
  })
})
