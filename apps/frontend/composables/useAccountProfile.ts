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
  createdAt: string
  emailVerified: boolean
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
      createdAt: '',
      emailVerified: false,
    }
  }
  return {
    name: user.name,
    email: user.email,
    examTargetDate: user.examTargetDate ?? '',
    plan: toLocalPlan(user.plan),
    createdAt: user.createdAt,
    emailVerified: user.emailVerified,
  }
}

export const useAccountProfile = () => {
  const { user, updateProfile } = useAuth()
  const { locale, localeProperties } = useI18n()

  const profile = computed(() => fromUser(user.value))

  const demoPlan = useState<PlanId | null>('account-demo-plan', () => null)
  const effectivePlan = computed<PlanId>(() => demoPlan.value ?? profile.value.plan)

  function setDemoPlan(plan: PlanId) {
    demoPlan.value = plan
  }

  const hasExamDate = computed(() => {
    if (!profile.value.examTargetDate) return false
    const target = new Date(profile.value.examTargetDate)
    return !Number.isNaN(target.getTime())
  })

  const daysUntilExam = computed<number>(() => {
    if (!hasExamDate.value) return 0
    const target = new Date(profile.value.examTargetDate)
    return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000))
  })

  const firstName = computed(() => profile.value.name.trim().split(/\s+/).filter(Boolean)[0] ?? '')

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

  function formatDate(
    iso: string,
    options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  ): string {
    if (!iso) return '—'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '—'
    // English keeps the day-month-year order it has always had; other locales use their own tag.
    const tag = locale.value === 'en' ? 'en-GB' : localeProperties.value.language
    return date.toLocaleDateString(tag, options)
  }

  const memberSince = computed(() =>
    formatDate(profile.value.createdAt, { month: 'short', year: 'numeric' })
  )

  return {
    // State
    profile,
    hasExamDate,
    daysUntilExam,
    firstName,
    initials,
    effectivePlan,
    memberSince,
    // Methods
    saveProfile,
    setDemoPlan,
    formatDate,
  }
}
