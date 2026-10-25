export type BackgroundJobType = 'LISTENING_AUDIO' | 'EXERCISE_GENERATION' | 'MOCK_EXAM_SET'
export type BackgroundJobStatus =
  'QUEUED' | 'RUNNING' | 'CANCEL_REQUESTED' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface JobProgress {
  stage: number
  stagePercent: number
  items?: { label: string; done: boolean }[]
  estimateSec?: number
}

export interface BackgroundJobDto {
  id: string
  packId: string
  level: string
  type: BackgroundJobType
  status: BackgroundJobStatus
  title: string
  subtitle: string | null
  targetId: string | null
  progress: JobProgress
  result: Record<string, unknown> | null
  error: string | null
  attempt: number
  revision: number
  seenAt: string | null
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
  updatedAt: string
}

export interface BackgroundJobList {
  jobs: BackgroundJobDto[]
  nextCursor: string | null
  unreadCount: number
}

export type JobEvent =
  | { type: 'upsert'; job: BackgroundJobDto }
  | { type: 'remove'; id: string; revision: number }
  | { type: 'heartbeat' }

export const JOB_STAGES: Record<
  BackgroundJobType,
  { stages: { key: string; weight: number }[]; estimateSec: number }
> = {
  LISTENING_AUDIO: {
    stages: [
      { key: 'activity.stages.prepare', weight: 15 },
      { key: 'activity.stages.synthesize', weight: 75 },
      { key: 'activity.stages.attach', weight: 10 },
    ],
    estimateSec: 60,
  },
  EXERCISE_GENERATION: {
    stages: [
      { key: 'activity.stages.prepare', weight: 10 },
      { key: 'activity.stages.generate', weight: 80 },
      { key: 'activity.stages.save', weight: 10 },
    ],
    estimateSec: 90,
  },
  MOCK_EXAM_SET: {
    stages: [
      { key: 'activity.stages.prepare', weight: 10 },
      { key: 'activity.stages.generate', weight: 55 },
      { key: 'activity.stages.synthesize', weight: 25 },
      { key: 'activity.stages.attach', weight: 10 },
    ],
    estimateSec: 300,
  },
}

export function overallPercent(type: BackgroundJobType, progress: JobProgress): number {
  const stages = JOB_STAGES[type].stages
  const stage = Math.max(0, Math.min(stages.length - 1, Math.floor(progress.stage || 0)))
  const before = stages.slice(0, stage).reduce((sum, item) => sum + item.weight, 0)
  return Math.max(
    0,
    Math.min(
      100,
      before +
        (stages[stage]!.weight * Math.max(0, Math.min(100, progress.stagePercent || 0))) / 100
    )
  )
}
