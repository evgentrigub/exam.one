import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { SettingsService } from './settings.service'
import { makeSetting, makeUser } from '../testing/fixtures'

describe('SettingsService', () => {
  let service: SettingsService
  let prisma: {
    setting: {
      count: jest.Mock
      upsert: jest.Mock
    }
  }

  const user = makeUser()

  beforeEach(async () => {
    prisma = {
      setting: {
        count: jest.fn().mockResolvedValue(0),
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

  it('upserts default A2/de settings on getMe', async () => {
    const setting = makeSetting()
    prisma.setting.upsert.mockResolvedValue(setting)

    const result = await service.getMe(user)

    expect(prisma.setting.upsert).toHaveBeenCalledWith({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        examLevel: 'A2',
        targetLanguage: 'de',
      },
    })
    expect(result).toEqual(
      expect.objectContaining({
        userId: user.id,
        examLevel: 'A2',
        targetLanguage: 'de',
      })
    )
  })

  it('updates only provided fields', async () => {
    prisma.setting.upsert.mockResolvedValue(makeSetting({ examLevel: 'C1' }))

    await service.updateMe(user, { examLevel: 'C1' })

    expect(prisma.setting.upsert).toHaveBeenCalledWith({
      where: { userId: user.id },
      update: { examLevel: 'C1' },
      create: {
        userId: user.id,
        examLevel: 'C1',
        targetLanguage: 'de',
      },
    })
  })

  it('creates with defaults for omitted fields', async () => {
    prisma.setting.upsert.mockResolvedValue(makeSetting({ targetLanguage: 'fr' }))

    await service.updateMe(user, { targetLanguage: 'fr' })

    expect(prisma.setting.upsert).toHaveBeenCalledWith({
      where: { userId: user.id },
      update: { targetLanguage: 'fr' },
      create: {
        userId: user.id,
        examLevel: 'A2',
        targetLanguage: 'fr',
      },
    })
  })
})
