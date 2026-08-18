import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@exam-one/nestjs-libraries'
import type { User } from '@exam-one/database'
import { AttemptsService } from '../attempts/attempts.service'
import { DraftsService } from '../drafts/drafts.service'
import { ExercisesService } from '../exercises/exercises.service'
import { GenerationJobsService } from '../generation-jobs/generation-jobs.service'
import { MockExamService } from '../mock-exam/mock-exam.service'
import { ImportService } from './import.service'

describe('ImportService', () => {
  let service: ImportService
  let prisma: {
    user: {
      findUniqueOrThrow: jest.Mock
      update: jest.Mock
    }
  }

  const user = { id: 'user-1', migratedDomains: [] } as unknown as User

  beforeEach(async () => {
    prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'user-1', migratedDomains: [] }),
        update: jest.fn().mockResolvedValue({ id: 'user-1', migratedDomains: ['reading'] }),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExercisesService, useValue: {} },
        { provide: AttemptsService, useValue: {} },
        { provide: DraftsService, useValue: {} },
        { provide: GenerationJobsService, useValue: {} },
        { provide: MockExamService, useValue: {} },
      ],
    }).compile()

    service = module.get(ImportService)
  })

  it('marks a domain skipped without importing rows', async () => {
    const result = await service.skip(user, 'reading')
    expect(result).toEqual({
      domain: 'reading',
      skipped: true,
      imported: {
        exercises: 0,
        attempts: 0,
        drafts: 0,
        generationJobs: 0,
        mockSets: 0,
        mockAttempts: 0,
      },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { migratedDomains: { set: ['reading'] } },
    })
  })

  it('returns already-imported domains from status', async () => {
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'user-1',
      migratedDomains: ['reading', 'theme'],
    })
    await expect(service.status(user)).resolves.toEqual({ migratedDomains: ['reading'] })
  })
})
