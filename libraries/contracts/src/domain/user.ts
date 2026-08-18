import type { PlanId } from './enums'

export interface UserDto {
  id: string
  email: string
  name: string
  examTargetDate: string | null
  plan: PlanId
  emailVerified: boolean
  migratedDomains: readonly string[]
  createdAt: string
  updatedAt: string
}
