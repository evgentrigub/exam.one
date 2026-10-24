import { prunePractice } from '../../../../../libraries/database/src/prune'
import type { PrismaClient } from '../../../../../libraries/database/src/generated/prisma/client'

describe('Scoped practice pruning', () => {
  function client() {
    const events: string[] = []
    const table = (name: string) => ({
      deleteMany: jest.fn(async () => {
        events.push(name)
        return { count: 1 }
      }),
    })
    const db = {
      result: table('results'),
      attempt: table('attempts'),
      mockExamAttempt: table('mockAttempts'),
      mockExamSet: table('mockSets'),
      draft: table('drafts'),
      exercise: table('exercises'),
      promptOverride: table('prompts'),
      backgroundJob: {
        ...table('jobs'),
        updateMany: jest.fn(async () => {
          events.push('cancel')
          return { count: 1 }
        }),
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn(),
      user: { deleteMany: jest.fn() },
      session: { deleteMany: jest.fn() },
      setting: { deleteMany: jest.fn() },
    }
    db.$transaction.mockImplementation((fn: (tx: typeof db) => unknown) => fn(db))
    return { db, events }
  }
  it('cancels first, deletes only C1 children and records, and never touches accounts/settings', async () => {
    const { db, events } = client()
    await prunePractice(db as unknown as PrismaClient, 'goethe-de-c1')
    expect(events.slice(0, 2)).toEqual(['cancel', 'cancel'])
    expect(db.backgroundJob.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { packId: 'goethe-de-c1', status: 'RUNNING' },
        data: expect.objectContaining({ status: 'CANCEL_REQUESTED' }),
      })
    )
    for (const name of ['attempt', 'mockExamSet', 'draft', 'exercise', 'backgroundJob'] as const)
      expect(db[name].deleteMany).toHaveBeenCalledWith({ where: { packId: 'goethe-de-c1' } })
    expect(db.result.deleteMany).toHaveBeenCalledWith({
      where: { attempt: { packId: 'goethe-de-c1' } },
    })
    expect(db.mockExamAttempt.deleteMany).toHaveBeenCalledWith({
      where: { set: { packId: 'goethe-de-c1' } },
    })
    expect(db.promptOverride.deleteMany).toHaveBeenCalledWith({ where: { level: 'C1' } })
    expect(db.user.deleteMany).not.toHaveBeenCalled()
    expect(db.session.deleteMany).not.toHaveBeenCalled()
    expect(db.setting.deleteMany).not.toHaveBeenCalled()
  })
  it('rejects an unknown pack before changing anything', async () => {
    const { db } = client()
    await expect(prunePractice(db as unknown as PrismaClient, 'missing-pack')).rejects.toThrow(
      'Unknown pack'
    )
    expect(db.backgroundJob.updateMany).not.toHaveBeenCalled()
    expect(db.$transaction).not.toHaveBeenCalled()
  })
})
