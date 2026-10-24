import { onPackReset, packEpoch } from '~/utils/packScope'
import type { AttemptDto, DraftDto, Skill } from '@exam-one/contracts'
import type { WritingSubmission, WritingFeedbackModel } from '~/utils/types'
import type { CriterionReview } from '@exam-one/exam-packs'
import type { SpeakingTranscripts } from '~/utils/exercises/speaking'
import type { ObjectiveAnswers } from '~/utils/gapFill'
import { apiFetch } from '~/composables/useApi'

interface QuizProgress {
  textId: string
  completed: boolean
  score: number
  totalQuestions: number
  percentage: number
  completedAt: string
  attemptCount?: number
  bestScore?: number
}

interface ProgressStats {
  totalTextsCompleted: number
  totalAttempts: number
  averageScore: number
  bestScore: number
  recentActivity: QuizProgress[]
  completionRate: number
}

interface WritingProgress {
  topicId: string
  completed: boolean
  attemptCount: number
  bestWordCount?: number
  completedAt?: string
  timeSpent?: number
  submissions: WritingSubmission[]
}

interface WritingStats {
  totalTopicsCompleted: number
  totalSubmissions: number
  averageWordCount: number
  totalTimeSpent: number
  recentActivity: WritingProgress[]
  completionRate: number
}

export interface WritingSessionModel {
  topicId: string
  content: string
  wordCount: number
  startedAt: string
  lastSavedAt: string
}

export type ListeningProgress = QuizProgress

export interface SpeakingAttempt {
  id: string
  topicId: string
  durationSec: number
  transcript?: string
  transcripts?: SpeakingTranscripts
  review?: CriterionReview
  selfScore?: number
  submittedAt: string
}

interface SpeakingProgress {
  topicId: string
  completed: boolean
  attemptCount: number
  bestSelfScore?: number
  bestPoints?: number
  bestMaxPoints?: number
  completedAt?: string
  attempts: SpeakingAttempt[]
}

