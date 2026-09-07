import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'
import {
  PromptOverridesService,
  assertPromptSlot,
} from '../../../src/prompt-overrides/prompt-overrides.service'
import { makePromptOverride, makeUser } from '../../../src/testing/fixtures'

function expectCode(
  error: unknown,
  type: new (...args: any[]) => HttpException,
  code: string
) {
  expect(error).toBeInstanceOf(type)
  expect((error as HttpException).getResponse()).toEqual(expect.objectContaining({ code }))
}

describe('PromptOverridesService', () => {
  let service: PromptOverridesService
  let prisma: {
    promptOverride: {
      findMany: jest.Mock
      findUnique: jest.Mock
      upsert: jest.Mock
      delete: jest.Mock
    }
  }

  const user = makeUser()

  beforeEach(async () => {
    prisma = {
      promptOverride: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptOverridesService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(PromptOverridesService)
  })

  it('lists overrides for the current user', async () => {
    prisma.promptOverride.findMany.mockResolvedValue([makePromptOverride()])

    const rows = await service.list(user)

    expect(prisma.promptOverride.findMany).toHaveBeenCalledWith({
      where: { userId: user.id },
      orderBy: [{ skill: 'asc' }, { part: 'asc' }, { kind: 'asc' }],
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]?.kind).toBe('GENERATOR')
  })

  it('upserts by the compound userId_skill_level_part_kind key', async () => {
    prisma.promptOverride.upsert.mockResolvedValue(
      makePromptOverride({ body: 'Custom reading prompt' })
    )

    await service.upsert(user, 'READING', 'A2', 1, 'GENERATOR', 'Custom reading prompt')

    expect(prisma.promptOverride.upsert).toHaveBeenCalledWith({
      where: {
        userId_skill_level_part_kind: {
          userId: user.id,
          skill: 'READING',
          level: 'A2',
          part: 1,
          kind: 'GENERATOR',
        },
      },
      create: {
        userId: user.id,
        skill: 'READING',
        level: 'A2',
        part: 1,
        kind: 'GENERATOR',
        body: 'Custom reading prompt',
      },
      update: { body: 'Custom reading prompt' },
    })
  })

  it('rejects an unsupported slot on upsert', async () => {
    try {
      await service.upsert(user, 'READING', 'A2', 1, 'REVIEW', 'nope')
      fail('expected BadRequestException')
    } catch (error) {
      expectCode(error, BadRequestException, 'PROMPT_OVERRIDE_INVALID_SLOT')
    }
  })

  it('rejects remove when the override is missing', async () => {
    prisma.promptOverride.findUnique.mockResolvedValue(null)

    try {
      await service.remove(user, 'WRITING', 'A2', 1, 'GENERATOR')
      fail('expected NotFoundException')
    } catch (error) {
      expectCode(error, NotFoundException, 'PROMPT_OVERRIDE_NOT_FOUND')
    }
  })

  it('deletes an existing override by id', async () => {
    const row = makePromptOverride({ skill: 'WRITING', kind: 'ANSWER', part: 2 })
    prisma.promptOverride.findUnique.mockResolvedValue(row)

    await service.remove(user, 'WRITING', 'A2', 2, 'ANSWER')

    expect(prisma.promptOverride.delete).toHaveBeenCalledWith({ where: { id: row.id } })
  })
})

describe('assertPromptSlot', () => {
  it('accepts live A2 reading generator parts', () => {
    expect(() => assertPromptSlot('READING', 'A2', 4, 'GENERATOR')).not.toThrow()
  })

  it('accepts writing answer and review slots', () => {
    expect(() => assertPromptSlot('WRITING', 'A2', 1, 'ANSWER')).not.toThrow()
    expect(() => assertPromptSlot('SPEAKING', 'A2', 2, 'REVIEW')).not.toThrow()
  })

  it('rejects mock, C1, and speaking Teil 3', () => {
    expect(() => assertPromptSlot('MOCK', 'A2', 1, 'GENERATOR')).toThrow(BadRequestException)
    expect(() => assertPromptSlot('READING', 'C1', 1, 'GENERATOR')).toThrow(BadRequestException)
    expect(() => assertPromptSlot('SPEAKING', 'A2', 3, 'GENERATOR')).toThrow(BadRequestException)
  })
})
