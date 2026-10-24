import type { BackgroundJobType } from '@exam-one/contracts'

export const QUEUE_NAMES = {
  LISTENING_AUDIO: 'listening-audio',
  EXERCISE_GENERATION: 'exercise-generation',
  MOCK_EXAM_SET: 'mock-exam-set',
} as const satisfies Record<BackgroundJobType, string>

export const JOB_OPTIONS = {
  attempts: 2,
  backoff: { type: 'exponential' as const, delay: 3000 },
  removeOnComplete: { age: 86400, count: 1000 },
  removeOnFail: { age: 604800 },
}

/** Last stage index per type; mirrors JOB_STAGES in contracts, which is type-only at runtime here. */
export const FINAL_STAGE = {
  LISTENING_AUDIO: 2,
  EXERCISE_GENERATION: 2,
  MOCK_EXAM_SET: 3,
} as const satisfies Record<BackgroundJobType, number>