const readingProgress = ref<Record<string, QuizProgress>>({})
const readingSession = ref<{
  textId: string
  currentQuestionIndex: number
  answers: ObjectiveAnswers
  startedAt: string
} | null>(null)
const writingProgress = ref<Record<string, WritingProgress>>({})
const writingDrafts = ref<Record<string, WritingSessionModel>>({})
const listeningProgress = ref<Record<string, ListeningProgress>>({})
const speakingProgress = ref<Record<string, SpeakingProgress>>({})
const progressSources = { readingProgress, readingSession, writingProgress, writingDrafts, listeningProgress, speakingProgress }
const hydrated = ref(false)
let hydratePromise: Promise<void> | null = null
/** Set once a screen on the client has asked for progress, so a pack switch refills it. */
let requested = false
// Settings hydrate after the first screens mount, so a user whose pack is not the default
// switches packs on every page load. Refetch for the screens already showing progress.
onPackReset(() => {
  readingProgress.value = {}
  writingProgress.value = {}
  listeningProgress.value = {}
  speakingProgress.value = {}
  readingSession.value = null
  writingDrafts.value = {}
  hydrated.value = false
  hydratePromise = null
  if (import.meta.client && requested) void hydrate()
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function fetchAttempts(skill: Skill): Promise<AttemptDto[]> {
  return apiFetch<AttemptDto[]>(`/attempts?skill=${skill}`)
}

async function fetchDrafts(skill: Skill): Promise<DraftDto[]> {
  return apiFetch<DraftDto[]>(`/drafts?skill=${skill}`)
}

function quizFromAttempts(rows: AttemptDto[]): Record<string, QuizProgress> {
  const map: Record<string, QuizProgress> = {}
  for (const row of rows) {
    const textId = row.exerciseExternalId
    if (!textId) continue
    const review = isRecord(row.result?.review) ? row.result.review : {}
    const nested = isRecord(review['progress']) ? review['progress'] : review
    const score = row.result?.score ?? (typeof nested['score'] === 'number' ? nested['score'] : 0)
    const totalQuestions =
      row.result?.maxScore ??
      (typeof nested['totalQuestions'] === 'number' ? nested['totalQuestions'] : 0)
    const percentage =
      row.result?.percentage ??
      (totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0)
    const completedAt = row.submittedAt
    const current = map[textId]
    map[textId] = {
      textId,
      completed: true,
      score,
      totalQuestions,
      percentage,
      completedAt,
      attemptCount: (current?.attemptCount ?? 0) + 1,
      bestScore: Math.max(current?.bestScore ?? 0, score),
    }
  }
  return map
}

function writingFromAttempts(rows: AttemptDto[]): Record<string, WritingProgress> {
  const map: Record<string, WritingProgress> = {}
  for (const row of rows) {
    const topicId = row.exerciseExternalId
    if (!topicId) continue
    const answers = isRecord(row.answers) ? row.answers : {}
    // `writing-review` rows cache an AI review, not a submission. Without this they are
    // rebuilt as phantom submissions with wordCount 0 and inflate the attempt count.
    if (
      answers['kind'] === 'model-answer' ||
      answers['kind'] === 'artifact' ||
      answers['kind'] === 'writing-review'
    )
      continue
    const submission: WritingSubmission = {
      id: typeof answers['id'] === 'string' ? answers['id'] : row.id,
      topicId,
      content: typeof answers['content'] === 'string' ? answers['content'] : '',
      wordCount: typeof answers['wordCount'] === 'number' ? answers['wordCount'] : 0,
      submittedAt:
        typeof answers['submittedAt'] === 'string' ? answers['submittedAt'] : row.submittedAt,
      timeSpent: typeof answers['timeSpent'] === 'number' ? answers['timeSpent'] : 0,
      isDraft: false,
      ...(isRecord(answers['feedback'])
        ? { feedback: answers['feedback'] as unknown as WritingFeedbackModel }
        : {}),
    }
    const current = map[topicId] ?? {
      topicId,
      completed: false,
      attemptCount: 0,
      submissions: [],
    }
    map[topicId] = {
      ...current,
      completed: true,
      attemptCount: current.attemptCount + 1,
      bestWordCount: Math.max(current.bestWordCount ?? 0, submission.wordCount),
      completedAt: submission.submittedAt,
      timeSpent: (current.timeSpent ?? 0) + (submission.timeSpent ?? 0),
      submissions: [...current.submissions, submission],
    }
  }
  return map
}

function speakingFromAttempts(rows: AttemptDto[]): Record<string, SpeakingProgress> {
  const map: Record<string, SpeakingProgress> = {}
  for (const row of rows) {
    const topicId = row.exerciseExternalId
    if (!topicId) continue
    const answers = isRecord(row.answers) ? row.answers : {}
    const reviewSource = isRecord(row.result?.review) ? row.result.review : answers
    const attempt: SpeakingAttempt = {
      id: typeof answers['id'] === 'string' ? answers['id'] : row.id,
      topicId,
      durationSec: typeof answers['durationSec'] === 'number' ? answers['durationSec'] : 0,
      submittedAt:
        typeof answers['submittedAt'] === 'string' ? answers['submittedAt'] : row.submittedAt,
      ...(typeof answers['transcript'] === 'string' ? { transcript: answers['transcript'] } : {}),
      ...(isRecord(answers['transcripts'])
        ? { transcripts: answers['transcripts'] as unknown as SpeakingTranscripts }
        : {}),
      ...(isRecord(reviewSource['review'])
        ? { review: reviewSource['review'] as unknown as CriterionReview }
        : isRecord(answers['review'])
          ? { review: answers['review'] as unknown as CriterionReview }
          : {}),
      ...(typeof answers['selfScore'] === 'number' ? { selfScore: answers['selfScore'] } : {}),
    }
    const current = map[topicId] ?? {
      topicId,
      completed: false,
      attemptCount: 0,
      attempts: [],
    }
    map[topicId] = {
      ...current,
      completed: true,
      attemptCount: current.attemptCount + 1,
      completedAt: attempt.submittedAt,
      ...(attempt.selfScore !== undefined
        ? { bestSelfScore: Math.max(current.bestSelfScore ?? 0, attempt.selfScore) }
        : {}),
      ...(attempt.review
        ? {
            bestPoints: Math.max(current.bestPoints ?? 0, attempt.review.totalPoints),
            bestMaxPoints: attempt.review.maxPoints,
          }
        : {}),
      attempts: [...current.attempts, attempt],
    }
  }
  return map
}

async function hydrate(): Promise<void> {
  if (!import.meta.client || hydrated.value) return
  if (hydratePromise) return hydratePromise
  const epoch = packEpoch()
  hydratePromise = (async () => {
    try {
      const [reading, writing, listening, speaking, readingDrafts, writingDraftRows] =
        await Promise.all([
          fetchAttempts('READING'),
          fetchAttempts('WRITING'),
          fetchAttempts('LISTENING'),
          fetchAttempts('SPEAKING'),
          fetchDrafts('READING'),
          fetchDrafts('WRITING'),
        ])
      if (epoch !== packEpoch()) return
      readingProgress.value = quizFromAttempts(reading)
      writingProgress.value = writingFromAttempts(writing)
      listeningProgress.value = quizFromAttempts(listening)
      speakingProgress.value = speakingFromAttempts(speaking)

      const latestReading = readingDrafts[0]
      if (latestReading && isRecord(latestReading.payload)) {
        const payload = latestReading.payload
        if (typeof payload['textId'] === 'string') {
          readingSession.value = {
            textId: payload['textId'],
            currentQuestionIndex:
              typeof payload['currentQuestionIndex'] === 'number'
                ? payload['currentQuestionIndex']
                : 0,
            answers: isRecord(payload['answers'])
              ? (payload['answers'] as ObjectiveAnswers)
              : {},
            startedAt:
              typeof payload['startedAt'] === 'string'
                ? payload['startedAt']
                : latestReading.updatedAt,
          }
        }
      }

      const drafts: Record<string, WritingSessionModel> = {}
      for (const row of writingDraftRows) {
        const payload = isRecord(row.payload) ? row.payload : {}
        drafts[row.topicId] = {
          topicId: row.topicId,
          content: typeof payload['content'] === 'string' ? payload['content'] : '',
          wordCount: typeof payload['wordCount'] === 'number' ? payload['wordCount'] : 0,
          startedAt:
            typeof payload['startedAt'] === 'string' ? payload['startedAt'] : row.updatedAt,
          lastSavedAt:
            typeof payload['lastSavedAt'] === 'string' ? payload['lastSavedAt'] : row.updatedAt,
        }
      }
      writingDrafts.value = drafts
      hydrated.value = true
    } catch (error) {
      if (epoch !== packEpoch()) return
      console.error('Failed to load progress from API:', error)
      hydrated.value = true
    } finally {
      if (epoch === packEpoch()) hydratePromise = null
    }
  })()
  return hydratePromise
}

export const useProgress = () => {
  const requestPackId = useSettingsStore().packId
  const { apiFetch } = usePackRequest(requestPackId)
  const requestEpoch = packEpoch()
  // A session that finishes after a switch may save its own attempt without touching the new view.
  function sessionRef<T>(source: Ref<T>) {
    let last = source.value
    return computed({
      get: () => requestEpoch === packEpoch() ? (last = source.value) : last,
      set: (value: T) => { last = value; if (requestEpoch === packEpoch()) source.value = value },
    })
  }
  const readingProgress = sessionRef(progressSources.readingProgress)
  const readingSession = sessionRef(progressSources.readingSession)
  const writingProgress = sessionRef(progressSources.writingProgress)
  const writingDrafts = sessionRef(progressSources.writingDrafts)
  const listeningProgress = sessionRef(progressSources.listeningProgress)
  const speakingProgress = sessionRef(progressSources.speakingProgress)
  const getProgressData = (): Record<string, QuizProgress> => readingProgress.value

  const saveQuizCompletion = (textId: string, score: number, totalQuestions: number, responses: ObjectiveAnswers = {}) => {
    const percentage = Math.round((score / totalQuestions) * 100)
    const completedAt = new Date().toISOString()
    const current = readingProgress.value[textId]
    readingProgress.value = {
      ...readingProgress.value,
      [textId]: {
        textId,
        completed: true,
        score,
        totalQuestions,
        percentage,
        completedAt,
        attemptCount: (current?.attemptCount || 0) + 1,
        bestScore: Math.max(current?.bestScore || 0, score),
      },
    }
    void apiFetch('/attempts', {
      packId: requestPackId,
      method: 'POST',
      body: {
        skill: 'READING',
        exerciseExternalId: textId,
        answers: { score, totalQuestions, responses },
        result: { score, maxScore: totalQuestions, percentage },
      },
    }).catch(error => console.warn('Failed to save reading attempt', error))
  }

  const saveSession = (
    textId: string,
    currentQuestionIndex: number,
    answers: ObjectiveAnswers
  ) => {
    const session = {
      textId,
      currentQuestionIndex,
      answers,
      startedAt: readingSession.value?.startedAt ?? new Date().toISOString(),
    }
    readingSession.value = session
    void apiFetch(`/drafts/READING/${encodeURIComponent(textId)}`, {
      packId: requestPackId,
      method: 'PUT',
      body: { payload: session },
    }).catch(error => console.warn('Failed to save reading session', error))
  }

  const getSession = () => readingSession.value

  const clearSession = () => {
    const textId = readingSession.value?.textId
    readingSession.value = null
    if (!textId) return
    void apiFetch(`/drafts/READING/${encodeURIComponent(textId)}`, { method: 'DELETE', packId: requestPackId }).catch(
      () => undefined
    )
  }

  const getProgressStats = (): ProgressStats => {
    const progressData = getProgressData()
    const completedTexts = Object.values(progressData).filter(item => item.completed)
    if (completedTexts.length === 0) {
      return {
        totalTextsCompleted: 0,
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        recentActivity: [],
        completionRate: 0,
      }
    }
    const totalAttempts = completedTexts.reduce((sum, item) => sum + (item.attemptCount || 1), 0)
    const totalPossibleScore = completedTexts.reduce((sum, item) => sum + item.totalQuestions, 0)
    const totalActualScore = completedTexts.reduce(
      (sum, item) => sum + (item.bestScore || item.score),
      0
    )
    const recentActivity = completedTexts
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5)
    return {
      totalTextsCompleted: completedTexts.length,
      totalAttempts,
      averageScore:
        totalPossibleScore > 0 ? Math.round((totalActualScore / totalPossibleScore) * 100) : 0,
      bestScore: Math.max(...completedTexts.map(item => item.percentage)),
      recentActivity,
      completionRate:
        Math.round((completedTexts.length / Object.keys(progressData).length) * 100) || 0,
    }
  }

  const getTextProgress = (textId: string): QuizProgress | null =>
    readingProgress.value[textId] || null
  const isTextCompleted = (textId: string): boolean => Boolean(getTextProgress(textId)?.completed)
  const getBestScore = (textId: string): number =>
    getTextProgress(textId)?.bestScore || getTextProgress(textId)?.score || 0

  const getWritingProgressData = (): Record<string, WritingProgress> => writingProgress.value

  const saveWritingSubmission = (
    topicId: string,
    content: string,
    wordCount: number,
    timeSpent?: number,
    feedback?: WritingFeedbackModel,
    /** Form-fill entries keyed by field id, stored alongside so each field resolves on its own. */
    fields?: Record<string, string>
  ) => {
    const submissionId = `${topicId}-${Date.now()}`
    const submittedAt = new Date().toISOString()
    const current = writingProgress.value[topicId] || {
      topicId,
      completed: false,
      attemptCount: 0,
      submissions: [],
    }
    const newSubmission: WritingSubmission = {
      id: submissionId,
      topicId,
      content,
      wordCount,
      submittedAt,
      timeSpent: timeSpent || 0,
      isDraft: false,
      ...(feedback && { feedback }),
    }
    writingProgress.value = {
      ...writingProgress.value,
      [topicId]: {
        ...current,
        completed: true,
        attemptCount: current.attemptCount + 1,
        bestWordCount: Math.max(current.bestWordCount || 0, wordCount),
        completedAt: submittedAt,
        timeSpent: (current.timeSpent || 0) + (timeSpent || 0),
        submissions: [...current.submissions, newSubmission],
      },
    }
    clearWritingSession(topicId)
    void apiFetch('/attempts', {
      packId: requestPackId,
      method: 'POST',
      body: {
        skill: 'WRITING',
        exerciseExternalId: topicId,
        answers: fields ? { ...fields, ...newSubmission } : newSubmission,
      },
    }).catch(error => console.warn('Failed to save writing submission', error))
  }

  const saveWritingDraft = (topicId: string, content: string, wordCount: number) => {
    const existing = writingDrafts.value[topicId]
    const session: WritingSessionModel = {
      topicId,
      content,
      wordCount,
      startedAt: existing?.startedAt ?? new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
    }
    writingDrafts.value = { ...writingDrafts.value, [topicId]: session }
    void apiFetch(`/drafts/WRITING/${encodeURIComponent(topicId)}`, {
      packId: requestPackId,
      method: 'PUT',
      body: { payload: session },
    }).catch(error => console.warn('Failed to save writing draft', error))
  }

  const getWritingSession = (topicId: string): WritingSessionModel | null =>
    writingDrafts.value[topicId] || null

  const clearWritingSession = (topicId: string) => {
    const { [topicId]: _removed, ...rest } = writingDrafts.value
    writingDrafts.value = rest
    void apiFetch(`/drafts/WRITING/${encodeURIComponent(topicId)}`, { method: 'DELETE', packId: requestPackId }).catch(
      () => undefined
    )
  }

  const getAllWritingSessions = (): WritingSessionModel[] =>
    Object.values(writingDrafts.value).sort(
      (a, b) => new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime()
    )

  const getWritingStats = (): WritingStats => {
    const progressData = getWritingProgressData()
    const completedTopics = Object.values(progressData).filter(item => item.completed)
    if (completedTopics.length === 0) {
      return {
        totalTopicsCompleted: 0,
        totalSubmissions: 0,
        averageWordCount: 0,
        totalTimeSpent: 0,
        recentActivity: [],
        completionRate: 0,
      }
    }
    const totalSubmissions = completedTopics.reduce((sum, item) => sum + item.submissions.length, 0)
    const totalWords = completedTopics.reduce((sum, item) => sum + (item.bestWordCount || 0), 0)
    const totalTime = completedTopics.reduce((sum, item) => sum + (item.timeSpent || 0), 0)
    const recentActivity = completedTopics
      .filter(item => item.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5)
    return {
      totalTopicsCompleted: completedTopics.length,
      totalSubmissions,
      averageWordCount: Math.round(totalWords / completedTopics.length),
      totalTimeSpent: totalTime,
      recentActivity,
      completionRate: Math.round((completedTopics.length / 8) * 100),
    }
  }

  const getWritingTopicProgress = (topicId: string): WritingProgress | null =>
    writingProgress.value[topicId] || null
  const isWritingTopicCompleted = (topicId: string): boolean =>
    Boolean(getWritingTopicProgress(topicId)?.completed)
  const getBestWordCount = (topicId: string): number =>
    getWritingTopicProgress(topicId)?.bestWordCount || 0
  const getLatestSubmission = (topicId: string): WritingSubmission | null => {
    const progress = getWritingTopicProgress(topicId)
    if (!progress || progress.submissions.length === 0) return null
    return (
      [...progress.submissions].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )[0] || null
    )
  }

  const getListeningProgressData = (): Record<string, ListeningProgress> => listeningProgress.value

  const saveListeningCompletion = (exerciseId: string, score: number, totalQuestions: number, responses: ObjectiveAnswers = {}) => {
    const percentage = Math.round((score / totalQuestions) * 100)
    const completedAt = new Date().toISOString()
    const current = listeningProgress.value[exerciseId]
    listeningProgress.value = {
      ...listeningProgress.value,
      [exerciseId]: {
        textId: exerciseId,
        completed: true,
        score,
        totalQuestions,
        percentage,
        completedAt,
        attemptCount: (current?.attemptCount || 0) + 1,
        bestScore: Math.max(current?.bestScore || 0, score),
      },
    }
    void apiFetch('/attempts', {
      packId: requestPackId,
      method: 'POST',
      body: {
        skill: 'LISTENING',
        exerciseExternalId: exerciseId,
        answers: { score, totalQuestions, responses },
        result: { score, maxScore: totalQuestions, percentage },
      },
    }).catch(error => console.warn('Failed to save listening attempt', error))
  }

  const getListeningProgress = (exerciseId: string): ListeningProgress | null =>
    listeningProgress.value[exerciseId] || null
  const isListeningCompleted = (exerciseId: string): boolean =>
    Boolean(getListeningProgress(exerciseId)?.completed)

  const getSpeakingProgressData = (): Record<string, SpeakingProgress> => speakingProgress.value

  const saveSpeakingAttempt = (
    topicId: string,
    attempt: {
      durationSec: number
      transcript?: string
      transcripts?: SpeakingTranscripts
      review?: CriterionReview
      selfScore?: number
    }
  ) => {
    const submittedAt = new Date().toISOString()
    const current = speakingProgress.value[topicId] || {
      topicId,
      completed: false,
      attemptCount: 0,
      attempts: [],
    }
    const newAttempt: SpeakingAttempt = {
      id: `${topicId}-${Date.now()}`,
      topicId,
      durationSec: attempt.durationSec,
      submittedAt,
      ...(attempt.transcript !== undefined && { transcript: attempt.transcript }),
      ...(attempt.transcripts !== undefined && { transcripts: attempt.transcripts }),
      ...(attempt.review !== undefined && { review: attempt.review }),
      ...(attempt.selfScore !== undefined && { selfScore: attempt.selfScore }),
    }
    speakingProgress.value = {
      ...speakingProgress.value,
      [topicId]: {
        ...current,
        completed: true,
        attemptCount: current.attemptCount + 1,
        completedAt: submittedAt,
        ...(attempt.selfScore !== undefined && {
          bestSelfScore: Math.max(current.bestSelfScore || 0, attempt.selfScore),
        }),
        ...(attempt.review !== undefined && {
          bestPoints: Math.max(current.bestPoints || 0, attempt.review.totalPoints),
          bestMaxPoints: attempt.review.maxPoints,
        }),
        attempts: [...current.attempts, newAttempt],
      },
    }
    void apiFetch('/attempts', {
      packId: requestPackId,
      method: 'POST',
      body: {
        skill: 'SPEAKING',
        exerciseExternalId: topicId,
        answers: newAttempt,
        result: { review: newAttempt },
      },
    }).catch(error => console.warn('Failed to save speaking attempt', error))
  }

  const getSpeakingProgress = (topicId: string): SpeakingProgress | null =>
    speakingProgress.value[topicId] || null
  const isSpeakingCompleted = (topicId: string): boolean =>
    Boolean(getSpeakingProgress(topicId)?.completed)

  if (import.meta.client) requested = true
  if (import.meta.client && !hydrated.value) {
    void hydrate()
  }

  return {
    getProgressData,
    saveQuizCompletion,
    getProgressStats,
    getTextProgress,
    saveSession,
    getSession,
    clearSession,
    isTextCompleted,
    getBestScore,
    getWritingProgressData,
    saveWritingSubmission,
    saveWritingDraft,
    getWritingSession,
    clearWritingSession,
    getAllWritingSessions,
    getWritingStats,
    getWritingTopicProgress,
    isWritingTopicCompleted,
    getBestWordCount,
    getLatestSubmission,
    getListeningProgressData,
    saveListeningCompletion,
    getListeningProgress,
    isListeningCompleted,
    getSpeakingProgressData,
    saveSpeakingAttempt,
    getSpeakingProgress,
    isSpeakingCompleted,
    hydrate,
  }
}
