/**
 * useSkillStats
 * Aggregates per-skill readiness across all four skills from real progress data
 * (offline-first). Used by the Dashboard and Progress pages.
 *
 * Readiness model (no network, no mock scores):
 * - reading / listening: average of best MCQ percentages across level exercises
 *   (unattempted count as 0).
 * - writing / speaking: completion ratio across level exercises (×100), since
 *   there is no normalized offline score for open-ended answers.
 */

import { storeToRefs } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { useReadingTexts } from '~/composables/useReadingTexts'
import { useWritingTopics } from '~/composables/useWritingTopics'
import { useListeningExercises } from '~/composables/useListeningExercises'
import { useSpeakingExercises } from '~/composables/useSpeakingExercises'
import { useProgress } from '~/composables/useProgress'
import { SKILLS, type SkillId } from '~/utils/labels'

export interface SkillStat {
  id: SkillId
  total: number
  completed: number
  /** 0-100 readiness estimate. */
  readiness: number
  /** Best single percentage seen (reading/listening) or 0 otherwise. */
  best: number
  /** Number of attempts/sessions logged for this skill. */
  sessions: number
}

export interface RecentActivityItem {
  id: string
  skill: SkillId
  title: string
  detail: string
  percentage?: number
  completedAt: string
}

export const useSkillStats = () => {
  const { t } = useI18n()
  const settingsStore = useSettingsStore()
  const { examLevel } = storeToRefs(settingsStore)

  const { getTexts } = useReadingTexts()
  const { getTopics } = useWritingTopics()
  const { getExercises: getListening } = useListeningExercises()
  const { getTopics: getSpeaking } = useSpeakingExercises()
  const {
    getProgressData,
    getWritingProgressData,
    getListeningProgressData,
    getSpeakingProgressData,
  } = useProgress()

  const average = (values: number[]): number => {
    if (values.length === 0) return 0
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
  }

  const readingStat = (): SkillStat => {
    const items = getTexts().filter(t => t.difficulty === examLevel.value)
    const progress = getProgressData()
    const percentages = items.map(t =>
      progress[t.id]?.bestScore != null
        ? Math.round(((progress[t.id]!.bestScore as number) / progress[t.id]!.totalQuestions) * 100)
        : (progress[t.id]?.percentage ?? 0)
    )
    const completed = items.filter(t => progress[t.id]?.completed).length
    const sessions = items.reduce((sum, t) => sum + (progress[t.id]?.attemptCount ?? 0), 0)
    return {
      id: 'reading',
      total: items.length,
      completed,
      readiness: average(percentages),
      best: percentages.length ? Math.max(...percentages) : 0,
      sessions,
    }
  }

  const listeningStat = (): SkillStat => {
    const items = getListening()
    const progress = getListeningProgressData()
    const percentages = items.map(e => progress[e.id ?? '']?.percentage ?? 0)
    const completed = items.filter(e => progress[e.id ?? '']?.completed).length
    const sessions = items.reduce((sum, e) => sum + (progress[e.id ?? '']?.attemptCount ?? 0), 0)
    return {
      id: 'listening',
      total: items.length,
      completed,
      readiness: average(percentages),
      best: percentages.length ? Math.max(...percentages) : 0,
      sessions,
    }
  }

  const writingStat = (): SkillStat => {
    const items = getTopics().filter(t => t.difficulty === examLevel.value)
    const progress = getWritingProgressData()
    const completed = items.filter(t => progress[t.id]?.completed).length
    const sessions = items.reduce((sum, t) => sum + (progress[t.id]?.attemptCount ?? 0), 0)
    return {
      id: 'writing',
      total: items.length,
      completed,
      readiness: items.length ? Math.round((completed / items.length) * 100) : 0,
      best: 0,
      sessions,
    }
  }

  const speakingStat = (): SkillStat => {
    const items = getSpeaking().filter(t => t.difficulty === examLevel.value)
    const progress = getSpeakingProgressData()
    const completed = items.filter(t => progress[t.id]?.completed).length
    const sessions = items.reduce((sum, t) => sum + (progress[t.id]?.attemptCount ?? 0), 0)
    return {
      id: 'speaking',
      total: items.length,
      completed,
      readiness: items.length ? Math.round((completed / items.length) * 100) : 0,
      best: 0,
      sessions,
    }
  }

  const skillStats = computed<SkillStat[]>(() => [
    readingStat(),
    writingStat(),
    listeningStat(),
    speakingStat(),
  ])

  const getStat = (skill: SkillId): SkillStat =>
    skillStats.value.find(s => s.id === skill) ?? readingStat()

  const overallReadiness = computed<number>(() => average(skillStats.value.map(s => s.readiness)))

  const totalCompleted = computed<number>(() =>
    skillStats.value.reduce((sum, s) => sum + s.completed, 0)
  )

  /** Skills ordered weakest-first (only those with exercises available). */
  const weakestSkills = computed<SkillStat[]>(() =>
    [...skillStats.value].filter(s => s.total > 0).sort((a, b) => a.readiness - b.readiness)
  )

  /** Recent completions across reading + listening (the scored skills). */
  const recentActivity = computed<RecentActivityItem[]>(() => {
    const items: RecentActivityItem[] = []
    const readingProgress = getProgressData()
    const readingTexts = getTexts()
    Object.values(readingProgress)
      .filter(p => p.completed)
      .forEach(p => {
        const text = readingTexts.find(candidate => candidate.id === p.textId)
        items.push({
          id: p.textId,
          skill: 'reading',
          title: text?.title ?? t('status.untitledReading'),
          detail: t('status.correctCount', { score: p.score, total: p.totalQuestions }),
          percentage: p.percentage,
          completedAt: p.completedAt,
        })
      })

    const listeningProgress = getListeningProgressData()
    const listeningItems = getListening()
    Object.values(listeningProgress)
      .filter(p => p.completed)
      .forEach(p => {
        const ex = listeningItems.find(e => e.id === p.textId)
        items.push({
          id: p.textId,
          skill: 'listening',
          title: ex?.title ?? t('status.untitledListening'),
          detail: t('status.correctCount', { score: p.score, total: p.totalQuestions }),
          percentage: p.percentage,
          completedAt: p.completedAt,
        })
      })

    return items
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 6)
  })

  return {
    // State
    skillStats,
    overallReadiness,
    totalCompleted,
    weakestSkills,
    recentActivity,
    skillsMeta: SKILLS,

    // Methods
    getStat,
  }
}
