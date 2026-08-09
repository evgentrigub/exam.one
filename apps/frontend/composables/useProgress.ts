import type { WritingSubmission, WritingFeedbackModel } from '~/utils/types'
import type { SpeakingReviewData, SpeakingTranscripts } from '~/utils/exercises/speaking'

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

// Writing Progress Interfaces (Stage 11)
interface WritingProgress {
  topicId: string
  completed: boolean
  attemptCount: number
  bestWordCount?: number
  completedAt?: string
  timeSpent?: number // in seconds
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

// Listening progress (MCQ-scored, mirrors reading quiz model)
export type ListeningProgress = QuizProgress

// Speaking progress (attempt-based, with optional STT transcripts + AI review)
export interface SpeakingAttempt {
  id: string
  topicId: string
  durationSec: number
  transcript?: string
  transcripts?: SpeakingTranscripts
  review?: SpeakingReviewData
  selfScore?: number // optional 1-5 self assessment
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

export const useProgress = () => {
  const STORAGE_KEY = 'quiz-progress'
  const SESSION_STORAGE_KEY = 'quiz-session'

  // Writing progress storage keys (Stage 11)
  const WRITING_STORAGE_KEY = 'exam-one:writing:progress'
  const WRITING_STORAGE_LEGACY_KEY = 'writing-progress'
  const WRITING_SESSION_KEY = 'exam-one:writing:session'
  const WRITING_SESSION_LEGACY_KEY = 'writing-session'

  // Listening + speaking progress keys (exam-one: standard prefix)
  const LISTENING_STORAGE_KEY = 'exam-one:listening:progress'
  const SPEAKING_STORAGE_KEY = 'exam-one:speaking:progress'

  /**
   * Get all progress data from localStorage
   */
  const getProgressData = (): Record<string, QuizProgress> => {
    if (import.meta.client) {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    }
    return {}
  }

  /**
   * Save quiz completion to localStorage
   */
  const saveQuizCompletion = (textId: string, score: number, totalQuestions: number) => {
    if (!import.meta.client) return

    const percentage = Math.round((score / totalQuestions) * 100)
    const completedAt = new Date().toISOString()

    const existingProgress = getProgressData()
    const currentProgress = existingProgress[textId]

    const newProgress: QuizProgress = {
      textId,
      completed: true,
      score,
      totalQuestions,
      percentage,
      completedAt,
      attemptCount: (currentProgress?.attemptCount || 0) + 1,
      bestScore: Math.max(currentProgress?.bestScore || 0, score),
    }

    existingProgress[textId] = newProgress
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingProgress))
  }

