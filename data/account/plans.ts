import type { PlanId } from '~/composables/useAccountProfile'

export interface Plan {
  id: PlanId
  name: string
  price: string
  period: string
  blurb: string
  features: string[]
}

/** Subscription plans (presentation only — no functional gating in Phase 1). */
export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    period: 'forever',
    blurb: 'Get started with the core exercises.',
    features: [
      'All practice exercises',
      'Self-checked feedback',
      'Basic progress tracking',
      '1 mock exam per level',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€9.90',
    period: 'per month',
    blurb: 'Everything, with unlimited AI review.',
    features: [
      'Everything in Free',
      'Unlimited AI writing & speaking review',
      'Full mock-exam library',
      'Weak-spot drills & insights',
    ],
  },
]
