/**
 * Progress tracking composable for German A2 Reading Trainer
 * Handles localStorage operations, stats calculation, and session management
 */

// Removed unused imports - using inline types instead

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

export const useProgress = () => {
  const STORAGE_KEY = 'quiz-progress'
  const SESSION_STORAGE_KEY = 'quiz-session'

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
      bestScore: Math.max(currentProgress?.bestScore || 0, score)
    }
    
    existingProgress[textId] = newProgress
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingProgress))
  }

  /**
   * Save incomplete session for resume functionality
   */
  const saveSession = (textId: string, currentQuestionIndex: number, answers: Record<string, number>) => {
    if (!import.meta.client) return

    const session = {
      textId,
      currentQuestionIndex,
      answers,
      startedAt: new Date().toISOString()
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
        completionRate: 0
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
      completionRate: Math.round((completedTexts.length / Object.keys(progressData).length) * 100) || 0
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

  return {
    // Data operations
    getProgressData,
    saveQuizCompletion,
    getProgressStats,
    getTextProgress,
    
    // Session management
    saveSession,
    getSession,
    clearSession,
    
    // Utility functions
    isTextCompleted,
    getBestScore
  }
} 