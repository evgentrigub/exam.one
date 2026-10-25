import {
  overallPercent,
  type BackgroundJobDto,
  type BackgroundJobList,
  type BackgroundJobType,
  type JobEvent,
} from '@exam-one/contracts'
import { apiFetch, refreshAccessCookie } from '~/composables/useApi'

export type ActivityJob = BackgroundJobDto
type Toast = { id: string; job: BackgroundJobDto }

const jobs = ref<BackgroundJobDto[]>([])
const toasts = ref<Toast[]>([])
const unreadCount = ref(0)
const nextCursor = ref<string | null>(null)
let stream: EventSource | null = null
let reconnect: ReturnType<typeof setTimeout> | null = null
let poll: ReturnType<typeof setInterval> | null = null
let failures = 0
let currentUser: string | null = null

function upsert(job: BackgroundJobDto, live = false) {
  const previous = jobs.value.find(item => item.id === job.id)
  if (previous && previous.revision >= job.revision) return
  jobs.value = [job, ...jobs.value.filter(item => item.id !== job.id)].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )
  if (
    live &&
    previous &&
    !['COMPLETED', 'FAILED'].includes(previous.status) &&
    ['COMPLETED', 'FAILED'].includes(job.status)
  ) {
    toasts.value = [...toasts.value, { id: `${job.id}-${job.revision}`, job }]
    setTimeout(() => {
      toasts.value = toasts.value.filter(item => item.id !== `${job.id}-${job.revision}`)
    }, 6000)
  }
  unreadCount.value = jobs.value.filter(
    item => ['COMPLETED', 'FAILED'].includes(item.status) && !item.seenAt
  ).length
}

async function hydrate() {
  const snapshot = await apiFetch<BackgroundJobList>('/jobs')
  jobs.value = snapshot.jobs.map(job => {
    const existing = jobs.value.find(item => item.id === job.id)
    return existing && existing.revision > job.revision ? existing : job
  })
  nextCursor.value = snapshot.nextCursor
  unreadCount.value = snapshot.unreadCount
}

async function loadMore() {
  if (!nextCursor.value) return
  const snapshot = await apiFetch<BackgroundJobList>('/jobs', {
    query: { cursor: nextCursor.value },
  })
  for (const job of snapshot.jobs) upsert(job)
  nextCursor.value = snapshot.nextCursor
  unreadCount.value = snapshot.unreadCount
}

function disconnect(clear = true) {
  stream?.close()
  stream = null
  if (reconnect) clearTimeout(reconnect)
  if (poll) clearInterval(poll)
  reconnect = poll = null
  if (clear) {
    jobs.value = []
    toasts.value = []
    unreadCount.value = 0
    nextCursor.value = null
    currentUser = null
  }
}

function connect(userId: string) {
  if (!import.meta.client || (currentUser === userId && stream)) return
  disconnect(currentUser !== userId)
  currentUser = userId
  void hydrate().catch(() => undefined)
  const base = String(useRuntimeConfig().public.apiUrl || 'http://localhost:3001').replace(
    /\/$/,
    ''
  )
  stream = new EventSource(`${base}/api/v1/jobs/stream`, { withCredentials: true })
  stream.onopen = () => {
    failures = 0
    if (poll) clearInterval(poll)
    poll = null
    void hydrate().catch(() => undefined)
  }
  stream.onmessage = message => {
    try {
      const event = JSON.parse(message.data) as JobEvent
      if (event.type === 'upsert') upsert(event.job, true)
      if (event.type === 'remove')
        jobs.value = jobs.value.filter(
          item => item.id !== event.id || item.revision >= event.revision
        )
    } catch {
      return
    }
  }
  stream.onerror = () => {
    stream?.close()
    stream = null
    failures += 1
    if (failures >= 3 && !poll)
      poll = setInterval(() => {
        void hydrate().catch(() => undefined)
      }, 10000)
    reconnect = setTimeout(
      () => {
        // A failed refresh may just be the API restarting; keep backing off. Logout disconnects via the plugin.
        void refreshAccessCookie().then(() => {
          if (currentUser === userId) connect(userId)
        })
      },
      Math.min(30000, 1000 * 2 ** failures)
    )
  }
}

