import { Test, TestingModule } from '@nestjs/testing'
import { HttpException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { DraftsService } from './drafts.service'
import { makeDraft, makeUser } from '../testing/fixtures'

function expectCode(error: unknown, type: typeof HttpException, code: string) {
  expect(error).toBeInstanceOf(type)
  expect((error as HttpException).getResponse()).toEqual(expect.objectContaining({ code }))
}

describe('DraftsService', () => {
  let service: DraftsService
  let prisma: {
    setting: { findUnique: jest.Mock }
    draft: {
      count: jest.Mock
      findMany: jest.Mock
      findUnique: jest.Mock
      upsert: jest.Mock
      delete: jest.Mock
    }
  }

  const user = makeUser()

  beforeEach(async () => {
    prisma = {
      setting: { findUnique: jest.fn().mockResolvedValue({ packId: 'goethe-de-a2' }) },
      draft: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [DraftsService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(DraftsService)
  })

  it('lists drafts for a skill', async () => {
    prisma.draft.findMany.mockResolvedValue([makeDraft({ topicId: 't-1' })])

    const rows = await service.list(user, 'WRITING')

    expect(prisma.draft.findMany).toHaveBeenCalledWith({
      where: { userId: user.id, packId: 'goethe-de-a2', skill: 'WRITING' },
      orderBy: { updatedAt: 'desc' },
    })
    expect(rows[0]?.topicId).toBe('t-1')
  })

  it('returns null from get when no draft exists', async () => {
    prisma.draft.findUnique.mockResolvedValue(null)

    await expect(service.get(user, 'WRITING', 'missing')).resolves.toBeNull()
  })

  it('maps an existing draft from get', async () => {
    const draft = makeDraft()
    prisma.draft.findUnique.mockResolvedValue(draft)

    const result = await service.get(user, 'WRITING', draft.topicId)

    expect(prisma.draft.findUnique).toHaveBeenCalledWith({
      where: {
        userId_packId_skill_topicId: { userId: user.id, packId: 'goethe-de-a2', skill: 'WRITING', topicId: draft.topicId },
      },
    })
    expect(result?.payload).toEqual({ text: 'Hallo' })
  })

  it('upserts by the compound userId_packId_skill_topicId key', async () => {
    prisma.draft.upsert.mockResolvedValue(makeDraft({ payload: { text: 'Neu' } }))

    await service.upsert(user, 'WRITING', 'topic-1', { text: 'Neu' })

    expect(prisma.draft.upsert).toHaveBeenCalledWith({
      where: { userId_packId_skill_topicId: { userId: user.id, packId: 'goethe-de-a2', skill: 'WRITING', topicId: 'topic-1' } },
      create: {
        userId: user.id,
        packId: 'goethe-de-a2',
        skill: 'WRITING',
        topicId: 'topic-1',
        payload: { text: 'Neu' },
      },
      update: { payload: { text: 'Neu' } },
    })
  })

  it('rejects remove when the draft is missing', async () => {
    prisma.draft.findUnique.mockResolvedValue(null)

    try {
      await service.remove(user, 'WRITING', 'missing')
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'DRAFT_NOT_FOUND')
    }
  })

  it('deletes an existing draft by id', async () => {
    const draft = makeDraft()
    prisma.draft.findUnique.mockResolvedValue(draft)

    await service.remove(user, 'WRITING', draft.topicId)

    expect(prisma.draft.delete).toHaveBeenCalledWith({ where: { id: draft.id } })
  })
})
