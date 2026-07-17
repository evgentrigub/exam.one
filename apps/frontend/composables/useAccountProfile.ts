/**
 * useAccountProfile
 * Local-first user profile (name, exam target, plan). Persisted under the
 * standard exam-one: key. No backend in Phase 1.
 */

import { useLocalStorage } from '@vueuse/core'

export type PlanId = 'free' | 'pro'

export interface AccountProfile {
  name: string
  email: string
  examTargetDate: string // ISO date (yyyy-mm-dd)
  plan: PlanId
}

const STORAGE_KEY = 'exam-one:account:profile'

function defaultTargetDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 56)
  return d.toISOString().slice(0, 10)
}

const defaults: AccountProfile = {
  name: 'Lena Bauer',
  email: 'lena.bauer@email.de',
  examTargetDate: defaultTargetDate(),
  plan: 'free',
}

export const useAccountProfile = () => {
  const profile = useLocalStorage<AccountProfile>(STORAGE_KEY, { ...defaults }, {
    initOnMounted: true,
    mergeDefaults: true,
  })

  const daysUntilExam = computed<number>(() => {
    if (!profile.value.examTargetDate) return 0
    const target = new Date(profile.value.examTargetDate)
    if (Number.isNaN(target.getTime())) return 0
    return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000))
  })

  const initials = computed<string>(() => {
    const parts = profile.value.name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'EX'
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
  })

  return {
    // State
    profile,
    daysUntilExam,
    initials,
  }
}