export function useJobCenter() {
  const all = computed<ActivityJob[]>(() => jobs.value)
  const active = computed(() =>
    all.value.filter(job => ['QUEUED', 'RUNNING', 'CANCEL_REQUESTED'].includes(job.status))
  )
  const finished = computed(() => all.value.filter(job => !active.value.includes(job)))
  const overall = computed(() =>
    active.value.length
      ? active.value.reduce((sum, job) => sum + overallPercent(job.type, job.progress), 0) /
        active.value.length
      : 0
  )
  const jobForTarget = (type: BackgroundJobType, id: string) =>
    computed(
      () =>
        jobs.value.find(
          job =>
            job.type === type && job.targetId === id && job.packId === useSettingsStore().packId
        ) ?? null
    )
  const enqueueListeningAudio = (exerciseId: string) =>
    apiFetch<BackgroundJobDto>('/jobs/listening-audio', {
      method: 'POST',
      body: { exerciseId },
    }).then(job => {
      upsert(job)
      return job
    })
  const enqueueExercises = (selections: { skill: string; part: number }[]) =>
    apiFetch<BackgroundJobDto>('/jobs/exercise-generation', {
      method: 'POST',
      body: { selections },
    }).then(job => {
      upsert(job)
      return job
    })
  const enqueueMock = (setNumber: number) =>
    apiFetch<BackgroundJobDto>('/jobs/mock-exam-set', { method: 'POST', body: { setNumber } }).then(
      job => {
        upsert(job)
        return job
      }
    )
  const cancel = (id: string) =>
    apiFetch<BackgroundJobDto>(`/jobs/${encodeURIComponent(id)}/cancel`, { method: 'POST' }).then(
      job => upsert(job)
    )
  const retry = (id: string) =>
    apiFetch<BackgroundJobDto>(`/jobs/${encodeURIComponent(id)}/retry`, { method: 'POST' }).then(
      job => upsert(job)
    )
  const dismiss = async (id: string) => {
    await apiFetch(`/jobs/${encodeURIComponent(id)}`, { method: 'DELETE' })
    jobs.value = jobs.value.filter(job => job.id !== id)
  }
  const clearFinished = async () => {
    await apiFetch('/jobs', { method: 'DELETE', query: { finished: 'true' } })
    jobs.value = jobs.value.filter(
      job => !['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)
    )
  }
  const markAllRead = async () => {
    await apiFetch('/jobs/seen', { method: 'POST' })
    jobs.value = jobs.value.map(job => ({ ...job, seenAt: job.seenAt ?? new Date().toISOString() }))
    unreadCount.value = 0
  }
  const dismissToast = (id: string) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }
  const navigate = async (job: {
    packId: string
    type: BackgroundJobType
    result: Readonly<Record<string, unknown>> | null
  }) => {
    if (job.packId !== useSettingsStore().packId) await useSettingsStore().selectPack(job.packId)
    if (job.type === 'LISTENING_AUDIO' && job.result?.['exerciseId'])
      await navigateTo(`/listening/${encodeURIComponent(String(job.result['exerciseId']))}`)
    else if (job.type === 'MOCK_EXAM_SET' && job.result?.['setId'])
      await navigateTo(`/mock-exam/${encodeURIComponent(String(job.result['setId']))}`)
    else await navigateTo('/exercises')
  }
  return {
    jobs: readonly(jobs),
    all,
    active,
    finished,
    overall,
    unreadCount: readonly(unreadCount),
    nextCursor: readonly(nextCursor),
    toasts: readonly(toasts),
    hydrate,
    loadMore,
    connect,
    disconnect,
    jobForTarget,
    enqueueListeningAudio,
    enqueueExercises,
    enqueueMock,
    cancel,
    retry,
    dismiss,
    clearFinished,
    markAllRead,
    dismissToast,
    navigate,
  }
}
