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

  it('upserts the default Cambridge A2 Key pack on getMe for a new account', async () => {
    const setting = makeSetting({ packId: 'cambridge-en-a2', targetLanguage: 'en' })
    prisma.setting.upsert.mockResolvedValue(setting)

    const result = await service.getMe(user)

    expect(prisma.setting.upsert).toHaveBeenCalledWith({
      where: { userId: user.id },
      update: { packId: 'cambridge-en-a2', examLevel: 'A2', targetLanguage: 'en' },
      create: {
        userId: user.id,
        packId: 'cambridge-en-a2',
        examLevel: 'A2',
        targetLanguage: 'en',
      },
    })
    expect(result).toEqual(
      expect.objectContaining({
        userId: user.id,
        packId: 'cambridge-en-a2',
        examLevel: 'A2',
        targetLanguage: 'en',
      })
    )
  })

  it('ignores a requested examLevel and keeps the current pack', async () => {
    prisma.setting.findUnique.mockResolvedValue(
      makeSetting({ packId: 'certpol-pl-a2', targetLanguage: 'pl' })
    )
    prisma.setting.upsert.mockResolvedValue(makeSetting())

    await service.updateMe(user, { examLevel: 'C1' })

    expect(prisma.setting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { packId: 'certpol-pl-a2', examLevel: 'A2', targetLanguage: 'pl' },
      })
    )
  })

  it('creates with the default pack for omitted fields', async () => {
    prisma.setting.upsert.mockResolvedValue(makeSetting({ targetLanguage: 'en' }))

    await service.updateMe(user, { targetLanguage: 'de' })

    expect(prisma.setting.upsert).toHaveBeenCalledWith({
      where: { userId: user.id },
      update: { packId: 'cambridge-en-a2', examLevel: 'A2', targetLanguage: 'en' },
      create: {
        userId: user.id,
        packId: 'cambridge-en-a2',
        examLevel: 'A2',
        targetLanguage: 'en',
      },
    })
  })
})
