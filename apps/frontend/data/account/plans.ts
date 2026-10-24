import type { PlanId } from '~/composables/useAccountProfile'

export interface Plan {
  id: PlanId
  nameKey: string
  price: string
  periodKey: string
  blurbKey: string
  featureKeys: string[]
}

/** Subscription plans (presentation only — no functional gating). */
export const plans: Plan[] = [
  {
    id: 'free',
    nameKey: 'account.planFree',
    price: '€0',
    periodKey: 'account.planForever',
    blurbKey: 'account.planFreeBlurb',
    featureKeys: [
      'account.featureAllPractice',
      'account.featureSelfChecked',
      'account.featureBasicProgress',
      'account.featureOneMock',
    ],
  },
  {
    id: 'pro',
    nameKey: 'account.planPro',
    price: '€9.90',
    periodKey: 'account.planPerMonth',
    blurbKey: 'account.planProBlurb',
    featureKeys: [
      'account.featureEverythingFree',
      'account.featureUnlimitedAi',
      'account.featureFullMockLibrary',
      'account.featureWeakSpots',
    ],
  },
]
