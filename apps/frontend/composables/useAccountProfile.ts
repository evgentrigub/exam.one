/**
 * useAccountProfile
 * Profile from NestJS session (Phase 2.2+).
 */

import type { PlanId as ContractPlanId, UserDto } from '@exam-one/contracts'

export type PlanId = 'free' | 'pro'

export interface AccountProfile {
  name: string
  email: string
  examTargetDate: string
  plan: PlanId
}

function toLocalPlan(plan: ContractPlanId | string): PlanId {
  return plan === 'PRO' || plan === 'pro' ? 'pro' : 'free'
}

function fromUser(user: UserDto | null): AccountProfile {
  if (!user) {
    return {
      name: '',
      email: '',
      examTargetDate: '',
      plan: 'free',
    }
  }
  return {
    name: user.name,
    email: user.email,
    examTargetDate: user.examTargetDate ?? '',
    plan: toLocalPlan(user.plan),
  }
}

export const useAccountProfile = () => {
  const { user, updateProfile } = useAuth()

  const profile = computed(() => fromUser(user.value))

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

  async function saveProfile(input: {
    name: string
    email: string
    examTargetDate: string
  }): Promise<void> {
    await updateProfile({
      name: input.name,
      email: input.email,
      examTargetDate: input.examTargetDate || null,
    })
  }

  return {
    // State
    profile,
    daysUntilExam,
    initials,
    // Methods
    saveProfile,
  }
}
