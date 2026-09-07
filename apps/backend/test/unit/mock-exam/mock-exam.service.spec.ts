import { Test, TestingModule } from '@nestjs/testing'
import { ForbiddenException, HttpException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { MockExamService } from '../../../src/mock-exam/mock-exam.service'
import { makeMockExamAttempt, makeMockExamSet, makeUser } from '../../../src/testing/fixtures'

function expectCode(
  error: unknown,
  type: new (...args: any[]) => HttpException,
  code: string
) {
  expect(error).toBeInstanceOf(type)
  expect((error as HttpException).getResponse()).toEqual(expect.objectContaining({ code }))
}

describe('MockExamService', () => {
  let service: MockExamService
  let prisma: {
    setting: { findUnique: jest.Mock }
    mockExamSet: {
      findMany: jest.Mock
      findFirst: jest.Mock
      create: jest.Mock
      update: jest.Mock
      delete: jest.Mock
    }
    mockExamAttempt: {
      findUnique: jest.Mock
      upsert: jest.Mock
      update: jest.Mock
      deleteMany: jest.Mock
    }
  }

  const user = makeUser()

  beforeEach(async () => {
    prisma = {
      setting: { findUnique: jest.fn().mockResolvedValue({ packId: 'goethe-de-a2' }) },
      mockExamSet: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
      },
      mockExamAttempt: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({}),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [MockExamService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(MockExamService)
  })

  it('lists bundled seeds and the current user sets', async () => {
    const seed = makeMockExamSet()
    const owned = makeMockExamSet({
      id: 'set-2',
      userId: user.id,
      externalId: 'generated-set',
      generated: true,
      title: 'Generated',
    })
    prisma.mockExamSet.findMany.mockResolvedValue([seed, owned])

    const rows = await service.listSets(user)

    expect(prisma.mockExamSet.findMany).toHaveBeenCalledWith({
      where: { packId: 'goethe-de-a2', OR: [{ generated: false, userId: null }, { userId: user.id }] },
      orderBy: { createdAt: 'asc' },
    })
    expect(rows.map(row => row.externalId)).toEqual(['set-1', 'generated-set'])
  })

  it('rejects getSet when the set is missing', async () => {
    prisma.mockExamSet.findFirst.mockResolvedValue(null)

    try {
      await service.getSet(user, 'missing')
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'SET_NOT_FOUND')
    }
  })

  it('returns a mapped set', async () => {
    const set = makeMockExamSet({ content: { reading: [] }, modules: { reading: true } })
    prisma.mockExamSet.findFirst.mockResolvedValue(set)

    const result = await service.getSet(user, set.externalId)

    expect(result.externalId).toBe(set.externalId)
    expect(result.content).toEqual({ reading: [] })
  })

  it('creates a new generated set', async () => {
    prisma.mockExamSet.findFirst.mockResolvedValue(null)
    const created = makeMockExamSet({
      id: 'new-set',
      userId: user.id,
      externalId: 'gen-1',
      generated: true,
      title: 'Generated Set',
    })
    prisma.mockExamSet.create.mockResolvedValue(created)

    const result = await service.createSet(user, {
      id: 'gen-1',
      examId: 'goethe-a2',
      level: 'A2',
      title: 'Generated Set',
      generated: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      content: { listening: [] },
      modules: {},
    })

    expect(prisma.mockExamSet.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: user.id,
        externalId: 'gen-1',
        generated: true,
      }),
    })
    expect(prisma.mockExamSet.update).not.toHaveBeenCalled()
    expect(result.externalId).toBe('gen-1')
  })

  it('preserves the stored definition when the same externalId is submitted again', async () => {
    const existing = makeMockExamSet({
      id: 'existing',
      userId: user.id,
      externalId: 'gen-1',
      generated: true,
    })
    prisma.mockExamSet.findFirst.mockResolvedValue(existing)
    prisma.mockExamSet.update.mockResolvedValue({ ...existing, title: 'Updated' })

    await service.createSet(user, {
      id: 'gen-1',
      examId: 'goethe-a2',
      level: 'A2',
      title: 'Updated',
      generated: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      content: {},
      modules: {},
    })

    expect(prisma.mockExamSet.update).not.toHaveBeenCalled()
    expect(prisma.mockExamSet.create).not.toHaveBeenCalled()
  })

  it('deletes an owned set and returns listening ids', async () => {
    const owned = makeMockExamSet({
      id: 'owned',
      userId: user.id,
      externalId: 'gen-1',
      generated: true,
      content: { listening: [{ id: 'l-1' }, { id: 'l-2' }, { title: 'no-id' }] },
    })
    prisma.mockExamSet.findFirst.mockResolvedValueOnce(owned)

    const listeningIds = await service.deleteSet(user, 'gen-1')

    expect(listeningIds).toEqual(['l-1', 'l-2'])
    expect(prisma.mockExamSet.delete).toHaveBeenCalledWith({ where: { id: owned.id } })
  })

  it('rejects deleting bundled Set 1', async () => {
    prisma.mockExamSet.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeMockExamSet({ generated: false, externalId: 'set-1' }))

    try {
      await service.deleteSet(user, 'set-1')
      fail('expected ForbiddenException')
    } catch (error) {
      expectCode(error, ForbiddenException, 'SEED_LOCKED')
    }
  })

  it('rejects deleting an unknown set', async () => {
    prisma.mockExamSet.findFirst.mockResolvedValue(null)

    try {
      await service.deleteSet(user, 'missing')
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'SET_NOT_FOUND')
    }
  })

  it('returns null when getAttempt has no row', async () => {
    prisma.mockExamSet.findFirst.mockResolvedValue(makeMockExamSet())
    prisma.mockExamAttempt.findUnique.mockResolvedValue(null)

    await expect(service.getAttempt(user, 'set-1')).resolves.toBeNull()
  })

  it('maps setExternalId on getAttempt', async () => {
    const set = makeMockExamSet()
    const attempt = makeMockExamAttempt({ set })
    prisma.mockExamSet.findFirst.mockResolvedValue(set)
    prisma.mockExamAttempt.findUnique.mockResolvedValue(attempt)

    const result = await service.getAttempt(user, set.externalId)

    expect(result?.setExternalId).toBe(set.externalId)
    expect(prisma.mockExamAttempt.findUnique).toHaveBeenCalledWith({
      where: { userId_setId: { userId: user.id, setId: set.id } },
      include: { set: true },
    })
  })

  it('rejects getAttempt when the set is missing', async () => {
    prisma.mockExamSet.findFirst.mockResolvedValue(null)

    try {
      await service.getAttempt(user, 'missing')
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'SET_NOT_FOUND')
    }
  })

  it('upserts an attempt with the compound userId_setId key', async () => {
    const set = makeMockExamSet()
    prisma.mockExamSet.findFirst.mockResolvedValue(set)
    prisma.mockExamAttempt.upsert.mockResolvedValue(
      makeMockExamAttempt({ set, state: { module: 'listening' } })
    )

    await service.upsertAttempt(user, set.externalId, { module: 'listening' })

    expect(prisma.mockExamAttempt.upsert).toHaveBeenCalledWith({
      where: { userId_setId: { userId: user.id, setId: set.id } },
      create: { userId: user.id, setId: set.id, state: { module: 'listening' } },
      update: { state: { module: 'listening' } },
      include: { set: true },
    })
  })

  it('retries upsertAttempt as an update when the unique constraint races', async () => {
    const set = makeMockExamSet()
    const attempt = makeMockExamAttempt({ set, state: { module: 'listening' } })
    prisma.mockExamSet.findFirst.mockResolvedValue(set)
    prisma.mockExamAttempt.upsert.mockRejectedValue({ code: 'P2002' })
    prisma.mockExamAttempt.update.mockResolvedValue(attempt)

    const result = await service.upsertAttempt(user, set.externalId, { module: 'listening' })

    expect(prisma.mockExamAttempt.update).toHaveBeenCalledWith({
      where: { userId_setId: { userId: user.id, setId: set.id } },
      data: { state: { module: 'listening' } },
      include: { set: true },
    })
    expect(result?.setExternalId).toBe(set.externalId)
  })

  it('rejects upsertAttempt when the set is missing', async () => {
    prisma.mockExamSet.findFirst.mockResolvedValue(null)

    try {
      await service.upsertAttempt(user, 'missing', {})
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'SET_NOT_FOUND')
    }
  })

  it('no-ops deleteAttempt when the set is missing', async () => {
    prisma.mockExamSet.findFirst.mockResolvedValue(null)

    await service.deleteAttempt(user, 'missing')

    expect(prisma.mockExamAttempt.deleteMany).not.toHaveBeenCalled()
  })

  it('deletes attempts for a known set', async () => {
    const set = makeMockExamSet({ userId: user.id, generated: true })
    prisma.mockExamSet.findFirst.mockResolvedValue(set)

    await service.deleteAttempt(user, set.externalId)

    expect(prisma.mockExamAttempt.deleteMany).toHaveBeenCalledWith({
      where: { userId: user.id, setId: set.id },
    })
  })
})
