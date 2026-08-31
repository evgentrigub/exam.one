import type { GenerationJobDto, Skill } from '@exam-one/contracts'
import { clearGenerationJob, listGenerationJobs } from '~/composables/useGenerationJobs'

export type TrayPartStatus = 'queued' | 'running' | 'done' | 'failed'

export interface GenerationTrayRow {
  id: string
  kind: Skill
  skillKey: string
  part: number
  jobKind?: string
  status: TrayPartStatus
}

const POLL_MS = 2500

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asPartStatus(value: unknown): TrayPartStatus | null {
  if (value === 'queued' || value === 'running' || value === 'done' || value === 'failed') {
    return value
  }
  if (value === 'generating') return 'running'
  if (value === 'error') return 'failed'
  return null
}

function skillLabel(kind: Skill): string {
  const map: Record<Skill, string> = {
    READING: 'reading',
    WRITING: 'writing',
    LISTENING: 'listening',
    SPEAKING: 'speaking',
    MOCK: 'mock',
  }
  return map[kind]
}

function flattenJob(job: GenerationJobDto): GenerationTrayRow[] {
  const payload = job.payload
  if (!isRecord(payload)) return []
  const rows: GenerationTrayRow[] = []

  if (job.kind === 'MOCK') {
    const modules = Array.isArray(payload['modules']) ? payload['modules'] : []
    for (const module of modules) {
      if (!isRecord(module)) continue
      const skill = String(module['skill'] ?? 'mock')
      const jobs = Array.isArray(module['jobs']) ? module['jobs'] : []
      for (const part of jobs) {
        if (!isRecord(part)) continue
        const status = asPartStatus(part['status'])
        if (!status) continue
        const partNum = Number(part['part'] ?? 0)
        const kind = String(part['kind'] ?? 'content')
        rows.push({
          id: String(part['id'] ?? `${job.kind}-${skill}-${partNum}-${kind}`),
          kind: job.kind,
          skillKey: skill,
          part: partNum,
          jobKind: kind,
          status,
        })
      }
    }
    return rows
  }

  const jobs = Array.isArray(payload['jobs']) ? payload['jobs'] : []
  for (const part of jobs) {
    if (!isRecord(part)) continue
    const status = asPartStatus(part['status'])
    if (!status) continue
    const partNum = Number(part['part'] ?? 0)
    rows.push({
      id: `${job.kind}-${partNum}`,
      kind: job.kind,
      skillKey: skillLabel(job.kind),
      part: partNum,
      status,
    })
  }
  return rows
}

export const useGenerationJobTray = () => {
  const jobs = useState<GenerationJobDto[]>('generation-job-tray', () => [])
  const dismissed = useState<string[]>('generation-job-tray-dismissed', () => [])
  let timer: ReturnType<typeof setInterval> | null = null

  const rows = computed(() => {
    const dismissedSet = new Set(dismissed.value)
    return jobs.value.flatMap(flattenJob).filter(row => !dismissedSet.has(row.kind))
  })

  const total = computed(() => rows.value.length)
  const doneCount = computed(() => rows.value.filter(row => row.status === 'done').length)
  const runningCount = computed(() => rows.value.filter(row => row.status === 'running').length)
  const queuedCount = computed(() => rows.value.filter(row => row.status === 'queued').length)
  const failedCount = computed(() => rows.value.filter(row => row.status === 'failed').length)
  const active = computed(() => runningCount.value + queuedCount.value)
  const allDone = computed(() => total.value > 0 && active.value === 0)
  const overall = computed(() => {
    if (total.value === 0) return 0
    const scored = rows.value.reduce((sum, row) => {
      if (row.status === 'done') return sum + 100
      if (row.status === 'running') return sum + 50
      return sum
    }, 0)
    return Math.round(scored / total.value)
  })

  const hydrate = async (): Promise<void> => {
    if (import.meta.server) return
    try {
      jobs.value = await listGenerationJobs()
    } catch (error) {
      console.error('Failed to list generation jobs', error)
    }
  }

  const hasActiveWork = computed(() =>
    jobs.value.some(job => {
      const parts = flattenJob(job)
      return (
        job.status === 'RUNNING' ||
        parts.some(part => part.status === 'running' || part.status === 'queued')
      )
    })
  )

  const startPolling = (): void => {
    if (import.meta.server || timer) return
    timer = setInterval(() => {
      void hydrate().then(() => {
        if (!hasActiveWork.value && timer) {
          clearInterval(timer)
          timer = null
        }
      })
    }, POLL_MS)
  }

  const stopPolling = (): void => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  watch(hasActiveWork, activeWork => {
    if (activeWork) startPolling()
    else stopPolling()
  })

  async function dismissKind(kind: Skill): Promise<void> {
    dismissed.value = [...new Set([...dismissed.value, kind])]
    const job = jobs.value.find(item => item.kind === kind)
    const remaining = job ? flattenJob(job) : []
    const unfinished = remaining.some(row => row.status === 'queued' || row.status === 'running')
    if (!unfinished) {
      await clearGenerationJob(kind).catch(() => undefined)
      jobs.value = jobs.value.filter(job => job.kind !== kind)
    }
  }

  async function dismissCompleted(): Promise<void> {
    const kinds = new Set(
      jobs.value
        .filter(job => {
          const parts = flattenJob(job)
          return parts.length > 0 && parts.every(part => part.status === 'done' || part.status === 'failed')
        })
        .map(job => job.kind)
    )
    for (const kind of kinds) {
      await dismissKind(kind)
    }
  }

  async function dismissAll(): Promise<void> {
    for (const job of jobs.value) {
      await dismissKind(job.kind)
    }
  }

  onMounted(() => {
    void hydrate().then(() => {
      if (hasActiveWork.value) startPolling()
    })
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    // State
    rows,
    total,
    doneCount,
    runningCount,
    queuedCount,
    failedCount,
    active,
    allDone,
    overall,
    // Methods
    hydrate,
    dismissKind,
    dismissCompleted,
    dismissAll,
  }
}
