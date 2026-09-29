import type { MockExamContent } from '~/data/mockExam/goetheA2'
import {
  getAvailableExamParts,
  type ExamPack,
  type SkillId as PackSkillId,
} from '@exam-one/exam-packs'
import type { ListeningA2Exercise, ListeningExerciseAudioMap } from '~/utils/exercises/listening'
import type { ReadingExercise } from '~/utils/exercises/reading'
import type { SpeakingA2Topic } from '~/utils/exercises/speaking'
import type { SkillId } from '~/utils/labels'
import type { WritingExercise } from '~/utils/types'
import type { GenerationJobDto } from '@exam-one/contracts'
import { apiFetch } from '~/composables/useApi'
import { nestStatusFromPayload } from '~/composables/useGenerationJobs'

export type MockGenerationStatus = 'queued' | 'running' | 'done' | 'failed'
export type MockGenerationJobKind = 'content' | 'audio'

export interface MockGenerationJob {
  id: string
  part: number
  kind: MockGenerationJobKind
  status: MockGenerationStatus
  error?: string
}

export interface MockGenerationModule {
  skill: SkillId
  status: MockGenerationStatus
  jobs: MockGenerationJob[]
}

export interface MockGenerationDraft {
  setNumber: number
  setId: string
  status: MockGenerationStatus
  startedAt: string
  completedAt: string | null
  error: string | null
  modules: MockGenerationModule[]
  content: MockExamContent
}

export interface MockExamPreflight {
  checking: boolean
  checkedAt: string | null
  llmConfigured: boolean
  llmConnected: boolean
  ttsAvailable: boolean
  provider: string | null
  model: string | null
  llmMessage: string | null
  ttsMessage: string | null
}

interface LlmHealthResponse {
  data: {
    configured: boolean
    connected: boolean
    provider: string | null
    model: string | null
    message: string | null
  }
  error: string | null
}

interface TtsHealthResponse {
  data: { ok: boolean } | null
  error: string | null
}

function blankContent(): MockExamContent {
  return { reading: [], listening: [], writing: [], speaking: [] }
}

function createJobs(skill: SkillId, parts: number[]): MockGenerationJob[] {
  return parts.flatMap(part =>
    skill === 'listening'
      ? [
          {
            id: `${skill}-${part}-content`,
            part,
            kind: 'content' as const,
            status: 'queued' as const,
          },
          { id: `${skill}-${part}-audio`, part, kind: 'audio' as const, status: 'queued' as const },
        ]
      : [{ id: `${skill}-${part}-content`, part, kind: 'content', status: 'queued' }]
  )
}

function createDraft(pack: ExamPack, setNumber: number): MockGenerationDraft {
  // The pack's factory owns the set id format, e.g. `goethe-a1-set-2`.
  const setId =
    pack.createMockSet?.(setNumber, blankContent()).id ?? `${pack.packId}-set-${setNumber}`
  const readingParts = getAvailableExamParts(pack, 'reading').map(part => part.n)
  const listeningParts = getAvailableExamParts(pack, 'listening').map(part => part.n)
  const writingParts = getAvailableExamParts(pack, 'writing').map(part => part.n)
  const speakingParts = getAvailableExamParts(pack, 'speaking').map(part => part.n)
  return {
    setNumber,
    setId,
    status: 'queued',
    startedAt: new Date().toISOString(),
    completedAt: null,
    error: null,
    modules: [
      { skill: 'reading', status: 'queued', jobs: createJobs('reading', readingParts) },
      { skill: 'listening', status: 'queued', jobs: createJobs('listening', listeningParts) },
      { skill: 'writing', status: 'queued', jobs: createJobs('writing', writingParts) },
      { skill: 'speaking', status: 'queued', jobs: createJobs('speaking', speakingParts) },
    ],
    content: blankContent(),
  }
}