  /**
   * Save incomplete session for resume functionality
   */
  const saveSession = (
    textId: string,
    currentQuestionIndex: number,
    answers: Record<string, number>
  ) => {
    if (!import.meta.client) return

    const session = {
      textId,
      currentQuestionIndex,
      answers,
      startedAt: new Date().toISOString(),
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }

  /**
   * Get incomplete session for resume
   */
  const getSession = () => {
    if (!import.meta.client) return null

    const data = localStorage.getItem(SESSION_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  }

  /**
   * Clear incomplete session
   */
  const clearSession = () => {
    if (!import.meta.client) return
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }

  /**
   * Calculate comprehensive progress statistics
   */
  const getProgressStats = (): ProgressStats => {
    const progressData = getProgressData()
    const completedTexts = Object.values(progressData).filter(p => p.completed)

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

    const totalAttempts = completedTexts.reduce((sum, p) => sum + (p.attemptCount || 1), 0)
    const totalPossibleScore = completedTexts.reduce((sum, p) => sum + p.totalQuestions, 0)
    const totalActualScore = completedTexts.reduce((sum, p) => sum + (p.bestScore || p.score), 0)

    // Recent activity (last 5 completed quizzes, sorted by completion date)
    const recentActivity = completedTexts
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5)

    return {
      totalTextsCompleted: completedTexts.length,
      totalAttempts,
      averageScore: Math.round((totalActualScore / totalPossibleScore) * 100),
      bestScore: Math.max(...completedTexts.map(p => p.percentage)),
      recentActivity,
      completionRate:
        Math.round((completedTexts.length / Object.keys(progressData).length) * 100) || 0,
    }
  }

  /**
   * Get progress for specific text
   */
  const getTextProgress = (textId: string): QuizProgress | null => {
    const progressData = getProgressData()
    return progressData[textId] || null
  }

  /**
   * Check if text is completed
   */
  const isTextCompleted = (textId: string): boolean => {
    const progress = getTextProgress(textId)
    return progress?.completed || false
  }

  /**
   * Get best score for specific text
   */
  const getBestScore = (textId: string): number => {
    const progress = getTextProgress(textId)
    return progress?.bestScore || progress?.score || 0
  }

  // ============================================
  // WRITING PROGRESS FUNCTIONS (Stage 11)
  // ============================================

  const readWritingProgressStorage = (): Record<string, WritingProgress> => {
    if (!import.meta.client) return {}

    try {
      const data =
        localStorage.getItem(WRITING_STORAGE_KEY) ||
        localStorage.getItem(WRITING_STORAGE_LEGACY_KEY)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  const getWritingSessionKey = (topicId: string) => `${WRITING_SESSION_KEY}:${topicId}`
  const getLegacyWritingSessionKey = (topicId: string) => `${WRITING_SESSION_LEGACY_KEY}-${topicId}`

  /**
   * Get all writing progress data from localStorage
   */
  const getWritingProgressData = (): Record<string, WritingProgress> => readWritingProgressStorage()

  /**
   * Save writing submission to localStorage with evaluation (Stage 12)
   */
  const saveWritingSubmission = (
    topicId: string,
    content: string,
    wordCount: number,
    timeSpent?: number,
    feedback?: WritingFeedbackModel
  ) => {
    if (!import.meta.client) return

    const submissionId = `${topicId}-${Date.now()}`
    const submittedAt = new Date().toISOString()

    const existingProgress = getWritingProgressData()
    const currentProgress = existingProgress[topicId] || {
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
      ...(feedback && { feedback }), // Stage 12: Store evaluation results (only if provided)
    }

    const updatedProgress: WritingProgress = {
      ...currentProgress,
      completed: true,
      attemptCount: currentProgress.attemptCount + 1,
      bestWordCount: Math.max(currentProgress.bestWordCount || 0, wordCount),
      completedAt: submittedAt,
      timeSpent: (currentProgress.timeSpent || 0) + (timeSpent || 0),
      submissions: [...currentProgress.submissions, newSubmission],
    }

    const updatedProgressData = {
      ...existingProgress,
      [topicId]: updatedProgress,
    }
    try {
      localStorage.setItem(WRITING_STORAGE_KEY, JSON.stringify(updatedProgressData))
    } catch (error) {
      console.warn('Failed to save writing progress:', error)
    }

    // Clear any draft for this topic
    clearWritingSession(topicId)
  }

  /**
   * Save writing draft to localStorage
   */
  const saveWritingDraft = (topicId: string, content: string, wordCount: number) => {
    if (!import.meta.client) return

    const session: WritingSessionModel = {
      topicId,
      content,
      wordCount,
      startedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(getWritingSessionKey(topicId), JSON.stringify(session))
    } catch (error) {
      console.warn('Failed to save writing draft:', error)
    }
  }

  /**
   * Get writing draft/session for specific topic
   */
  const getWritingSession = (topicId: string): WritingSessionModel | null => {
    if (!import.meta.client) return null

    try {
      const data =
        localStorage.getItem(getWritingSessionKey(topicId)) ||
        localStorage.getItem(getLegacyWritingSessionKey(topicId))
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  /**
   * Clear writing session/draft for specific topic
   */
  const clearWritingSession = (topicId: string) => {
    if (!import.meta.client) return
    localStorage.removeItem(getWritingSessionKey(topicId))
    localStorage.removeItem(getLegacyWritingSessionKey(topicId))
  }

  /**
   * Get all writing sessions (drafts) for resume functionality
   */
  const getAllWritingSessions = (): WritingSessionModel[] => {
    if (!import.meta.client) return []

    const sessions: WritingSessionModel[] = []

    // Look for all writing session keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (
        key &&
        (key.startsWith(`${WRITING_SESSION_KEY}:`) ||
          key.startsWith(`${WRITING_SESSION_LEGACY_KEY}-`))
      ) {
        try {
          const sessionData = localStorage.getItem(key)
          if (sessionData) {
            const session = JSON.parse(sessionData)
            sessions.push(session)
          }
        } catch (error) {
          // Skip invalid session data
          console.warn(`Invalid writing session data for key: ${key}`, error)
        }
      }
    }

    return sessions.sort(
      (a, b) => new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime()
    )
  }

  /**
   * Calculate comprehensive writing progress statistics
   */
  const getWritingStats = (): WritingStats => {
    const progressData = getWritingProgressData()
    const completedTopics = Object.values(progressData).filter(p => p.completed)

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

    const totalSubmissions = completedTopics.reduce((sum, p) => sum + p.submissions.length, 0)
    const totalWords = completedTopics.reduce((sum, p) => sum + (p.bestWordCount || 0), 0)
    const totalTime = completedTopics.reduce((sum, p) => sum + (p.timeSpent || 0), 0)

    // Recent activity (last 5 completed topics, sorted by completion date)
    const recentActivity = completedTopics
      .filter(p => p.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5)

    // Calculate completion rate based on total available topics
    const totalAvailableTopics = 8 // Current number of topics, could be dynamic

    return {
      totalTopicsCompleted: completedTopics.length,
      totalSubmissions,
      averageWordCount: Math.round(totalWords / completedTopics.length),
      totalTimeSpent: totalTime,
      recentActivity,
      completionRate: Math.round((completedTopics.length / totalAvailableTopics) * 100),
    }
  }

  /**
   * Get progress for specific writing topic
   */
  const getWritingTopicProgress = (topicId: string): WritingProgress | null => {
    const progressData = getWritingProgressData()
    return progressData[topicId] || null
  }

  /**
   * Check if writing topic is completed
   */
  const isWritingTopicCompleted = (topicId: string): boolean => {
    const progress = getWritingTopicProgress(topicId)
    return progress?.completed || false
  }

  /**
   * Get best word count for specific writing topic
   */
  const getBestWordCount = (topicId: string): number => {
    const progress = getWritingTopicProgress(topicId)
    return progress?.bestWordCount || 0
  }

  /**
   * Get latest submission for specific writing topic
   */
  const getLatestSubmission = (topicId: string): WritingSubmission | null => {
    const progress = getWritingTopicProgress(topicId)
    if (!progress || progress.submissions.length === 0) return null

    const latest = [...progress.submissions].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )[0]

    return latest || null
  }

  // ============================================
  // LISTENING PROGRESS FUNCTIONS
  // ============================================

  const getListeningProgressData = (): Record<string, ListeningProgress> => {
    if (import.meta.client) {
      const data = localStorage.getItem(LISTENING_STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    }
    return {}
  }

  const saveListeningCompletion = (exerciseId: string, score: number, totalQuestions: number) => {
    if (!import.meta.client) return

    const percentage = Math.round((score / totalQuestions) * 100)
    const completedAt = new Date().toISOString()

    const existing = getListeningProgressData()
    const current = existing[exerciseId]

    existing[exerciseId] = {
      textId: exerciseId,
      completed: true,
      score,
      totalQuestions,
      percentage,
      completedAt,
      attemptCount: (current?.attemptCount || 0) + 1,
      bestScore: Math.max(current?.bestScore || 0, score),
    }

    localStorage.setItem(LISTENING_STORAGE_KEY, JSON.stringify(existing))
  }

  const getListeningProgress = (exerciseId: string): ListeningProgress | null => {
    return getListeningProgressData()[exerciseId] || null
  }

  const isListeningCompleted = (exerciseId: string): boolean => {
    return getListeningProgress(exerciseId)?.completed || false
  }

  // ============================================
  // SPEAKING PROGRESS FUNCTIONS
  // ============================================

  const getSpeakingProgressData = (): Record<string, SpeakingProgress> => {
    if (import.meta.client) {
      try {
        const data = localStorage.getItem(SPEAKING_STORAGE_KEY)
        return data ? JSON.parse(data) : {}
      } catch {
        return {}
      }
    }
    return {}
  }

  const saveSpeakingAttempt = (
    topicId: string,
    attempt: {
      durationSec: number
      transcript?: string
      transcripts?: SpeakingTranscripts
      review?: SpeakingReviewData
      selfScore?: number
    }
  ) => {
    if (!import.meta.client) return

    const submittedAt = new Date().toISOString()
    const existing = getSpeakingProgressData()
    const current = existing[topicId] || {
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

    existing[topicId] = {
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
    }

    try {
      localStorage.setItem(SPEAKING_STORAGE_KEY, JSON.stringify(existing))
    } catch (error) {
      console.warn('Failed to save speaking progress:', error)
    }
  }

  const getSpeakingProgress = (topicId: string): SpeakingProgress | null => {
    return getSpeakingProgressData()[topicId] || null
  }

  const isSpeakingCompleted = (topicId: string): boolean => {
    return getSpeakingProgress(topicId)?.completed || false
  }

  return {
    // Data operations (Reading)
    getProgressData,
    saveQuizCompletion,
    getProgressStats,
    getTextProgress,

    // Session management (Reading)
    saveSession,
    getSession,
    clearSession,

    // Utility functions (Reading)
    isTextCompleted,
    getBestScore,

    // Writing progress functions (Stage 11)
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

    // Listening progress functions
    getListeningProgressData,
    saveListeningCompletion,
    getListeningProgress,
    isListeningCompleted,

    // Speaking progress functions
    getSpeakingProgressData,
    saveSpeakingAttempt,
    getSpeakingProgress,
    isSpeakingCompleted,
  }
}
