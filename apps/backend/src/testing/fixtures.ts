import { jest } from '@jest/globals'
import type { Response } from 'express'
import type {
  Attempt,
  Draft,
  Exercise,
  GenerationJob,
  MockExamAttempt,
  MockExamSet,
  PromptOverride,
  Result,
  Setting,
  User,
} from '@exam-one/database'

const NOW = new Date('2026-01-01T00:00:00.000Z')

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'ada@example.com',
    name: 'Ada',
    examTargetDate: null,
    plan: 'FREE',
    passwordHash: 'hashed-password',
    emailVerified: true,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

export function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    userId: null,
    packId: 'goethe-de-a2',
    skill: 'READING',
    level: 'A2',
    source: 'seed',
    visibility: 'PRACTICE',
    externalId: 'reading-a2-teil1-001',
    payload: { id: 'reading-a2-teil1-001', title: 'Seed' },
    createdAt: NOW,
    ...overrides,
  }
}

export function makeMockExamSet(overrides: Partial<MockExamSet> = {}): MockExamSet {
  return {
    packId: 'goethe-de-a2',
    id: 'set-1',
    userId: null,
    externalId: 'set-1',
    examId: 'goethe-a2',
    level: 'A2',
    title: 'Set 1',
    generated: false,
    content: { listening: [] },
    modules: {},
    rules: null,
    createdAt: NOW,
    ...overrides,
  }
}

export function makeAttempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    packId: 'goethe-de-a2',
    snapshot: null,
    id: 'att-1',
    userId: 'user-1',
    exerciseId: null,
    skill: 'READING',
    answers: { q1: 'a' },
    submittedAt: NOW,
    ...overrides,
  }
}

export function makeResult(overrides: Partial<Result> = {}): Result {
  return {
    id: 'res-1',
    attemptId: 'att-1',
    score: 8,
    maxScore: 10,
    percentage: 80,
    review: null,
    createdAt: NOW,
    ...overrides,
  }
}

export function makeDraft(overrides: Partial<Draft> = {}): Draft {
  return {
    packId: 'goethe-de-a2',
    id: 'draft-1',
    userId: 'user-1',
    skill: 'WRITING',
    topicId: 'topic-1',
    payload: { text: 'Hallo' },
    updatedAt: NOW,
    ...overrides,
  }
}

export function makePromptOverride(overrides: Partial<PromptOverride> = {}): PromptOverride {
  return {
    id: 'prompt-1',
    userId: 'user-1',
    skill: 'READING',
    level: 'A2',
    part: 1,
    kind: 'GENERATOR',
    body: 'Generate a reading text.',
    updatedAt: NOW,
    ...overrides,
  }
}

export function makeGenerationJob(overrides: Partial<GenerationJob> = {}): GenerationJob {
  return {
    id: 'job-1',
    userId: 'user-1',
    packId: 'goethe-de-a2',
    kind: 'READING',
    status: 'IDLE',
    payload: { step: 1 },
    updatedAt: NOW,
    ...overrides,
  }
}

export function makeSetting(overrides: Partial<Setting> = {}): Setting {
  return {
    id: 'setting-1',
    userId: 'user-1',
    packId: 'goethe-de-a2',
    examLevel: 'A2',
    targetLanguage: 'de',
    updatedAt: NOW,
    ...overrides,
  }
}

export function makeMockExamAttempt(
  overrides: Partial<MockExamAttempt> & { set?: MockExamSet } = {}
): MockExamAttempt & { set: MockExamSet } {
  const { set, ...rest } = overrides
  const resolvedSet = set ?? makeMockExamSet()
  return {
    id: 'mock-att-1',
    userId: 'user-1',
    setId: resolvedSet.id,
    state: { module: 'reading' },
    updatedAt: NOW,
    ...rest,
    set: resolvedSet,
  }
}

export function makeCookieResponse(): Pick<Response, 'cookie' | 'clearCookie'> {
  return {
    cookie: jest.fn() as unknown as Response['cookie'],
    clearCookie: jest.fn() as unknown as Response['clearCookie'],
  }
}