export const useMockExamGeneration = () => {
  const { t } = useI18n()
  const requestPackId = useSettingsStore().packId
  const { pack, assemble } = usePackPrompt(requestPackId)
  const draft = useState<MockGenerationDraft | null>(
    `mock-exam-generation-draft:${useAuth().user.value?.id}:${requestPackId}`,
    () => null
  )
  const isInitialized = useState<boolean>(
    `mock-exam-generation-initialized:${useAuth().user.value?.id}:${requestPackId}`,
    () => false
  )
  const preflight = useState<MockExamPreflight>(
    `mock-exam-generation-preflight:${useAuth().user.value?.id}:${requestPackId}`,
    () => ({
      checking: false,
      checkedAt: null,
      llmConfigured: false,
      llmConnected: false,
      ttsAvailable: false,
      provider: null,
      model: null,
      llmMessage: null,
      ttsMessage: null,
    })
  )
  const { addSet } = useMockExamSets()

  const isGenerating = computed(() => draft.value?.status === 'running')
  const canRetry = computed(() => draft.value?.status === 'failed')
  const preflightReady = computed(
    () =>
      preflight.value.llmConfigured && preflight.value.llmConnected && preflight.value.ttsAvailable
  )

  const persist = (): void => {
    if (import.meta.server) return
    if (draft.value) {
      void apiFetch('/mock-exam/generation', {
        packId: requestPackId,
        method: 'PUT',
        body: {
          payload: draft.value,
          status: nestStatusFromPayload('MOCK', draft.value),
        },
      }).catch(error => console.error('[mock-exam-generation] persist failed', error))
    } else {
      void apiFetch('/mock-exam/generation', { method: 'DELETE', packId: requestPackId }).catch(
        () => undefined
      )
    }
  }

  const initialize = async (): Promise<void> => {
    if (isInitialized.value || import.meta.server) return
    try {
      const saved = await apiFetch<GenerationJobDto | null>('/mock-exam/generation', {
        packId: requestPackId,
      })
      const raw = saved?.payload
      if (raw && typeof raw === 'object') {
        const stored = raw as MockGenerationDraft
        if (stored.status === 'running') {
          stored.status = 'failed'
          stored.error = t('generation.mockInterrupted')
          for (const module of stored.modules) {
            if (module.status === 'running') module.status = 'failed'
            for (const job of module.jobs) {
              if (job.status === 'running') {
                job.status = 'failed'
                job.error = t('generation.mockJobInterrupted')
              }
            }
          }
        }
        draft.value = stored
      }
    } catch (error) {
      console.warn('[mock-exam-generation] read failed', error)
      draft.value = null
    }
    isInitialized.value = true
    persist()
  }

  const checkPreflight = async (): Promise<boolean> => {
    preflight.value = { ...preflight.value, checking: true, llmMessage: null, ttsMessage: null }
    const [llmResult, ttsResult] = await Promise.allSettled([
      aiFetch<LlmHealthResponse['data']>('/llm/health'),
      aiFetch<TtsHealthResponse['data']>('/tts/health'),
    ])

    const llm = llmResult.status === 'fulfilled' ? llmResult.value : null
    const tts = ttsResult.status === 'fulfilled' ? ttsResult.value : null
    preflight.value = {
      checking: false,
      checkedAt: new Date().toISOString(),
      llmConfigured: Boolean(llm?.data?.configured),
      llmConnected: Boolean(llm?.data?.connected),
      ttsAvailable: Boolean(tts?.data?.ok),
      provider: llm?.data?.provider ?? null,
      model: llm?.data?.model ?? null,
      llmMessage:
        llm?.data?.message ??
        llm?.error ??
        (llmResult.status === 'rejected' ? String(llmResult.reason) : null),
      ttsMessage: tts?.error ?? (ttsResult.status === 'rejected' ? String(ttsResult.reason) : null),
    }
    return preflightReady.value
  }

  const updateJob = (
    skill: SkillId,
    jobId: string,
    status: MockGenerationStatus,
    error?: string
  ): void => {
    const module = draft.value?.modules.find(candidate => candidate.skill === skill)
    const job = module?.jobs.find(candidate => candidate.id === jobId)
    if (!module || !job) return
    job.status = status
    if (error) job.error = error
    else delete job.error
    if (status === 'running') module.status = 'running'
    if (status === 'failed') module.status = 'failed'
    persist()
  }

  const replacePart = <T extends { testingPart?: number }>(items: T[], next: T): T[] =>
    [...items.filter(item => item.testingPart !== next.testingPart), next].sort(
      (left, right) => (left.testingPart ?? 0) - (right.testingPart ?? 0)
    )

  const generateContentJob = async (skill: SkillId, part: number): Promise<void> => {
    if (!draft.value) return
    const difficulty = pack.value.cefr
    const prompt = assemble(skill as PackSkillId, part, 'generator', { count: 1 })

    if (skill === 'reading') {
      const response = await aiFetch<ReadingExercise[]>('/llm/generate-reading', {
        packId: requestPackId,
        method: 'POST',
        body: { difficulty, prompts: prompt ? [{ part, prompt }] : [] },
      })
      if (response.error || !response.data?.[0])
        throw new Error(
          response.error || t('generation.noExerciseForPart', { skill: t('skill.reading'), part })
        )
      draft.value.content.reading = replacePart(draft.value.content.reading, {
        ...response.data[0],
        examOnly: true,
      })
      return
    }

    if (skill === 'listening') {
      const response = await aiFetch<ListeningA2Exercise[]>('/llm/generate-listening', {
        packId: requestPackId,
        method: 'POST',
        body: { difficulty, prompts: prompt ? [{ part, prompt }] : [] },
      })
      if (response.error || !response.data?.[0])
        throw new Error(
          response.error || t('generation.noExerciseForPart', { skill: t('skill.listening'), part })
        )
      draft.value.content.listening = replacePart(draft.value.content.listening, {
        ...response.data[0],
        examOnly: true,
      })
      return
    }

    if (skill === 'writing') {
      const response = await aiFetch<WritingExercise[]>('/llm/generate-topics', {
        packId: requestPackId,
        method: 'POST',
        body: { prompt, part, difficulty },
      })
      const topic = response.data?.[0]
      if (response.error || !topic)
        throw new Error(
          response.error || t('generation.noExerciseForPart', { skill: t('skill.writing'), part })
        )
      draft.value.content.writing = replacePart(draft.value.content.writing, {
        ...topic,
        examOnly: true,
      })
      return
    }

    const response = await aiFetch<SpeakingA2Topic[]>('/llm/generate-speaking', {
      packId: requestPackId,
      method: 'POST',
      body: { difficulty, prompts: prompt ? [{ part, prompt }] : [] },
    })
    if (response.error || !response.data?.[0])
      throw new Error(
        response.error || t('generation.noExerciseForPart', { skill: t('skill.speaking'), part })
      )
    draft.value.content.speaking = replacePart(draft.value.content.speaking, {
      ...response.data[0],
      examOnly: true,
    })
  }

  const generateAudioJob = async (part: number): Promise<void> => {
    if (!draft.value) return
    const exercise = draft.value.content.listening.find(candidate => candidate.testingPart === part)
    if (!exercise) throw new Error(t('generation.mockListeningContentMissing', { part }))
    const response = await aiFetch<{ audio: ListeningExerciseAudioMap; written: number }>(
      '/tts/generate-listening-audio',
      {
        packId: requestPackId,
        method: 'POST',
        body: { exercise },
      }
    )
    if (response.error || !response.data)
      throw new Error(response.error || t('generation.mockAudioFailed', { part }))
    draft.value.content.listening = replacePart(draft.value.content.listening, {
      ...exercise,
      audio: response.data.audio,
    })
  }

  const runPipeline = async (): Promise<boolean> => {
    if (!draft.value) return false
    draft.value.status = 'running'
    draft.value.error = null
    persist()

    for (const module of draft.value.modules) {
      if (module.jobs.every(job => job.status === 'done')) {
        module.status = 'done'
        continue
      }
      module.status = 'running'
      persist()

      for (const job of module.jobs) {
        if (job.status === 'done') continue
        updateJob(module.skill, job.id, 'running')
        try {
          if (job.kind === 'audio') await generateAudioJob(job.part)
          else await generateContentJob(module.skill, job.part)
          updateJob(module.skill, job.id, 'done')
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : t('generation.partFailed', { part: job.part })
          updateJob(module.skill, job.id, 'failed', message)
          draft.value.status = 'failed'
          draft.value.error = message
          persist()
          return false
        }
      }

      module.status = 'done'
      persist()
    }

    const completedSet = pack.value.createMockSet?.(draft.value.setNumber, draft.value.content)
    if (!completedSet) {
      throw new Error(t('generation.mockPackUnsupported'))
    }
    await addSet(completedSet, requestPackId)
    draft.value.status = 'done'
    draft.value.completedAt = new Date().toISOString()
    draft.value.error = null
    draft.value.content = blankContent()
    persist()
    return true
  }

  const startGeneration = async (setNumber: number): Promise<boolean> => {
    if (isGenerating.value || !preflightReady.value) return false
    draft.value = createDraft(pack.value, setNumber)
    persist()
    return runPipeline()
  }

  const retryGeneration = async (): Promise<boolean> => {
    if (!draft.value || isGenerating.value) return false
    if (!(await checkPreflight())) return false
    for (const module of draft.value.modules) {
      if (module.status === 'failed') module.status = 'queued'
      for (const job of module.jobs) {
        if (job.status === 'failed') job.status = 'queued'
      }
    }
    return runPipeline()
  }

  const clearGeneration = (): void => {
    if (isGenerating.value) return
    draft.value = null
    persist()
  }

  onMounted(() => {
    void initialize()
  })

  return {
    // State
    draft: readonly(draft),
    isInitialized: readonly(isInitialized),
    isGenerating,
    canRetry,
    preflight: readonly(preflight),
    preflightReady,

    // Methods
    initialize,
    checkPreflight,
    startGeneration,
    retryGeneration,
    clearGeneration,
  }
}
